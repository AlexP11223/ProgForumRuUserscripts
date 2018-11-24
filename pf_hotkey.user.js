// ==UserScript==
// @name         ProgrammersForumHotkey
// @namespace    http://programmersforum.ru/
// @version      0.1
// @description  allows to submit posts with Ctrl+Enter
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_hotkey.user.js
// ==/UserScript==

(function () {
    'use strict';

    $('textarea').keydown(function (e) {

        // Ctrl-Enter pressed
        if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
            $(this).closest('form').submit();
        }
    });
})();
