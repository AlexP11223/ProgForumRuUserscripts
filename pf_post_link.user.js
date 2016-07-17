// ==UserScript==
// @name         ProgrammersForumPostLink
// @namespace    http://programmersforum.ru/
// @version      0.1
// @description  adds button to copy post url
// @author       Alex P
// @include      http://programmersforum.ru/*
// @include      http://www.programmersforum.ru/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    $.each($('[id^="postcount"]'), function(i, oldPostLink) {
        var id = $(oldPostLink).attr('id').replace('postcount', '');
        var href = '#post' + id;
        var container = $(oldPostLink).parent();

        var postLink = $('<a href="' + href + '">ссылка</a>').prependTo(container);
        postLink.click(function() {
            var url = window.location.href.split("#")[0];

            GM_setClipboard(url + href);
        });
    });
})();