// ==UserScript==
// @name         ProgrammersForum Detect Bots
// @namespace    programmersforum.ru
// @version      1.3.1
// @description  add detectBots function that loads the list of online users and counts bots, and logUsers/startLogDaemon functions to save users into IndexedDB
// @author       Alex P
// @include      *programmersforum.ru/*
// @require      https://unpkg.com/dexie@2.0.4/dist/dexie.js
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_detect_bots.user.js
// ==/UserScript==

(function () {
    'use strict';

    function countItems(arr) {
        return arr.reduce((acc, item) => {
            acc[item] = acc[item] ? acc[item] + 1 : 1;
            return acc;
        }, {});
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function identify(users) {
        const botUaParts = [
            'bot', 'crawl', 'spider', 'batch', 'bing',
            'share', 'preview', 'facebook', 'vk.com',
            'curl', 'indy', 'http',
            'media', 'metrics', '(compatible)',
            'zh-cn', 'zh_cn', 'mb2345', 'liebao', 'micromessenger', 'kinza', // chinese https://www.johnlarge.co.uk/blocking-aggressive-chinese-crawlers-scrapers-bots/
        ];

        const ipCounts = countItems(users.map(u => u.ip));
        const subnet3Counts = countItems(users.map(u => u.subnet(3)));
        const subnet2Counts = countItems(users.map(u => u.subnet(2)));

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
                    return this.detections.length;
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

        db().users.bulkPut(users.map(u => ({
            date: new Date(),
            ip: u.ip,
            useragent: u.useragent,
            detections: u.detections,
        })));
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
})();
