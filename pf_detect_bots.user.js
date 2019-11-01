// ==UserScript==
// @name         ProgrammersForum Detect Bots
// @namespace    programmersforum.ru
// @version      1.0
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

    var allUsers = [];

    var ipCounts = {};
    var subnet3Counts = {};
    var subnet2Counts = {};

    function isBot(user) {
        var botUaParts = [
            'bot', 'crawl', 'spider', 'batch', 'bing',
            'share', 'preview', 'facebook', 'vk.com',
            'curl', 'indy', 'http',
            'media', 'metrics', '(compatible)',
            'zh-cn', 'zh_cn', 'mb2345', 'liebao', 'micromessenger', 'kinza', // chinese https://www.johnlarge.co.uk/blocking-aggressive-chinese-crawlers-scrapers-bots/
        ];
        return user.ua.length < 20 || botUaParts.some(s => user.ua.includes(s)) ||
            ipCounts[user.ip] > 2 ||
            subnet3Counts[user.subnet(3)] > 5 ||
            subnet2Counts[user.subnet(2)] > 20;
    }

    function showResults(users) {
        ipCounts = countItems(users.map(u => u.ip));
        subnet3Counts = countItems(users.map(u => u.subnet(3)));
        subnet2Counts = countItems(users.map(u => u.subnet(2)));

        var bots = users.filter(isBot);

        console.log(`${bots.length} bots, ${users.length - bots.length} normal users`);
        console.log('Bots:');
        console.log(bots);
        console.log('Normal users:');
        console.log(users.filter(ua => !isBot(ua)));

        window.allUsers = allUsers;
        window.ipCounts = ipCounts;
        window.subnet3Counts = subnet3Counts;
        window.subnet2Counts = subnet2Counts;
    }

    function loadOnlineUsers(url) {
        $.get(url, html => {
            var users = $(html).find('[id^=resolveip]').toArray()
                .map(el => ({
                    ip: $(el).text().trim(),
                    ua: $(el).parent().text().trim().split('\n').slice(-1)[0].toLowerCase().trim(),
                    subnet: function (n) {
                        return this.ip.split('.').slice(0, n).join('.');
                    },
                }));
            allUsers = allUsers.concat(users);

            var nextPageLinks = $(html).find('a[href^=online][title^=Следующая]');
            if (nextPageLinks.length) {
                var nextPageUrl = nextPageLinks[0].href;
                console.log(nextPageUrl);
                loadOnlineUsers(nextPageUrl)
            } else {
                showResults(allUsers);
            }
        });
    }

    window.detectBots = function () {
        loadOnlineUsers('/online.php?s=&sortfield=time&sortorder=desc&who=all&ua=1&pp=200');
    }
})();
