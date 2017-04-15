// ==UserScript==
// @name         ProgrammersForumAutosave
// @namespace    http://programmersforum.ru/
// @version      0.9
// @description  saves new post text to localStorage and restores it if closed the page without submitting (separate for each thread)
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_post_autosave.user.js
// ==/UserScript==

var postautosave_u = new function() {
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
                    clearTimeout(timer);
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
postautosave_u.init();
