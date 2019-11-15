UserScripts for a vBulettin 3.8 forum (https://programmersforum.ru). The scripts were tested usng TamperMonkey for Chrome and Forefox (also earlier GreaseMonkey but it became broken after Firefox 57 and we stoped using it).

Some scripts (in [/non-user-js](/non-user-js)) were adapted to normal JS scripts that can be integrated into the forum by the forum owner.

## [Reply Templates](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_reply_templates.user.js)

Allows to quickly insert a prepared reply/snippet (mostly intended for moderators).

Loads the templates from  a YAML file like [data/reply_templates.yaml](data/reply_templates.yaml) using the specified URL. It can be a GitHub/Gist.GitHub Raw link or any other direct link. If the forum uses HTTPS the link also must be a HTTPS website and it must have a suitable `Access-Control-Allow-Origin` response header (Google.Drive doesn't have it), if it is not possible a workaround could be a proxy like https://cors-anywhere.herokuapp.com/ (may add some delay). The URL is stored in LocalStorage and requested every time when the dialog is opened, without any caching — it is very fast anyway for most hostings and significantly simplifies the implementation (note though that GET requests may be cached by web browsers, so for example when you changed the file on GitHub you may need to wait several minutes to see the changes in the dialog or disable caching in DevTools).

The format supports basic variables/sub-templates (currently not recursive) to reduce duplication. Any template with `id` can be used inside another template via `$templateName$`. Add `hide: true` to hide template in the dialog.

Insertion modes:

- **insert** (default) — insert at the current cursor position. Selected text will be removed.
- **append**/**prepend** — insert after/before the text currently entered text. The cursor position and selection are preserved.

Works in all message editors: quick/fully reply, quick/full edit, moderator's warning description, PM, etc.

[![](https://i.imgur.com/kxsByur.png)](https://www.youtube.com/watch?v=siXSBz3qQRY)

## [Geo IP](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_geoip.user.js)

Adds location and other info from several free Geo IP APIs, also extracts and parses useragents from the Who's Online page to show OS and web browser.

Also parses useragents on the Who's Online page and adds buttons to show the Geo IP data there (some of the APIs have request limit).

Note: you may need to disable your ad block for `/online.php?*`, `/postings.php?*` pages.

![](https://i.imgur.com/9SXBAUr.png)

![](https://i.imgur.com/iWoKlxZ.png)

![](https://i.imgur.com/T89fQs4.png)

## [Autosave unsent posts](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_post_autosave.user.js)

Saves and restores the content of the text editor in each thread (until the message is sent) in LocalStorage, to avoid losing it when web browser or OS crash or the page is closed accidentally.

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

![](https://i.imgur.com/bylorrt.gif)

## [Copy Post Link](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_post_link.user.js)

Adds a button in the top-right corner of each message to copy the link to this message to the clipboard.

Originally it was generating `#post<id>` links that open the whole page and scroll to the specified message, but later it was replaced to `showpost.php?p=<id>` opening a page with just one message because `#post<id>` (as well as `showthread.php?p=<id>`) do not work corretly sometimes, such as when there are unread messages or when some messages were removed and the specified message moved to another page.

![](https://i.imgur.com/xIf912s.png)

## [Copy Search Link](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_search_link.user.js)

Adds buttons to copy links to the search results (you cannot simply copy it from the address bar because it expires) or filled search form.

The script contains manual conversion from Unicode to CP1251 (Russian) to fix some encoding issues in JS (non-Unicode vBulletin version).

![](https://i.imgur.com/Gob6uug.png)

## [Embed Videos](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_video_embed.user.js)

Replaces youtube and coub links with their video players.

Supports timestamps and different youtube URL formats, skips non-video links, such a playlists or channel pages.

Handles only links inside the message itself, not in signatures, etc.

![](https://i.imgur.com/GD9iTY8.png)

## [Better thread management (moderation)](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_fast_thread_management.user.js)

Makes the thread management menu more convenient. Converts radio buttons into buttons (2 clicks instead of one) and adds a dropdown list with the popular forum categories to quickly move the thread.

![](https://i.imgur.com/JFcu0kt.png)

## [Bot Detector, Visitor Counter](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_detect_bots.user.js)

![](https://i.imgur.com/w6M8Eyy.png)

Adds a function that counts normal users and bots (based on User-Agents or IP/subnet repetitions) in the list of online users.

Also it is possible to save the data automatically to IndexedDB every 20 minutes (vBulletin keeps all clients in this list for 30 minutes after the last page request) and later filter, export to CSV.

It was used to estimate the number of the unique visitors and compare with other counters.

## [Export Threads](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_save_threads.user.js)

![](https://i.imgur.com/jqUt0ku.png)

Adds a function that exports the specified threads (with all attachments, avatars, smiles, poll results) to HTML files that can be opened locally/offline.

Usage (in the web browser console): `exportThreads(123, 456, ...)`

The result will be a ZIP archive with this structure:

```
- category (e.g. Web Dev)
  - subcategory (e.g. PHP)
    - attachments
      - document.docx
      - files.zip
    - 123 Laravel vs Yii.html
    - 456 Is there something like array_any .html
```

Threads with multiple pages will be concatenated into single page.

You can also retrieve all thread IDs in the category like this: `loadThreadsList(50).then(ids => console.log(ids.join(', ')))`

## [Hotkey](https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/pf_hotkey.user.js)

Sends messages by `Ctrl + Enter`, works in all textareas (quick reply, edit, etc.).

There is a bug when using it to post a message in a thread with multiple pages not from the last page, the message will be sent successufully but the text will remain in the editor. Probably a conflict with the autosave script.
