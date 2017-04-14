// ==UserScript==
// @name         ProgrammersForumAutosave
// @namespace    http://programmersforum.ru/
// @version      0.1
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

    function doInit() {
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

        form.submit(function () {
            window.localStorage.removeItem(storageId);
        });

        var timer = null;

        function save() {
            var text = textarea.val();
            if (text) {
                window.localStorage.setItem(storageId, text);
            }
            timer = null;
        }

        function startSave() {
            if (timer != null) {
                timer = setTimeout(save, 1000);
            }
        }

        textarea.change(startSave);
        textarea.on('input', startSave);

        window.addEventListener("unload", save);
    }

    this.init = function() {
        if (window.postAutosaveInitialized)
            return;
        window.postAutosaveInitialized = true;

        if (!isStorageSupported())
            return;

        doInit();
    };
};
postautosave_u.init();
