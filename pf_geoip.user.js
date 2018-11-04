// ==UserScript==
// @name         ProgrammersForumGeoIp
// @namespace    http://programmersforum.ru/
// @version      0.3
// @description  adds country/city info on the page with user IP, as well as current user agent for online user
// @author       Alex P
// @include      http://programmersforum.ru/postings.php?do=getip*
// @include      http://www.programmersforum.ru/postings.php?do=getip*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_geoip.user.js
// ==/UserScript==

(function () {
    'use strict';

    const IPSTACK_API_KEY = 'b890dc8f7bc14c40deb7af6a2f9be451';

    function getJson(url, success, error) {
        $.getJSON(url, function (data) {
            success(data);
        }).fail(function (request) {
                error(`HTTP error ${request.status} ${request.statusText}`);
            });
    }

    function parseUrlQuery(queryStr) {
        const dict = {};
        const queries = queryStr.replace(/^\?/, '').split('&');
        let i;
        for (i = 0; i < queries.length; i++) {
            const parts = queries[i].split('=');
            dict[parts[0]] = parts[1];
        }
        return dict;
    }

    function requestIpApi(ip, success, error) {
        getJson(`http://ip-api.com/json/${ip}`, function (data) {
                if (data.status === 'success') {
                    success({country: data.country, region: data.regionName, city: data.city, isp: data.isp});
                } else {
                    error(`API error ${data.message}`);
                }
            },
            error);
    }

    function requestIpstack(ip, success, error) {
        getJson(`http://api.ipstack.com/${ip}?access_key=${IPSTACK_API_KEY}`, function (data) {
                success({country: data.country_name, region: data.region_name, city: data.city});
            },
            error);
    }

    function loadUserAgentForUser(userId, success, error) {
        $.get('http://www.programmersforum.ru/online.php?s=&sortfield=time&sortorder=desc&who=members&ua=1&pp=50', function (html) {
            const doc = $(html);
            const userNode = doc.find(`#woltable a[href="member.php?u=${userId}"]`);
            if (!userNode.length)
                return;

            const row = userNode.closest('tr');
            const cellHtml = row.find('a[id^="resolveip"]').parent().html();

            const ua = cellHtml.substr(cellHtml.indexOf('<br>') + 4).trim();

            success(ua);
        }).fail(function (request) {
            error(`HTTP error ${request.status} ${request.statusText}`);
        });
    }

    function loadUserAgent(success, error) {
        const urlQuery = parseUrlQuery(window.location.search);

        if (!urlQuery['p']) {
            return;
        }
        const postId = parseInt(urlQuery['p']);

        $.get(`http://www.programmersforum.ru/showpost.php?p=${postId}`, function (html) {
            const doc = $(html);
            const href = doc.find('.bigusername').attr('href');
            const query = parseUrlQuery(href.substr(href.indexOf('?') + 1));
            const userId = query['u'];

            loadUserAgentForUser(userId, success, error);
        }).fail(function (request) {
            error(`HTTP error ${request.status} ${request.statusText}`);
        });
    }

    function formatGeoipData(data) {
        let result = `${data.country}, ${data.region}, ${data.city}`;
        if (data.isp) {
            result += ` (провайдер ${data.isp})`;
        }
        return result;
    }

    function formatError(error) {
        return `<span style="color: red;">${error}</span>`;
    }

    const ipElement = window.document.querySelector('.panelsurround div.panel div div strong');
    if (!ipElement)
        return;

    const ip = ipElement.innerText;

    const container = ipElement.parentNode;

    function appendLine(name, content) {
        function elementFromString(html) {
            const range = document.createRange();
            return range.createContextualFragment(html);
        }

        container.appendChild(elementFromString(`<br>${name}: `));
        container.appendChild(elementFromString(`<strong>${content}</strong>`));
    }

    requestIpApi(ip, function (data) {
        appendLine('Месторасположение (ip-api.com)', formatGeoipData(data));
    }, function (error) {
        appendLine('Месторасположение (ip-api.com)', formatError(error));
    });

    requestIpstack(ip, function (data) {
        appendLine('Месторасположение (ipstack.com)', formatGeoipData(data));
    }, function (error) {
        appendLine('Месторасположение (ipstack.com)', formatError(error));
    });

    loadUserAgent(function (userAgent) {
        appendLine('Текущий User-Agent', userAgent);
    }, function (error) {
        appendLine('Текущий User-Agent', formatError(error));
    });
})();
