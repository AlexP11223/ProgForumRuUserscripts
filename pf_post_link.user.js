// ==UserScript==
// @name         ProgrammersForumPostLink
// @namespace    http://programmersforum.ru/
// @version      0.21
// @description  adds button to copy post url
// @author       Alex P
// @include      http://programmersforum.ru/*
// @include      http://www.programmersforum.ru/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
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

    $.each($('[id^="postcount"]'), function(i, oldPostLink) {
        var id = $(oldPostLink).attr('id').replace('postcount', '');
        var href = '#post' + id;
        var container = $(oldPostLink).parent();

        var postLink = $('<a href="' + href + '">ссылка</a>').prependTo(container);
        postLink.click(function() {
            var url = window.location.href.split("#")[0];

            GM_setClipboard(url + href);

            var popup = $('<span class="link-popup" style="display: none;">ссылка скопирована в буфер обмена</span>').prependTo(container);
            popup.fadeIn();
            popup.delay(2500).fadeOut();
        });
    });
})();
