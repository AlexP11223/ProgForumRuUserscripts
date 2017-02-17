// ==UserScript==
// @name         ProgrammersForumFastThreadManagement
// @namespace    http://programmersforum.ru/
// @version      0.1
// @description  coverts thread management radio buttons into links/buttons that work without click on the form submit button
// @author       Alex P
// @include      http://programmersforum.ru/showthread.php*
// @include      http://www.programmersforum.ru/showthread.php*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_fast_thread_management.user.js
// ==/UserScript==

(function() {
    'use strict';

    function addStyle(css) {
        $(`<style>${css}</style>`).appendTo('head');
    }

    const adminRadioButtons = $('.vbmenu_option div label[for*="ao_"]:has(input[type="radio"])');

    adminRadioButtons.children().css({
        "-webkit-appearance": "none",
        "-moz-appearance": "none",
        "appearance": "none"
    });

    adminRadioButtons.css({
        "cursor": "pointer"
    });

    adminRadioButtons.eq(0).closest('.vbmenu_option').css({
        "cursor": "default"
    });

    adminRadioButtons.eq(0).closest('tr').next(':has(input.button)').hide();

    addStyle(`
        .admin-menu-item {
            padding-top: 4px;
            padding-bottom: 4px;
            border: 1px;
            color: #1c3289;
            cursor: pointer;
        }
        .admin-menu-item:hover {
            background: #ffffcc;
            color: #000000;
        }`);
    adminRadioButtons.parent().addClass('admin-menu-item');

    adminRadioButtons.parent().click(function () {
        $(this).find('input[type="radio"]').prop("checked", true);
        $(this).closest('form')[0].submit();
    });
})();
