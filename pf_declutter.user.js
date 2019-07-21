// ==UserScript==
// @name         Hide logo, etc.
// @namespace    programmersforum.ru
// @version      1.0
// @description  hides the huge logo and other useless stuff
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_declutter.user.js
// ==/UserScript==

(function() {
    'use strict';

    $('img[src="images/1070/misc/logo.gif"]')
        .closest('table')
        .remove();

    const emailRequestBlock = $('a[href^="register.php?do=requestemail"]')
        .parent();
    emailRequestBlock
        .nextAll(':lt(2)')
        .remove();
    emailRequestBlock.remove();

    const beforeDonate = $('center a[href^="showthread.php?t=328680"]')
        .parent()
        .prev();
    beforeDonate
        .nextAll(':lt(4)')
        .remove();
    beforeDonate.remove();
})();
