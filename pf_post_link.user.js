// ==UserScript==
// @name         ProgrammersForumPostLink
// @namespace    http://programmersforum.ru/
// @version      1.0
// @description  adds button to copy post url
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_post_link.user.js
// ==/UserScript==

(function() {
    'use strict';

    if (window.postLinkInitialized)
        return;
    window.postLinkInitialized = true;

    GM_addStyle('.link-popup { font-weight: bold; margin-right: 8px; }');

    const BASE_URL = 'https://programmersforum.ru/';

    $.each($('a[id^="postcount"]'), (i, oldPostLink) => {
        const href = $(oldPostLink).attr('href');

        const container = $(oldPostLink).parent();

        const postLink = $('<a href="' + href + '">ссылка</a>').prependTo(container);
        postLink.click(e => {
            e.preventDefault();

            GM_setClipboard(BASE_URL + href);

            const popup = $('<span class="link-popup" style="display: none;">ссылка скопирована в буфер обмена</span>').prependTo(container);
            popup.fadeIn();
            popup.delay(2500).fadeOut();
        });
    });
})();
