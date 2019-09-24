UserScripts for a vBulettin 3.8 forum (https://programmersforum.ru). The scripts were tested usng TamperMonkey for Chrome and Forefox (also earlier GreaseMonkey but it became broken after Firefox 57 and we stoped using it).

Some scripts (in [/non-user-js](/non-user-js)) were adapted to normal JS scripts that can by embedded by the forum owner.

## [Reply Templates](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_reply_templates.user.js)

Allows to quickly insert a prepared answer (mostly intended for moderators).

Loads the templates from  a YAML file like in [data/reply_templates.yaml](data/reply_templates.yaml) using the specified URL. It can be a GitHub/Gist.GitHub Raw link or any other direct link. If the forum uses HTTPS the link also must be a HTTPS website and it must have a suitable `Access-Control-Allow-Origin` response header (Google.Drive doesn't have it), if it is not possible a workaround could be a proxy like https://cors-anywhere.herokuapp.com/ (may add some delay).

[![](https://i.imgur.com/kxsByur.png)](https://www.youtube.com/watch?v=siXSBz3qQRY)

## [Geo IP](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_geoip.user.js)

Adds location and other info from several free Geo IP APIs, also extracts and parses useragents from the Who's Online page to show OS and web browser.

Also parses useragents on the Who's Online page and adds buttons to show the Geo IP data there (some of the APIs have request limit).

![](https://i.imgur.com/9SXBAUr.png)

![](https://i.imgur.com/iWoKlxZ.png)

![](https://i.imgur.com/T89fQs4.png)

## [Autosave unsent posts](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_post_autosave.user.js)

Saves the content of the text editor in each thread (until the message is sent) in LocalStorage, to avoid losing it when web browser or OS crash or the page is closed accidentally.

The content is saved separately for each thread, so it can be also used as draft.

Works only for replies, not for editing or creating new threads.

## [Improved code syntax highlighting](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_code_highlighter.user.js)

Improves [highlightjs](https://highlightjs.org/) automatic language detection by limiting the language list depending on the forum category.

For example, in the C++ category it is limited to C++ and several other common languages like XML, JSON, SQL.

Before this improvement the code language was detected incorrectly sometimes making it more difficult to read.

Eventually this script was [integrated](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/non-user-js/highlight/code_highlighter.js) into the forum itself, and also [CODE=**lang**] tag was added allowing to specify the language manually.

## [Quick Quote](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_quick_quote.user.js)

Shows a button near the mouse cursor to quote the selected text.

Also modifies the behavior of the standard Quote button (that quotes the whole message) to add the quote into the quick reply editor instead of openning the page with the full editor.

![](https://i.imgur.com/ENQQHwx.gif)

## [Copy Post Link](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_post_link.user.js)

Adds a button in the top-right corner of each message to copy the link to this message to the clipboard.

Originally it was generating `#post<id>` links that open the whole page and scroll to the specified message, but later it was replaced to `showpost.php?p=<id>` opening a page with just one message because `#post<id>` (as well as `showthread.php?p=<id>`) do not work corretly sometimes, such as when there are unread messages or when some messages were removed and the specified message moved to another page.

![](https://i.imgur.com/xIf912s.png)

## [Copy Search Link](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_search_link.user.js)

Adds buttons to copy links to the search results (you cannot simply copy it from the address bar because it expires) or filled search form.

The script contains manual conversion from Unicode to CP1251 (Russian) to fix some encoding issues in JS (the forum was using non-Unicode vBulletin version).

![](https://i.imgur.com/Gob6uug.png)

## [Embed Videos](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_video_embed.user.js)

Replaces youtube and coub links with their video players.

Supports timestamps and different youtube URL formats, skips non-video links, such a playlists or channel pages.

Handles only links inside the message itself, not in signatures, etc.

![](https://i.imgur.com/GD9iTY8.png)

## [Better thread managemnt (moderation)](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_fast_thread_management.user.js)

## [Hotkey](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_hotkey.user.js)

Sends messages by `Ctrl + Enter`, works in all textareas (quick reply, edit, etc.).

There is a bug when using it to post a message in a thread with multiple pages not from the last page, the message will be sent successufully but the text will remain in the editor. Probably a conflict with the autosave script.
