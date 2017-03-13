// ==UserScript==
// @name         ProgrammersForum Fast Thread Management
// @namespace    http://programmersforum.ru/
// @version      0.4
// @description  converts thread management radio buttons into links/buttons that work without click on the form submit button
// @author       Alex P
// @include      http://programmersforum.ru/showthread.php*
// @include      http://www.programmersforum.ru/showthread.php*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_fast_thread_management.user.js
// ==/UserScript==

(function() {
    'use strict';

    if (window.fastThreadManagement)
        return;
    window.fastThreadManagement = true;

    function addStyle(css) {
        $(`<style>${css}</style>`).appendTo('head');
    }

    const adminRadioButtons = $('.vbmenu_option div label[for*="ao_"]:has(input[type="radio"])');

    const adminMenu = adminRadioButtons.eq(0).closest('.vbmenu_option');

    adminRadioButtons.children().hide();

    adminRadioButtons.eq(0).closest('tr').next(':has(input.button)').hide();

    adminRadioButtons.parent().addClass('admin-menu-item');

    adminRadioButtons.parent().click(function () {
        $(this).find('input[type="radio"]').prop("checked", true);
        $(this).closest('form')[0].submit();
    });

    function getThreadTitle() {
        return $.trim($('td:has(a[href*="' + location.search + '"]) strong')[0].innerText.trim());
    }

    function getThreadId() {
        return $("#threadsearch_menu").find("a")[1].href.split("=")[1];
    }

    function moveThread(destForumId) {
        $(`<form action="postings.php?do=domovethread&amp;t=${getThreadId()}" method="post" name="vbform">
                <input type="hidden" name="s" value="">
                <input type="hidden" name="securitytoken" value="${window.SECURITYTOKEN}">
                <input type="hidden" name="t" value="${getThreadId()}">
                <input type="hidden" name="destforumid" value="${destForumId}">
                <input type="hidden" name="do" value="domovethread">
                <input type="hidden" name="title" value="${getThreadTitle()}">
                <input type="hidden" name="redirect" value="expires">
                <input type="hidden" name="period" value="1">
                <input type="hidden" name="frame" value="d">
                <input type="hidden" name="redirecttitle" value="${getThreadTitle()}">
            </form>`)
            .appendTo('body')
            .submit();
    }

    function loadingIndicatorHtml() {
        return '<img src="/images/1070/misc/progress.gif"/>';
    }

    const quickMoveForums = [
        { id: 31, buttonText: 'Переместить в Помощь студентам' }
    ];

        $(`<div class="admin-menu-item"><label>${this.buttonText}</label></div>`)
    $.each(quickMoveForums, function (i, item) {
            .appendTo(adminMenu)
            .click(function () {
                $(loadingIndicatorHtml()).insertAfter($(this));
                moveThread(item.id);
            });
    });

    function setMenuStyle() {
        $(".admin-menu-item").children().css({
            "cursor": "pointer"
        });

        adminMenu.css({
            "cursor": "default",
            "padding": 0
        });
    }

    addStyle(`
        .admin-menu-item {
            padding: 4px;
            border: 1px;
            color: #1c3289;
            cursor: pointer;
        }
        .admin-menu-item:hover {
            background: #ffffcc;
            color: #000000;
        }`);

    setMenuStyle();
})();
