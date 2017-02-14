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

var newthreadForumList = new function() {
    'use strict';

    var self = this;

    this.parseUrlQuery = function(queryStr) {
        var dict = {};
        var queries = queryStr.replace(/^\?/, '').split('&');
        var i;
        for (i = 0; i < queries.length; i++) {
            var parts = queries[i].split('=');
            dict[parts[0]] = parts[1];
        }
        return dict;
    };

    this.parseForums = function(html) {
        var forums = [];

        var elements = $(html).find('select[name="forumchoice[]"] option[class^="f"]');

        var lastForum = null;

        $.each(elements, function (i, el) {
            var classAttr = $(el).attr('class');
            var lastClassChar = classAttr.slice(-1);

            if (lastClassChar === '0') {
                lastForum = { name: $.trim(el.text), children: [] };
                forums.push(lastForum);
            } else {
                var id = parseInt($(el).attr('value'));
                if (id) {
                    lastForum.children.push({ name: $.trim(el.text), id: id });
                }
            }
        });

        return forums;
    };

    this.loadForums = function(callback, errorCallback) {
        $.get('/search.php', function (html) {
            callback(self.parseForums(html));
        }).fail(errorCallback);
    };

    function createForumsListHtml(forums) {
        var html = '<table cellpadding="0" cellspacing="0" border="0" class="fieldset"><tbody>';

        html += '<tr><td class="smallfont" colspan="4">Раздел:</td></tr>';

        var comboboxHtml = '<select id="newthreadForum">';
        $.each(forums, function (i, forum) {
            comboboxHtml += '<optgroup label="' + forum.name + '">';
            if (forum.children) {
                $.each(forum.children, function (i, child) {
                    comboboxHtml += '<option value="' + child.id + '">' + child.name + '</option>';
                });
            }
            comboboxHtml += '</optgroup>';
        });
        comboboxHtml += '</select>';

        html += '<tr><td>' + comboboxHtml + '</td></tr>';

        html += '</tbody></table>';

        return html;
    }

    function doInit(options) {
        var urlQuery = self.parseUrlQuery(window.location.search);

        if (urlQuery['do'] !== 'newthread' && urlQuery['do'] !== 'postthread') {
            return;
        }

        if (!options.allNewThreadPages && $.inArray(parseInt(urlQuery["f"]), options.newthreadPagesIds) < 0) {
            return;
        }

        var form = $('form[name="vbform"]');
        if (!form.length) {
            return;
        }

        var forumInput = form.find('input[name="f"]');
        if (!forumInput.length) {
            return;
        }

        var currentForumId = forumInput.attr('value');

        var titleTable = form.find('td.smallfont:contains("Заголовок:")').closest('table');
        if (!titleTable.length) {
            return;
        }

        self.loadForums(function (forums) {
            var listHtml = createForumsListHtml(forums);

            $(listHtml).insertBefore(titleTable);

            var cbb = $('#newthreadForum');

            cbb.find('option[value="' + currentForumId + '"]').prop('selected',true);

            $('select').on('change', function() {
                forumInput.attr('value', this.value);
            });
        });
    }

    this.init = function(options) {
        var defaultOptions = {
            allNewThreadPages: false,
            newthreadPagesIds: [ 31 ]
        };

        if (options === undefined) {
            options = defaultOptions;
        } else {
            options = $.extend(defaultOptions, options);
        }

        if (window.newthreadForumListInitialized) {
            return;
        }
        window.newthreadForumListInitialized = true;

        $(function() {
            doInit(options);
        });
    };
};
