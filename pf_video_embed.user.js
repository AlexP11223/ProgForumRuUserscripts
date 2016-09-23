// ==UserScript==
// @name         ProgrammersForumVideoEmbed
// @namespace    http://programmersforum.ru/
// @version      0.21
// @description  replaces youtube and coub links with embedded video player frames
// @author       Alex P
// @include      http://programmersforum.ru/*
// @include      http://www.programmersforum.ru/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_video_embed.user.js
// ==/UserScript==

(function() {
    'use strict';

    var YOUTUBE_EMBED_TEMPLATE = '<iframe src="https://www.youtube.com/embed/_ID_" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
    var COUB_EMBED_TEMPLATE = '<iframe src="//coub.com/embed/_ID_?muted=false&autostart=false&originalSize=false&startWithHD=true" width="640" height="270" frameborder="0" allowfullscreen></iframe>';

    function insertEmbed(origLinkNode, embedTemplate, id) {
        var html = '<br/>' + embedTemplate.replace('_ID_', id) + '<br/>';

        $(html).insertBefore(origLinkNode);
        origLinkNode.hide();
    }

    var postBlocks = $('#posts, #post, td.alt1:has(hr)');

    $.each(postBlocks.find('a[href*="youtu"], a[href*="coub"]'), function(i, link) {
        // skip signature
        if ($(link).parents('div').eq(0).is(':contains("__________________")'))
            return;

        var url = $(link).attr('href');

        var youtubeIdMatch = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
        if(youtubeIdMatch && youtubeIdMatch[1].indexOf('/') == -1) { // quick fix, should improve youtube detection, for example like here https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/b0190f3e2ab0887ced5529353394cb43553a113f/lib/modules/hosts/youtube.js#L8
            insertEmbed($(link), YOUTUBE_EMBED_TEMPLATE, youtubeIdMatch[1]);
        }

        var coubIdMatch = url.match(/(?:http|https)?:\/\/(?:www\.)?coub\.com\/view\/([a-zA-Z\d]+)/);
        if(coubIdMatch) {
            insertEmbed($(link), COUB_EMBED_TEMPLATE, coubIdMatch[1]);
        }
    });
})();
