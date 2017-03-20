// ==UserScript==
// @name         ProgrammersForumSearchLink
// @namespace    http://programmersforum.ru/
// @version      0.1
// @description  adds button to copy search url
// @author       Alex P
// @include      http://programmersforum.ru/*
// @include      http://www.programmersforum.ru/*
// @grant        GM_setClipboard
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_search_link.user.js
// ==/UserScript==

var searchlink = new function() {
    'use strict';

    var self = this;

    var win1251map = {
        1027: 129, 8225: 135, 1046: 198, 8222: 132, 1047: 199, 1168: 165, 1048: 200, 1113: 154, 1049: 201,
        1045: 197, 1050: 202, 1028: 170, 160: 160, 1040: 192, 1051: 203, 164: 164, 166: 166, 167: 167, 169: 169,
        171: 171, 172: 172, 173: 173, 174: 174, 1053: 205, 176: 176, 177: 177, 1114: 156, 181: 181, 182: 182,
        183: 183, 8221: 148, 187: 187, 1029: 189, 1056: 208, 1057: 209, 1058: 210, 8364: 136, 1112: 188, 1115: 158,
        1059: 211, 1060: 212, 1030: 178, 1061: 213, 1062: 214, 1063: 215, 1116: 157, 1064: 216, 1065: 217, 1031: 175,
        1066: 218, 1067: 219, 1068: 220, 1069: 221, 1070: 222, 1032: 163, 8226: 149, 1071: 223, 1072: 224, 8482: 153,
        1073: 225, 8240: 137, 1118: 162, 1074: 226, 1110: 179, 8230: 133, 1075: 227, 1033: 138, 1076: 228, 1077: 229,
        8211: 150, 1078: 230, 1119: 159, 1079: 231, 1042: 194, 1080: 232, 1034: 140, 1025: 168, 1081: 233, 1082: 234,
        8212: 151, 1083: 235, 1169: 180, 1084: 236, 1052: 204, 1085: 237, 1035: 142, 1086: 238, 1087: 239, 1088: 240,
        1089: 241, 1090: 242, 1036: 141, 1041: 193, 1091: 243, 1092: 244, 8224: 134, 1093: 245, 8470: 185, 1094: 246,
        1054: 206, 1095: 247, 1096: 248, 8249: 139, 1097: 249, 1098: 250, 1044: 196, 1099: 251, 1111: 191, 1055: 207,
        1100: 252, 1038: 161, 8220: 147, 1101: 253, 8250: 155, 1102: 254, 8216: 145, 1103: 255, 1043: 195, 1105: 184,
        1039: 143, 1026: 128, 1106: 144, 8218: 130, 1107: 131, 8217: 146, 1108: 186, 1109: 190
    };

    this.win1251UrlEncode = function(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var ord = str.charCodeAt(i);
            if (ord < 128) {
                result += encodeURIComponent(str.charAt(i));
            }
            else if (ord in win1251map) {
                result += '%' + win1251map[ord].toString(16).toUpperCase();
            } else {
                result += encodeURIComponent('&#' + ord + ';');
            }
        }
        return result;
    };

    this.createQuery = function(formData, createSearchFormLink) {
        createSearchFormLink = createSearchFormLink || false;

        var isQuickSearch = formData.filter(function (field) { return field.name === 'quicksearch' && field.value === "1"; }).length > 0;

        var fieldsToRemove = [ 'securitytoken', 'do', "s", 'quicksearch' ];
        if (isQuickSearch) {
            fieldsToRemove.push('exactname');
            fieldsToRemove.push('childforums');
        }

        var queryData = formData.filter(function (field) {
            return $.inArray(field.name, fieldsToRemove) === -1;
        });

        if (!createSearchFormLink) {
            queryData.push({ name: 'do', value:'process' });
        }

        return queryData;
    };

    this.serializeQuery = function(queryData) {
        return queryData.map(function (field) {
            return self.win1251UrlEncode(field.name) + '=' + self.win1251UrlEncode(field.value);
        }).join('&');
    };

    this.createUrl = function(form, createSearchFormLink) {
        var formData = $(form).eq(0).serializeArray();

        var query = self.serializeQuery(self.createQuery(formData, createSearchFormLink));

        return window.location.protocol + "//" + window.location.hostname + '/search.php?' + query;
    };

    function onLinkClicked(e, sender, createSearchFormLink) {
        e.preventDefault();
        e.stopPropagation();

        var table = sender.closest('table');
        var form = table.find('form');
        if (!form.length) {
            form = table.closest('form');
        }

        var url = self.createUrl(form, createSearchFormLink);

        var link = sender.find('a');
        link.attr('href', url);

        GM_setClipboard(url);

        $('.link-popup').hide();
        var popup = $('<span class="link-popup" style="display: none;">ссылка скопирована в буфер обмена</span>')
            .appendTo(sender.parent());
        popup.fadeIn();
        popup.delay(2500).fadeOut();
    }

    function doInit() {
        var quickSearchTables = $('#navbar_search_menu, #threadsearch_menu, #header_right_cell').find('tbody');
        var mainSearchTable = $('button[name="dosearch"]').parent().parent();

        var quickSearchCopyLinks = $(
            '<tr class="search-copy-link"><td class="vbmenu_option vbmenu_option_alink"><a href="javascript:void(0)"">Скопировать ссылку</a></td></tr>')
            .appendTo(quickSearchTables);
        var quickSearchFormCopyLinks = $(
            '<tr class="search-copy-form-link"><td class="vbmenu_option vbmenu_option_alink"><a href="javascript:void(0)"">Скопировать ссылку на форму</a></td></tr>')
            .appendTo(quickSearchTables);

        $.merge(quickSearchCopyLinks, quickSearchFormCopyLinks).hover(
            // simulate default vBulletin behavior
            function() {
                $(this).children().addClass('vbmenu_hilite vbmenu_hilite_alink');
                $(this).children().removeClass('vbmenu_option vbmenu_option_alink');
            },
            function() {
                $(this).children().addClass('vbmenu_option vbmenu_option_alink');
                $(this).children().removeClass('vbmenu_hilite vbmenu_hilite_alink');
            });

        quickSearchCopyLinks.click(function (e) {
            onLinkClicked(e, $(this), false);
        });
        quickSearchFormCopyLinks.click(function (e) {
            onLinkClicked(e, $(this), true);
        });

        // hide buttons for header search box until focus, to avoid "jumping" on each page load
        var headerSearchCopyLinks = $('#header_right_cell').find('.search-copy-link, .search-copy-form-link');
        headerSearchCopyLinks.hide(0);
        $('#header_right_cell').find('input').focus(function () {
            headerSearchCopyLinks.show();
        });
    }

    this.init = function() {
        if (window.searchLinkInitialized)
            return;
        window.searchLinkInitialized = true;

        doInit();
    };
};
searchlink.init();
