// ==UserScript==
// @name         ProgrammersForumHotkey
// @namespace    http://programmersforum.ru/
// @version      0.3
// @description  allows to submit posts with Ctrl+Enter
// @author       Alex P
// @include      *programmersforum.ru/*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_hotkey.user.js
// ==/UserScript==

(function () {
    'use strict';

    function ctrlEnterPressed(keyEcent) {
        return (keyEcent.keyCode === 10 || keyEcent.keyCode === 13) && keyEcent.ctrlKey;
    }

    function isQuickEdit(textarea) {
        return textarea.attr('id').indexOf('_QE_') > 0;
    }

    const textAreaKeyHandler = function (e) {
        if (ctrlEnterPressed(e)) {
            const textarea = $(this);

            if (isQuickEdit(textarea)) {
                textarea.closest('table').find('input[id$="_save"]').click();
            } else {
                textarea.closest('form').submit();
            }

            textarea.blur();
        }
    };

    $('textarea').keydown(textAreaKeyHandler);

    if (typeof MutationObserver !== 'undefined') {
        const posts = $('#posts');
        if (posts.length) {
            new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes) {
                        $(mutation.addedNodes).find('textarea').keydown(textAreaKeyHandler);
                    }
                });
            }).observe(posts[0], {childList: true, subtree: true});
        }
    }
})();
