// ==UserScript==
// @name         ProgrammersForum Fast Thread Management
// @namespace    http://programmersforum.ru/
// @version      0.15
// @description  converts thread management radio buttons into links/buttons that work without click on the form submit button
// @author       Alex P
// @include      *programmersforum.ru/showthread.php*
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_fast_thread_management.user.js
// ==/UserScript==

(function() {
    'use strict';

    if (window.fastThreadManagement)
        return;
    window.fastThreadManagement = true;

    function addStyle(css) {
        $('<style>' + css + '</style>').appendTo('head');
    }

    var adminRadioButtons = $('.vbmenu_option div label[for*="ao_"]:has(input[type="radio"])');

    var adminMenu = adminRadioButtons.eq(0).closest('.vbmenu_option');

    adminRadioButtons.children().hide();

    adminRadioButtons.eq(0).closest('tr').next(':has(input.button)').hide();

    adminRadioButtons.parent().addClass('admin-menu-item');

    adminRadioButtons.parent().click(function () {
        $(this).find('input[type="radio"]').prop("checked", true);
        $(this).closest('form')[0].submit();
    });

    function parseUrlQuery(queryStr) {
        var dict = {};
        var queries = queryStr.replace(/^\?/, '').split('&');
        var i;
        for (i = 0; i < queries.length; i++) {
            var parts = queries[i].split('=');
            dict[parts[0]] = parts[1];
        }
        return dict;
    }

    function getThreadTitle() {
        return $.trim($('td:has(a[href*="' + location.search + '"]) strong')[0].innerText.trim());
    }

    function getThreadId() {
        return $("#threadsearch_menu").find("a")[1].href.split("=")[1];
    }

    function getForumId() {
        return parseUrlQuery($('table.tborder span.navbar:last a')[0].search)['f'];
    }

    function moveThread(destForum) {
        $('<form action="postings.php?do=domovethread&amp;t=' + getThreadId() + '" method="post" name="vbform">' +
                '<input type="hidden" name="s" value="">' +
                '<input type="hidden" name="securitytoken" value="' + $('input[name="securitytoken"]').attr('value') + '">' +
                '<input type="hidden" name="t" value="' + getThreadId() + '">' +
                '<input type="hidden" name="destforumid" value="' + destForum.id + '">' +
                '<input type="hidden" name="do" value="domovethread">' +
                '<input type="hidden" name="title" value="' + getThreadTitle() + '">' +
                '<input type="hidden" name="redirect" value="expires">' +
                '<input type="hidden" name="period" value="' + destForum.period +'">' +
                '<input type="hidden" name="frame" value="d">' +
                '<input type="hidden" name="redirecttitle" value="' + getThreadTitle() + '">' +
                '</form>')
            .appendTo('body')
            .submit();
    }

    function loadingIndicatorHtml() {
        return '<img src="/images/1070/misc/progress.gif"/>';
    }

    var forumId = getForumId();

    var quickMoveForums = $.grep([
        { id: 31, buttonText: 'Помощь студентам', period: 1 },
        { id: 29, buttonText: 'Фриланс', period: 7 },
        { id: 108, buttonText: 'Ищу работу', period: 7 },
        { id: 26, buttonText: 'Общение', period: 7 },
        { id: 37, buttonText: 'О форуме', period: 7 },
        { id: 50, buttonText: 'Программирование', period: 7 },
        { id: 80, buttonText: 'Web', period: 7 },
        { id: 46, buttonText: 'Железо', period: 7 },
        { id: 61, buttonText: 'Windows', period: 7 },
        { id: 62, buttonText: 'Linux', period: 7 },
        { id: 2, buttonText: 'Delphi', period: 7 },
        { id: 20, buttonText: 'Excel', period: 7 },
        { id: 14, buttonText: 'C++', period: 7 },
        { id: 11, buttonText: 'Java', period: 7 },
        { id: 59, buttonText: 'C#', period: 7 },
        { id: 110, buttonText: 'Python', period: 7 },
        { id: 33, buttonText: 'Gamedev', period: 7 },
    ], function (item) {
        return item.id != forumId;
    });

    var currQuickMoveForum = quickMoveForums[0];

    var forumsSelectHtml = '';
    $.each(quickMoveForums, function (i, item) {
        forumsSelectHtml += '<option value="' + item.id + '" data-period="' + item.period + '">' + item.buttonText + '</option>';
    });

    $('<div class="admin-menu-item cbb-admin-menu-item"><label>Переместить в </label>' +
        '<select class="forum-select-cbb">' + forumsSelectHtml + '</select></div>')
        .appendTo(adminMenu)
        .click(function () {
            moveThread(currQuickMoveForum);
            $(loadingIndicatorHtml()).insertAfter($(this));
        });
    var cbb = $('.forum-select-cbb');
    cbb.click(function (e) {
        e.stopPropagation();
    });
    cbb.change(function () {
        currQuickMoveForum = { id: this.value, period: $(this).find(':selected').data('period') };
        moveThread(currQuickMoveForum);
        $(loadingIndicatorHtml()).insertAfter($(this).closest('.admin-menu-item'));
    });

    function setMenuStyle() {
        $('.admin-menu-item').children().css({
            'cursor': 'pointer'
        });
        $('.cbb-admin-menu-item select').css({
            'cursor': 'default'
        });

        adminMenu.css({
            'cursor': 'default',
            'padding': 0
        });
    }

    addStyle('.admin-menu-item { padding: 4px; border: 1px; color: #1c3289; cursor: pointer; } ' +
        '.admin-menu-item:hover { background: #ffffcc; color: #000000; } ' +
        '.cbb-admin-menu-item { padding: 0 4px; padding-right: 0; } ' +
        '.cbb-admin-menu-item select { padding: 4px 0; width: 150px; } ');

    setMenuStyle();
})();
