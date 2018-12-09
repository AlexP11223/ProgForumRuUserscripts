// ==UserScript==
// @name         ProgrammersForumGeoIp
// @namespace    http://programmersforum.ru/
// @version      0.7
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
            const ipCellHtml = ipResolveLink.parent().html();

            const ua = ipCellHtml.substr(ipCellHtml.indexOf('<br>') + 4).trim();
            const ip = ipResolveLink.text().trim();

            const time = row.find('.time').html();

            const securityToken = getSecurityToken(html);
            if (!securityToken){
                success(ua, ip, null, time);
            }

            $.post(ipResolveLink.attr('href'), {
                'securitytoken': securityToken,
                'do': 'resolveip',
                'ajax': 1,
                'ipaddress': ip
            }, function (result) {
                const host = $(result).text();
                success(ua, ip, host, time);
            }).fail(function (request) {
                success(ua, ip, null, time);
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

    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.onload = callback;
        script.setAttribute("type","text/javascript");
        script.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function parseUserAgent(userAgent, callback) {
        loadScript('https://cdn.jsdelivr.net/npm/ua-parser-js@0/dist/ua-parser.min.js', function () {
            callback(UAParser(userAgent));
        });
    }

    function getOsIcon(uaData) {
        const win8Icon = 'https://i.imgur.com/OC1xkLD.png';
        const winIcon = 'https://i.imgur.com/o08ewuG.png';
        const linuxIcon = 'https://i.imgur.com/I1JBl7R.png';
        const appleIcon = 'https://i.imgur.com/m8Iw72B.png';
        const androidIcon = 'https://i.imgur.com/Pmi5K2W.png';

        switch (uaData.os.name) {
            case 'Windows':
            case 'Windows Server':
            case 'Windows Phone':
                switch (uaData.os.version) {
                    case '10':
                    case '8':
                    case '8.1':
                    case '2012':
                    case '2016':
                        return win8Icon;
                    default:
                        return winIcon;
                }
            case 'Linux':
            case 'Unix':
            case 'Ubuntu':
            case 'Mint':
            case 'Arch':
            case 'Gentoo':
            case 'RedHat':
            case 'SUSE':
                return linuxIcon;
            case 'Mac OS':
            case 'iOS':
                return appleIcon;
            case 'Android':
                return androidIcon;
            default:
                if (uaData.os.name.indexOf('Windows') > -1)
                    return winIcon;
                if (uaData.os.name.indexOf('Linux') > -1 || uaData.os.name.indexOf('BSD') || uaData.os.name.indexOf('GNU'))
                    return linuxIcon;
                return null;
        }
    }

    function getDeviceIcon(uaData) {
        switch (uaData.os.name) {
            case 'iOS':
            case 'Android':
            case 'Windows Phone':
            case 'Windows Mobile':
            case 'IEMobile':
                return 'https://i.imgur.com/0bSHkRs.png';
            default:
                return null;
        }
    }

    function getBrowserIcon(uaData) {
        // some user agents are truncated
        function isYandexBrowser(ua) {
            return ua.split(' ').pop().indexOf('Ya') > -1;
        }

        function isChrome(ua) {
            return ua.split(' ').pop().indexOf('Ch') > -1;
        }

        function getIconId() {
            switch (uaData.browser.name.toLowerCase()) {
                case 'firefox':
                case 'iceweasel':
                case 'icecat':
                case 'icedragon':
                case 'iceape':
                    return 'firefox/firefox';
                case 'chrome':
                case 'chrome webview':
                case 'chrome headless':
                case 'chromium':
                case 'comodo dragon':
                    if (isYandexBrowser(uaData.ua))
                        return 'yandex/yandex';
                    return 'chrome/chrome';
                case 'yandex':
                    return 'yandex/yandex';
                case 'safari':
                    return 'safari/safari';
                case 'opera':
                case 'opera mini':
                case 'opera tablet':
                case 'opera mobi':
                case 'opera coast':
                    return 'opera/opera';
                case 'vivaldi':
                    return 'vivaldi/vivaldi';
                case '2345explorer':
                    return 'archive/internet-explorer_6/internet-explorer_6';
                case 'iemobile':
                case 'ie':
                    if (!uaData.browser.version)
                        return 'archive/internet-explorer_6/internet-explorer_6';
                    if (uaData.browser.version[0] === '7' || uaData.browser.version[0] === '8')
                        return 'archive/internet-explorer_7-8/internet-explorer_7-8';
                    return 'archive/internet-explorer_9-11/internet-explorer_9-11';
                case 'edge':
                    return 'edge/edge';
                default:
                    if (isChrome(uaData.ua))
                        return 'chrome/chrome';
                    return null;
            }
        }

        const id = getIconId();
        return id ? `https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/${id}_32x32.png` : null;
    }

    function getImgHtml(url, width, height) {
        if (!url)
            return '';
        return `<img src="${url}" height="${width}" width="${height}"/>`
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
    container.appendChild(elementFromString('<h4 style="margin-top: 20px; margin-bottom: 0; font-weight: normal">Текущие данные<span id="onlineTime"></span>:</h4><div id="onlineUserInfo"></div>'));

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

    loadOnlineInfo(function (userAgent, ip, host, time) {
        $('#onlineTime').html(` (<strong>${time}</strong>)`);
        appendLine(onlineUserInfoContainer, 'User-Agent', '<span id="parsedUa"></span>' + userAgent);
        parseUserAgent(userAgent, function (uaData) {
            const container = $('#parsedUa');
            container.html(`${getImgHtml(getDeviceIcon(uaData), 16, 16)} ${getImgHtml(getOsIcon(uaData), 16, 16)} ${uaData.os.name} ${uaData.os.version},
                            ${getImgHtml(getBrowserIcon(uaData), 16, 16)} ${uaData.browser.name} ${uaData.browser.version}<br/>`);
        });
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
