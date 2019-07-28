// ==UserScript==
// @name         Restore Console
// @namespace    programmersforum.ru
// @version      1.0
// @description  Restores console.log deleted by some vBulletin script
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/AlexP11223/ProgForumRuUserscripts/master/pf_restore_console.user.js
// ==/UserScript==

(function () {
    'use strict';

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    window.console = iframe.contentWindow.console;
})();
