// ==UserScript==
// @name         ProgrammersForumGeoIp
// @namespace    http://programmersforum.ru/
// @version      0.4
// @description  adds country/city info on the page with user IP, as well as current user agent, IP for online user
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

    function getSecurityToken(html) {
        const m = html.match(/var SECURITYTOKEN = "(.+)"/);
        return m ? m[1] : null;
    }

    function loadOnlineInfoForUser(userId, success, error) {
        $.get('http://www.programmersforum.ru/online.php?s=&sortfield=time&sortorder=desc&who=members&ua=1&pp=50', function (html) {
            const doc = $(html);
            const userNode = doc.find(`#woltable a[href="member.php?u=${userId}"]`);
            if (!userNode.length) {
                error('Оффлайн');
                return;
            }

            const row = userNode.closest('tr');
            const ipResolveLink = row.find('a[id^="resolveip"]');
            const cellHtml = ipResolveLink.parent().html();

            const ua = cellHtml.substr(cellHtml.indexOf('<br>') + 4).trim();
            const ip = ipResolveLink.text().trim();

            const securityToken = getSecurityToken(html);
            if (!securityToken){
                success(ua, ip);
            }

            $.post(ipResolveLink.attr('href'), {
                'securitytoken': securityToken,
                'do': 'resolveip',
                'ajax': 1,
                'ipaddress': ip
            }, function (result) {
                const host = $(result).text();
                success(ua, ip, host);
            }).fail(function (request) {
                success(ua, ip);
            });
        }).fail(function (request) {
            error(`HTTP error ${request.status} ${request.statusText}`);
        });
    }

    function loadOnlineInfo(success, error) {
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

            loadOnlineInfoForUser(userId, success, error);
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

    function elementFromString(html) {
        const range = document.createRange();
        return range.createContextualFragment(html);
    }

    function appendLine(parent, name, content) {
        parent.appendChild(elementFromString(`<div>${name}: <strong>${content}</strong></div>`));
    }

    container.appendChild(elementFromString('<div id="postGeo"></div>'));
    container.appendChild(elementFromString('<h4 style="margin-top: 20px; margin-bottom: 0; font-weight: normal">Текущие данные:</h4><div id="onlineUserInfo"></div>'));

    const postUserInfoContainer = $('#postGeo')[0];
    const onlineUserInfoContainer = $('#onlineUserInfo')[0];

    requestIpApi(ip, function (data) {
        appendLine(postUserInfoContainer, 'Месторасположение (ip-api.com)', formatGeoipData(data));
    }, function (error) {
        appendLine(postUserInfoContainer, 'Месторасположение (ip-api.com)', formatError(error));
    });

    requestIpstack(ip, function (data) {
        appendLine(postUserInfoContainer, 'Месторасположение (ipstack.com)', formatGeoipData(data));
    }, function (error) {
        appendLine(postUserInfoContainer, 'Месторасположение (ipstack.com)', formatError(error));
    });

    loadOnlineInfo(function (userAgent, ip, host) {
        appendLine(onlineUserInfoContainer, 'User-Agent', userAgent);
        appendLine(onlineUserInfoContainer, 'IP адрес', ip);
        if (host) {
            appendLine(onlineUserInfoContainer, 'Хост', host);
        }

        requestIpApi(ip, function (data) {
            appendLine(onlineUserInfoContainer, 'Месторасположение (ip-api.com)', formatGeoipData(data));
        }, function (error) {
            appendLine(onlineUserInfoContainer, 'Месторасположение (ip-api.com)', formatError(error));
        });

        requestIpstack(ip, function (data) {
            appendLine(onlineUserInfoContainer, 'Месторасположение (ipstack.com)', formatGeoipData(data));
        }, function (error) {
            appendLine(onlineUserInfoContainer, 'Месторасположение (ipstack.com)', formatError(error));
        });
    }, function (error) {
        onlineUserInfoContainer.appendChild(elementFromString(`<div><strong>${formatError(error)}</strong></div>`));
    });
})();
