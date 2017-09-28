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

var postautosave = new function() {
    'use strict';

    var self = this;

    function isStorageSupported() {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch(e) {
            return false;
        }
    }

    function doInit(options) {
        var form = $('form[action*="newreply.php"]');
        var textarea = form.find('textarea');
        var threadIdField = form.find('input[name="t"]');

        if (!form.length || !textarea.length || !threadIdField.length) {
            return;
        }

        var threadId = threadIdField.val();

        var storageId = 'new_post_thread' + threadId;

        var oldText = window.localStorage.getItem(storageId);
        if (oldText) {
            textarea.val(oldText);
        }

        var submitted = false;

        form.submit(function () {
            try {
                submitted = true;
                if (timer) {
                    timer = clearTimeout(timer);
                }
                window.localStorage.removeItem(storageId);
            } catch(e) {
                console.log(e);
            }
        });

        var timer = null;

        function save() {
            if (submitted) {
                return;
            }
            var text = textarea.val();
            if (text) {
                window.localStorage.setItem(storageId, text);
            } else {
                if (window.localStorage.getItem(storageId)) {
                    if (!(form.find('textarea').length)) {
                        return;
                    }
                    window.localStorage.removeItem(storageId);
                }
            }
            timer = null;
        }

        function startSave() {
            if (timer == null) {
                submitted = false;
                timer = setTimeout(save, options.saveDelay);
            }
        }

        textarea.change(startSave);
        textarea.on('input', startSave);
        textarea.on('blur', startSave);

        window.addEventListener("unload", function () {
            save();
        });
    }

    this.init = function(options) {
        var defaultOptions = {
            saveDelay: 1000
        };

        if (options === undefined) {
            options = defaultOptions;
        } else {
            options = $.extend(defaultOptions, options);
        }

        if (window.postAutosaveInitialized)
            return;
        window.postAutosaveInitialized = true;

        if (!isStorageSupported())
            return;

        $(function() {
            doInit(options);
        });
    };
};
