// ==UserScript==
// @name         ProgrammersForum Hide logo, etc.
// @namespace    programmersforum.ru
// @version      1.6
// @description  hides the huge logo and other useless stuff
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_declutter.user.js
// ==/UserScript==

(function() {
    'use strict';

    function addStyle(css) {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.className = 'declutter';
        styleSheet.innerHTML = css;
        document.head.appendChild(styleSheet);
    }

    if (document.head) {
        addStyle(`img[src="images/1070/misc/logo.gif"],
                       #header_right_cell,
                       div.page > div > b,
                       div.page > div > b + br,
                       div.page > div > b + br + br,
                       div.page > div > center,
                       div.page > div > center + br
           { display: none; }`);
    }

    document.addEventListener("DOMContentLoaded", () => {
        $('img[src="images/1070/misc/logo.gif"]')
            .closest('table')
            .remove();

        const emailRequestBlock = $('a[href^="register.php?do=requestemail"]')
            .parent();
        emailRequestBlock
            .nextAll(':lt(2)')
            .remove();
        emailRequestBlock.remove();

        const buyAdBlock = $('center:contains(alarforum@yandex.ru)');
        buyAdBlock
            .next('br')
            .remove();
        buyAdBlock.remove();

        $('style.declutter').remove();
    });
})();
