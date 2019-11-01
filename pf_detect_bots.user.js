// ==UserScript==
// @name         ProgrammersForum Detect Bots
// @namespace    programmersforum.ru
// @version      1.1
// @description  add detectBots function that loads the list of online users and counts bots
// @author       Alex P
// @include      *programmersforum.ru/*
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

    let ipCounts = {};
    let subnet3Counts = {};
    let subnet2Counts = {};

    function isBot(user) {
        const botUaParts = [
            'bot', 'crawl', 'spider', 'batch', 'bing',
            'share', 'preview', 'facebook', 'vk.com',
            'curl', 'indy', 'http',
            'media', 'metrics', '(compatible)',
            'zh-cn', 'zh_cn', 'mb2345', 'liebao', 'micromessenger', 'kinza', // chinese https://www.johnlarge.co.uk/blocking-aggressive-chinese-crawlers-scrapers-bots/
        ];
        return user.useragent.length < 20 || botUaParts.some(s => user.useragent.includes(s)) ||
            ipCounts[user.ip] > 2 ||
            subnet3Counts[user.subnet(3)] > 5 ||
            subnet2Counts[user.subnet(2)] > 20;
    }

    function showResults(users) {
        ipCounts = countItems(users.map(u => u.ip));
        subnet3Counts = countItems(users.map(u => u.subnet(3)));
        subnet2Counts = countItems(users.map(u => u.subnet(2)));

        const bots = users.filter(isBot);

        console.log(`${bots.length} bots, ${users.length - bots.length} normal users`);
        console.log('Bots:');
        console.log(bots);
        console.log('Normal users:');
        console.log(users.filter(ua => !isBot(ua)));

        window.users = users;
        window.ipCounts = ipCounts;
        window.subnet3Counts = subnet3Counts;
        window.subnet2Counts = subnet2Counts;
    }

    async function loadOnlineUsers(url) {
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
        const users = await loadOnlineUsers('/online.php?s=&sortfield=time&sortorder=desc&who=all&ua=1&pp=200');
        showResults(users);
    }
})();
