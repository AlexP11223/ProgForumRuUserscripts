/*
 MIT License

 Copyright (c) 2017 Alex P. (alexp.frl@gmail.com, http://programmersforum.ru/member.php?u=129198)

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

var codehighlighter = new function() {
    'use strict';

    var self = this;

    self.forumLanguagesMap = null;

    function parseUrlQuery(queryStr) {
        var dict = {};
        var queries = queryStr.replace(/^\?/, '').split('&');
        var i;
        for (i = 0; i < queries.length; i++) {
            var parts = queries[i].split('=');
            dict[parts[0]] = parts[1];
        }
        return dict;
    }

    this.getForumId = function() {
        var link = $('span.navbar a[href*=forum]').last();
        if (link.length) {
            var url = link.attr('href');
            return Number(parseUrlQuery(url.substr(url.indexOf('?')))['f']) || 0;
        }
        return 0;
    };

    this.getForumLanguages = function(forumId) {
        return self.forumLanguagesMap[forumId] || null;
    };

    function highlight(codeBlock) {
        hljs.highlightBlock(codeBlock);
    }

    function doInit(options) {
        if (typeof hljs == 'undefined') {
            return;
        }

        hljs.configure({
            languages: self.getForumLanguages(self.getForumId())
        });

        var codeBlocks = $('pre code:not(.hljs)');

        $.each(codeBlocks, function (i, codeBlock) {
            highlight(codeBlock);
        });

        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes) {
                        var codeBlocks = $(mutation.addedNodes).find('code:not(.hljs)');

                        $.each(codeBlocks, function (i, codeBlock) {
                            highlight(codeBlock);
                        });
                    }
                });
            });

            var posts = $('#posts');
            if (posts.length) {
                observer.observe(posts[0], {childList: true, subtree: true})
            }
        }
    }

    this.init = function(options) {
        var defaultOptions = {
            // http://highlightjs.readthedocs.io/en/latest/css-classes-reference.html#language-names-and-aliases
            // hljs.listLanguages().sort()
            forumLanguagesMap: {
                80: [ 'php', 'python', 'ruby', 'xml', 'css', 'javascript', 'apache', 'nginx', 'makefile', 'http', 'json', 'sql', 'bash', 'diff', 'dockerfile', 'ini', 'markdown', 'yaml' ],
                16: [ 'php', 'xml', 'css', 'scss', 'javascript' ],
                12: [ 'php', 'xml', 'css', 'javascript', 'http', 'json', 'sql' ],
                48: [ 'php', 'xml', 'css', 'javascript', 'apache', 'nginx', 'http', 'json', 'sql', 'bash', 'diff', 'ini', 'markdown', 'yaml' ],
                44: [ 'php', 'xml', 'css', 'javascript', 'sql' ],

                17: [ 'php', 'xml', 'css', 'javascript', 'sql', 'bash', 'ini', 'json' , 'http', 'yaml' ],
                112: [ 'perl', 'xml', 'css', 'javascript', 'sql', 'bash', 'ini', 'http' ],
                110: [ 'python', 'xml', 'css', 'javascript', 'sql' ],
                111: [ 'ruby', 'xml', 'css', 'javascript', 'sql' ],

                4: [ 'cpp', 'csharp', 'delphi', 'dos', 'powershell', 'x86asm', 'sql' ],
                9: [ 'cpp', 'delphi', 'dos', 'x86asm' ],

                7: [ 'delphi', 'dos' ],
                67: [ 'delphi', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],
                2: [ 'delphi', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],
                39: [ 'delphi', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],
                47: [ 'delphi', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],
                3: [ 'delphi', 'dos', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],
                5: [ 'delphi', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],

                14: [ 'cpp', 'dos', 'x86asm', 'ini', 'json', 'xml', 'css', 'sql', 'cmake', 'makefile' ],
                51: [ 'cpp', 'dos', 'x86asm', 'ini', 'json', 'xml', 'css', 'sql', 'cmake', 'makefile' ],
                52: [ 'cpp', 'dos', 'x86asm', 'ini', 'json', 'xml', 'css', 'sql', 'cmake', 'makefile' ],
                40: [ 'cpp', 'dos', 'x86asm', 'ini', 'json', 'xml', 'css', 'sql', 'cmake', 'makefile' ],
                54: [ 'cpp', 'dos', 'x86asm', 'ini', 'json', 'xml', 'css', 'sql', 'cmake', 'makefile', 'http' ],
                53: [ 'cpp', 'dos', 'x86asm', 'ini', 'json', 'xml', 'css', 'sql', 'cmake', 'makefile' ],

                11: [ 'java', 'kotlin', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],
                49: [ 'java', 'kotlin', 'dos', 'ini', 'json', 'xml', 'css', 'sql', 'http', 'apache' ],
                105: [ 'java', 'kotlin', 'dos', 'ini', 'json', 'xml', 'css', 'sql', 'http', 'apache' ],
                106: [ 'java', 'kotlin', 'dos', 'ini', 'json', 'xml', 'css', 'sql' ],

                41: [ 'csharp', 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],
                59: [ 'csharp', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],
                56: [ 'csharp', 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],
                58: [ 'csharp', 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],
                104: [ 'csharp', 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],
                60: [ 'csharp', 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql', 'http' ],

                20: [ 'excel', 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql' ],
                21: [ 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql' ],
                19: [ 'vbnet', 'dos', 'powershell', 'ini', 'json', 'xml', 'css', 'sql' ]
            }
        };

        if (options === undefined) {
            options = defaultOptions;
        } else {
            options = $.extend(defaultOptions, options);
        }

        if (window.codeHighlighterInitialized)
            return;
        window.codeHighlighterInitialized = true;

        self.forumLanguagesMap = options.forumLanguagesMap;

        $(function() {
            doInit(options);
        });
    };
};
