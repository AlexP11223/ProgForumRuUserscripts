// ==UserScript==
// @name         ProgrammersForumGeoIp
// @namespace    http://programmersforum.ru/
// @version      0.2
// @description  adds country/city info on the page with user IP
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
        const request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                const data = JSON.parse(request.responseText);
                success(data);
            } else {
                error(`HTTP error ${request.status} ${request.statusText}`);
            }
        };

        request.onerror = function () {
            error('Connection error');
        };

        request.send();
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
})();
