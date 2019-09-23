UserScripts for a vBulettin 3.8 forum (https://programmersforum.ru). The scripts were tested usng TamperMonkey for Chrome and Forefox (also earlier GreaseMonkey but it became broken after Firefox 57 and we stoped using it).

Some scripts (in [/non-user-js](/non-user-js)) were adapted to normal JS scripts that can by embedded by the forum owner.

## [Reply Templates](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_reply_templates.user.js)

## [Geo IP](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_geoip.user.js)

Adds location and other info from several free Geo IP APIs, also extracts and parses useragents from the Who's Online page to show OS and web browser.

Also parses useragents on the Who's Online page and adds buttons to show the Geo IP data there (some of the APIs have request limit).

![](https://i.imgur.com/9SXBAUr.png)

![](https://i.imgur.com/iWoKlxZ.png)

![](https://i.imgur.com/T89fQs4.png)

## [Hotkey](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_hotkey.user.js)

Sends messages by `Ctrl + Enter`, works in all textareas (quick reply, edit, etc.).

There is a bug when using it to post a message in a thread with multiple pages not from the last page, the message will be sent successufully but the text will remain in the editor. Probably a conflict with the autosave script.

## [Autosave unsent posts](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_post_autosave.user.js)

## [Copy Post Link](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_post_link.user.js)

## [Copy Search Link](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_search_link.user.js)

## [Improved code syntax highlighting](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_code_highlighter.user.js)

## [Embed Videos](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_video_embed.user.js)

## [Quick Quote](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_reply_templates.user.js)

## [Better thread managemnt (moderation)](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_fast_thread_management.user.js)
