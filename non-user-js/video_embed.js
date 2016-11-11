/*
 MIT License

 Copyright (c) 2016 Alex P. (alexp.frl@gmail.com, http://programmersforum.ru/member.php?u=129198)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.*/

var videoembed = new function() {
    'use strict';

    var self = this;

    var YOUTUBE_EMBED_TEMPLATE = '<iframe src="https://www.youtube.com/embed/_ID_" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
    var COUB_EMBED_TEMPLATE = '<iframe src="//coub.com/embed/_ID_?muted=false&autostart=false&originalSize=false&startWithHD=true" width="640" height="270" frameborder="0" allowfullscreen></iframe>';

    function insertEmbed(origLinkNode, embedTemplate, id, hide) {
        var html = '<br/>' + embedTemplate.replace('_ID_', id) + '<br/>';

        $(html).insertAfter(origLinkNode);
        origLinkNode.addClass('_embedded');

        if (hide) {
            origLinkNode.hide();
        }
    }

    function parseURL(url) {
        var parser = document.createElement('a');
        var searchDict = {};

        parser.href = url;

        var queries = parser.search.replace(/^\?/, '').split('&');
        var i;
        for (i = 0; i < queries.length; i++) {
            var parts = queries[i].split('=');
            searchDict[parts[0]] = parts[1];
        }

        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            hash: parser.hash,
            searchDict: searchDict,
            pathParts: parser.pathname.substring(1).split('/')
        };
    }

    function containsAny(str, substrings) {
        for (var i = 0; i != substrings.length; i++) {
            var substring = substrings[i];
            if (str.indexOf(substring) != -1) {
                return true;
            }
        }
        return false;
    }

    this.parseYoutube = function(href) {
        function parseId(url) {
            if (url.hostname.indexOf('youtu.be') != -1)
                return url.pathParts[0];

            if (url.searchDict['v'])
                return url.searchDict['v'];

            if (['watch', 'embed', 'v'].indexOf(url.pathParts[0]) != -1)
                return url.pathParts[1];

            return false;
        }

        function parseTime(s) {
            try {
                var parts = s.replace(/[^0-9]+/g, ' ').split(' ');
                parts = $.grep(parts, function(el) { return el !== '';});

                if (parts.length === 1) {
                    return parseInt(parts[0], 10);
                } else if (parts.length === 2) {
                    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                } else if (parts.length === 3) {
                    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
                }
            } catch (e) {
            }
            return 0;
        }

        var url = parseURL(href);

        var domains = ['youtube.com', 'youtu.be'];

        if (!containsAny(url.hostname, domains))
            return false;

        var id = parseId(url);

        if (id) {
            var ret = { id: id, params: { } };

            if (url.searchDict['t']) {
                var t = parseTime(url.searchDict['t']);
                if (t) {
                    ret.params.start = t;
                }
            }

            return ret;
        }

        return false;
    };

    this.parseCoubId = function(href) {
        var url = parseURL(href);

        var domains = ['coub.com'];

        if (!containsAny(url.hostname, domains))
            return false;

        if (['view', 'embed'].indexOf(url.pathParts[0]) != -1)
            return url.pathParts[1];

        return false;
    };

    function doInit(options) {
        var postBlocks = $('#posts, #post, td.alt1:has(hr)');

        $.each(postBlocks.find('a[href*="youtu"], a[href*="coub"]'), function (i, link) {
            if (!$(link).is(':visible') || $(link).is('._embedded'))
                return;

            // skip signature
            if ($(link).parents('div').eq(0).is(':contains("__________________")'))
                return;

            var url = $(link).attr('href');

            var youtube = self.parseYoutube(url);
            if (youtube) {
                var paramsStr = '';
                if (!$.isEmptyObject(youtube.params)) {
                    paramsStr = '?' + $.param(youtube.params);
                }
                insertEmbed($(link), YOUTUBE_EMBED_TEMPLATE, youtube.id + paramsStr, options.hideLinks);
            }

            if (options.coub) {
                var coubId = self.parseCoubId(url);
                if (coubId) {
                    insertEmbed($(link), COUB_EMBED_TEMPLATE, coubId, options.hideLinks);
                }
            }
        });
    }

    this.init = function(options) {
        var defaultOptions = {
            youtube: true,
            coub: true,
            hideLinks: false
        };

        if (options === undefined) {
            options = defaultOptions;
        } else {
            options = $.extend(defaultOptions, options);
        }

        if (window.videoEmbedInitialized)
            return;
        window.videoEmbedInitialized = true;

        $(function() {
            doInit(options);
        });
    };
};
