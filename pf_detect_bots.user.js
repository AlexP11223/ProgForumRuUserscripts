// ==UserScript==
// @name         ProgrammersForum Detect Bots
// @namespace    programmersforum.ru
// @version      1.9.0
// @description  adds detectBots function that loads the list of online users and counts bots, and logUsers/startLogDaemon functions to save users into IndexedDB
// @author       Alex P
// @include      *programmersforum.ru/*
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js
// @require      https://unpkg.com/dexie@2.0.4/dist/dexie.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
// @require      https://unpkg.com/papaparse@5.1.0/papaparse.min.js
// @require      https://cdn.jsdelivr.net/npm/ua-parser-js@0/dist/ua-parser.min.js
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_detect_bots.user.js
// ==/UserScript==

(function () {
    'use strict';

    const OUTPUT_TIMEZONE = 3;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function isBot(user) {
        return user.detections && user.detections.length;
    }

    function identify(users) {
        const botUaParts = [
            'bot', 'crawl', 'spider', 'batch', 'bing',
            'share', 'preview', 'facebook', 'vk.com',
            'curl', 'indy', 'http',
            'media', 'metrics', '(compatible)',
            'zh-cn', 'zh_cn', 'mb2345', 'liebao', 'micromessenger', 'kinza', // chinese https://www.johnlarge.co.uk/blocking-aggressive-chinese-crawlers-scrapers-bots/
        ];

        const ipCounts = _.countBy(users, 'ip');
        const subnet3Counts = _.countBy(users, u => u.subnet(3));
        const subnet2Counts = _.countBy(users, u => u.subnet(2));

        const detectors = [
            user => user.useragent.length < 20 || botUaParts.some(s => user.useragent.includes(s)) ? 'ua' : null,
            user => ipCounts[user.ip] > 2 ? 'ip' : null,
            user => subnet3Counts[user.subnet(3)] > 5 ? 'subnet3' : null,
            user => subnet2Counts[user.subnet(2)] > 20 ? 'subnet2' : null,
        ];

        return users.map(user => {
            const detections = detectors.map(d => d(user)).filter(Boolean);
            return Object.assign(user, {
                detections,
                isBot: function () {
                    return isBot(this);
                },
            })
        });
    }

    async function loadOnlineUsers(url = '/online.php?s=&sortfield=time&sortorder=desc&who=all&ua=1&pp=200') {
        console.log(`Loading ${url}`);
        const html = await $.get(url);

        const users = $(html).find('[id^=resolveip]').toArray()
            .map(el => ({
                ip: $(el).text().trim(),
                useragent: $(el).parent().text().trim().split('\n').slice(-1)[0].toLowerCase().trim(),
                subnet: function (n) {
                    return this.ip.split('.').slice(0, n).join('.');
                },
            }));

        const nextPageLinks = $(html).find('a[href^=online][rel=next]');
        if (!nextPageLinks.length) {
            return users;
        }

        const nextPageUrl = nextPageLinks[0].href;
        return users.concat(await loadOnlineUsers(nextPageUrl));
    }

    window.detectBots = async function () {
        const users = identify(await loadOnlineUsers());

        const bots = users.filter(u => u.isBot());

        const mapToOutput = u => ({ ip: u.ip, useragent: u.useragent, detections: u.detections.join(', ') });
        console.log(`${bots.length} bots, ${users.length - bots.length} normal users`);
        console.log('Bots:');
        console.log(bots.map(mapToOutput));
        console.log('Normal users:');
        console.log(users.filter(u => !u.isBot()).map(mapToOutput));

        window.onlineUsers = users;
    };

    let _db = null;

    function db() {
        if (!_db) {
            _db = new Dexie('UserLogDatabase');
            _db.version(1).stores({ users: '++, date, ip, useragent, *detections' });
        }
        return _db;
    }

    window.userLogsDb = db;

    window.logUsers = async function () {
        const users = identify(await loadOnlineUsers());

        await db().users.bulkPut(users.map(u => ({
            date: new Date(),
            ip: u.ip,
            useragent: u.useragent,
            detections: u.detections,
        })));
        console.log(`Saved ${users.length} users to db`);
    };

    window.startLogDaemon = async function () {
        while (true) {
            try {
                await logUsers();
            } catch (e) {
                console.log(e);
            }

            await sleep(20 * 60 * 1000);
        }
    };

    window.FILTER_IS_BOT = isBot;
    window.FILTER_IS_NORMAL_USER = user => !isBot(user);

    window.filterUserLogs = async function (filter = () => true, startDate = '2019-10-30 00:00:00+03', endDate = new Date()) {
        return await db().users
            .where('date').between(moment(startDate).toDate(), moment(endDate).toDate())
            .and(filter)
            .toArray();
    };

    window.exportToCsv = function (records, header = [], fileName = 'data.csv') {
        const csv = Papa.unparse([header].concat(records), {
            skipEmptyLines: true,
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8'});
        saveAs(blob, fileName);
    };

    window.exportUsersToCsv = function (users) {
        const header = ['Date/Time', 'IP', 'User-Agent', 'Detections'];
        const records = users.map(u => [
            moment(u.date).utcOffset(OUTPUT_TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
            u.ip,
            u.useragent,
            u.detections.join(', '),
        ]);

        exportToCsv(records, header, 'users.csv');
    };

    window.uniqueUsers = function (users) {
        return _.uniqBy(users, 'ip');
    };

    window.countVisitorsByTime = function (users) {
        return _.countBy(users, u => moment(u.date).utcOffset(OUTPUT_TIMEZONE).seconds(0).milliseconds(0).format('YYYY-MM-DD HH:mm'));
    };

    // some user-agents are truncated
    function isYandexBrowser(ua) {
        return ua.split(' ').pop().indexOf('Ya') === 0;
    }

    function isChrome(ua) {
        return ua.split(' ').pop().indexOf('Ch') === 0;
    }

    function getOsNameVersion(uaData) {
        const name = uaData.os.name;
        const version = uaData.os.version;
        return [name, version].join(' ').trim();
    }

    function getBrowserNameVersion(uaData) {
        let name = uaData.browser.name;
        let version = uaData.browser.version;
        if (name === 'Chrome' && isYandexBrowser(uaData.ua)) {
            name = 'Yandex';
            version = '';
        }
        return [name, version].join(' ').trim();
    }

    window.countUsersOS = function (users) {
        return _.countBy(users, u => getOsNameVersion(UAParser(u.useragent)));
    };

    window.countUsersBrowsers = function (users) {
        return _.countBy(users, u => getBrowserNameVersion(UAParser(u.useragent)));
    };
})();
