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

var quickquote = new function() {
    'use strict';

    var currSelectedText = '';
    var currPostId = '';
    var currAuthorName = '';

    var qqBtnId = 'quick_quote_btn';
    var qqBtnSelector = '#' + qqBtnId;
    var qqBtn = undefined;

    var fadeOutTimer = undefined;

    function getSelectedText() {
        return window.getSelection().toString();
    }

    function onPostClicked(e) {
        var selectedText = $.trim(getSelectedText());
        var targetTag = e.target.nodeName.toLowerCase();
        if (selectedText && targetTag !== 'textarea' && targetTag !== 'input') {
            stopFadeOut();

            qqBtn.css({ top: (e.pageY + 10) + 'px', left: e.pageX + 'px'});

            qqBtn.show(50, function() {
                restartFadeOut();
            });

            var postContainer = $(this).closest('table');

            currPostId = postContainer.attr('id').replace('post', '');
            currAuthorName = postContainer.find('.bigusername').first().text();

            currSelectedText = selectedText;
        }
        else {
            qqBtn.hide();
        }
    }

    function appendText(text) {
        if (vB_Editor[QR_EditorID].get_editor_contents().length > 0) {
            text = '\n' + text;
        }
        vB_Editor[QR_EditorID].insert_text(text);
        vB_Editor[QR_EditorID].collapse_selection_end();
    }

    function appendQuote(text) {
        var nameQuoteChar = '';
        if (currAuthorName.indexOf(']') !== -1)
            nameQuoteChar = "'";

        appendText('[QUOTE=' + nameQuoteChar + currAuthorName + ';' + currPostId + nameQuoteChar + ']' + text + '[/QUOTE]\n');
    }

    function quoteSelected() {
        appendQuote(currSelectedText);

        qqBtn.hide();
    }

    function quotePost(postQuoteUrl, progressIndicator) {
        progressIndicator.show();

        $.get(postQuoteUrl, function(response) {
            var html = $.parseHTML(response);

            var quote = $.trim($(html).find('#vB_Editor_001_textarea').text());

            if (quote) {
                appendText(quote);
            }
        }).done(function() {
            progressIndicator.hide();
        });
    }

    function stopFadeOut() {
        if (fadeOutTimer) {
            clearTimeout(fadeOutTimer);
        }
        qqBtn.stop(true, true);
    }

    function restartFadeOut() {
        stopFadeOut();

        fadeOutTimer = setTimeout(function() {
            qqBtn.fadeOut();
        }, 3000);
    }

    function doInit(options) {
        try {
            if (vB_Editor[QR_EditorID]) { }
        } catch (e) {
            // not logged in
            return;
        }

        if (options.selection) {
            $('<div id="' + qqBtnId + '" class="smallfont qq-btn" style="display:none;">Цитировать</div>').prependTo($('body'));

            qqBtn = $(qqBtnSelector);

            qqBtn.click(quoteSelected);

            qqBtn.hover(function () {
                    stopFadeOut();
                },
                function () {
                    restartFadeOut();
                });

            $('#posts').on('mouseup', 'div[id^="post_message"]', onPostClicked);
        }

        if (options.post) {
            $('#posts').find('a:has(img[src*="quote."])').click( function(e) {
                e.preventDefault();

                var url = $(this).attr('href');
                var progressIndicator = $(this).prevAll('img[id^="progress"]').first();

                quotePost(url, progressIndicator);
            });
        }
    }

    this.init = function(options) {
        var defaultOptions = {
            selection: true,
            post: true
        };

        if (options === undefined) {
            options = defaultOptions;
        } else {
            options = $.extend(defaultOptions, options);
        }

        if (window.quickQuoteInitialized || $(qqBtnSelector).length)
            return;
        window.quickQuoteInitialized = true;

        $(function() {
            doInit(options);
        });
    }
};
