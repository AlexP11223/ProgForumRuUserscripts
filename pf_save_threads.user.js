// ==UserScript==
// @name         ProgrammersForum Save Threads
// @namespace    programmersforum.ru
// @version      1.2.0
// @description  adds exportThreads function to export the specified threads
// @author       Alex P
// @include      *programmersforum.ru/*
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js
// @require      https://unpkg.com/axios/dist/axios.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @grant        none
// @downloadURL  https://github.com/AlexP11223/ProgForumRuUserscripts/raw/master/pf_save_threads.user.js
// ==/UserScript==

(function () {
    'use strict';

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function parseHtml(html) {
        return new DOMParser().parseFromString(html, 'text/html')
    }

    function parseThread(html) {
        const htmlDoc = parseHtml(html);

        const pageCountBar = htmlDoc.querySelector('.pagenav .vbmenu_control');

        return {
            head: htmlDoc.head.outerHTML,
            content: htmlDoc.querySelector('#posts').innerHTML,
            title: htmlDoc.querySelector('.navbar strong').textContent.trim(),
            categories: Array.from(htmlDoc.querySelectorAll('.navbar a[href^=forumdisplay]')).map(el => el.textContent.trim()),
            pageCount: pageCountBar ? parseInt(pageCountBar.textContent.split(' ')[3]) : 1,
        };
    }

    function threadUrl(threadId) {
        return `/showthread.php?t=${threadId}`;
    }

    function generateThreadPagesUrls(threadId, pageCount) {
        const firstPageUrl = threadUrl(threadId);
        return [firstPageUrl, ..._.range(2, pageCount + 1, 1).map(n => `${firstPageUrl}&page=${n}`)];
    }

    function loadImageBase64(url) {
        console.log(`Loading ${url}`);
        return axios.get(url, {responseType: 'arraybuffer'})
            .then(response => `data:${response.headers['content-type']};base64,${btoa(String.fromCharCode(...new Uint8Array(response.data)))}`);
    }

    function loadFile(url) {
        console.log(`Loading ${url}`);
        return axios.get(url, {responseType: 'blob'})
            .then(response => response.data);
    }

    const IMG_CACHE = new Map();

    async function replaceRemoteImages(html) {
        const htmlDoc = parseHtml(html);

        const imgs = [
            ...htmlDoc.querySelectorAll('a[href^="member.php"] img[src*="u="]'),
            ...htmlDoc.querySelectorAll('img[src*="attachmentid="]'),
            ...htmlDoc.querySelectorAll('img[src^="images/smilies/"]'),
        ];
        const imgUrls = imgs.map(img => img.src);

        for (const imgUrl of imgUrls) {
            if (!IMG_CACHE.has(imgUrl)) {
                try {
                    IMG_CACHE.set(imgUrl, await loadImageBase64(imgUrl));
                } catch (e) {
                    console.log(e);
                }
            }
        }

        for (const img of imgs) {
            const localUrl = IMG_CACHE.get(img.src);
            if (localUrl) {
                img.src = localUrl;
            }
        }

        return htmlDoc.body.innerHTML;
    }

    async function loadAttachments(html) {
        const htmlDoc = parseHtml(html);

        const attachmentLinks = [
            ...htmlDoc.body.querySelectorAll('a[href*="attachmentid"]:not([rel])'),
        ];

        let attachments = [];
        for (const link of attachmentLinks) {
            await sleep(_.random(1000, 3000));

            try {
                const id = new URL(link.href, location.origin).searchParams.get('attachmentid');
                attachments.push({
                    id,
                    name: sanitizeFileName(link.textContent),
                    blob: await loadFile(url.href),
                });
            } catch (e) {
                console.log(e);
            }
        }

        return attachments;
    }

    const MIME_EXTENSION_MAP = new Map(Object.entries({
        'application/zip': '.zip',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'plain/text': '.txt',
        // looks like other types are unknown/unknown in vBulletin
    }));

    function getExtension(mimeType) {
        return MIME_EXTENSION_MAP.has(mimeType) ? MIME_EXTENSION_MAP.get(mimeType) : '';
    }

    async function loadThread(id) {
        console.log(`Loading ${threadUrl(id)}`);
        const firstPage = parseThread(await $.get(threadUrl(id)));

        console.log(`${firstPage.title} (${firstPage.pageCount} pages)`);

        await sleep(_.random(1000, 3000));

        let pages = [firstPage];
        for (const url of generateThreadPagesUrls(id, firstPage.pageCount).slice(1)) {
            await sleep(_.random(1000, 3000));

            console.log(`Loading ${url}`);
            pages.push(parseThread(await $.get(url)));
        }

        const head = pages[0].head.replace('windows-1251', 'utf-8');

        const postsHtml = `<div id="posts">${pages.map(p => p.content).join('')}</div>`;
        const postsHtmlWithImages = await replaceRemoteImages(postsHtml);

        return {
            id,
            title: firstPage.title,
            categories: firstPage.categories,
            pageCount: firstPage.pageCount,
            attachments: await loadAttachments(postsHtml),
            html: `<!DOCTYPE html>
<html lang="ru">
${head}
<body>
<style type="text/css">
    img[src^="images/1070/"],
    img[src="images/icons/icon1.gif"]
    { display: none; }
</style>
<h2>${firstPage.categories.join(' - ')}</h2>
<h1>${firstPage.title}</h1>
${postsHtmlWithImages}
</body></html>`,
        };
    }

    function sanitizeFileName(input, replacement = ' ') {
        return _.truncate(input, {length: 100, omission: ''})
            .replace(/[\/\?<>\\:\*\|"]/g, replacement);
    }

    window.exportThreads = async function (...ids) {
        const zip = new JSZip();

        const ZIP_ROOT = 'programmersforum_export/';

        for (const id of ids) {
            const thread = await loadThread(id);

            const fileName = `${thread.id} ${sanitizeFileName(_.truncate(thread.title, {length: 100}))}.html`;
            const path = thread.categories.map(sanitizeFileName).join('/');
            zip.file(`${ZIP_ROOT}${path}/${fileName}`, thread.html);

            for (const attachment of thread.attachments) {
                zip.file(`${ZIP_ROOT}${path}/attachments/${attachment.id} ${attachment.name}`, attachment.blob);
            }
        }

        const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        });
        saveAs(zipBlob, 'threads.zip');
    };

    window.loadThreadsList = async function (forumId) {
        const startUrl = `/archive/index.php/f-${forumId}.html`;

        console.log(`Loading ${startUrl}`);
        const firstPageHtmlDoc = parseHtml(await $.get(startUrl));

        const nextUrls = Array.from(firstPageHtmlDoc.body.querySelectorAll('a[href*="-p-"]')).map(a => a.href);

        let htmlDocs = [firstPageHtmlDoc];
        for (const url of nextUrls) {
            await sleep(_.random(1000, 3000));

            console.log(`Loading ${url}`);
            htmlDocs.push(parseHtml(await $.get(url)));
        }

        return _.flatten(htmlDocs.map(d => Array.from(d.body.querySelectorAll('li a')).map(a => a.href)))
            .map(url => url.split('-').slice(-1)[0].split('.')[0]);
    };
})();
