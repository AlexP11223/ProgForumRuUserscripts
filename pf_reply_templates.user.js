// ==UserScript==
// @name         Reply Templates
// @namespace    programmersforum.ru
// @version      2.0
// @description
// @author       Alex P
// @include      *programmersforum.ru/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.13.1/js-yaml.min.js
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/AlexP11223/ProgForumRuUserscripts/master/pf_reply_templates.user.js
// ==/UserScript==

(function () {
    'use strict';

    if (window.replyTemplatesInitialized)
        return;
    window.replyTemplatesInitialized = true;

    const DEFAULT_URL = 'https://raw.githubusercontent.com/AlexP11223/ProgForumRuUserscripts/master/data/reply_templates.yaml';
    const LOCALSTORAGE_URL_KEY = 'reply_templates_url';

    // ===================================
    // <CSS>

    function styleCustomControlsBar(controlsBar) {
        controlsBar.css({
            textAlign: 'left',
        });
    }

    function styleModal(modal) {
        modal.css({
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 999,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        });
        modal.find('.modal-box').css({
            position: 'relative',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgb(225, 228, 242)',
            borderRadius: '10px',
            border: '2px solid rgb(190, 190, 190)',
            padding: '15px',
            width: '800px',
            height: '720px',
            overflow: 'auto'
        });
    }

    function styleTemplatesForm(form) {
        form.find('.horizontal-group').css({
            display: 'flex',
        });
        form.find('.horizontal-group input').css({
            flexGrow: 1,
            marginRight: '10px'
        });
    }

    function styleTemplatesList(templatesList) {
        templatesList.css({
            display: 'flex',
            flexWrap: 'wrap',
            padding: 0,
            margin: '-10px',
            listStyleType: 'none',
        });
        templatesList.find('li').css({
            margin: '10px',
            width: 'calc(50% - 20px)',
        });
        templatesList.find('button').css({
            fontSize: '16pt',
            padding: '20px',
            width: '100%',
            textAlign: 'left',
        });
    }
    // </CSS>
    // ===================================

    class Editor {
        constructor(editorElement) {
            this.element = $(editorElement);
            this.textarea = this.element.find('textarea');

            this.vbObj = Object.values(window.vB_Editor).find(o => o.textobj.id === this.textarea.attr('id'));
        }

        insert(text) {
            this.vbObj.insert_text(text);
            this.vbObj.collapse_selection_end();
        }

        append(text) {
            const selectionStart = this.textarea[0].selectionStart;
            const selectionEnd = this.textarea[0].selectionEnd;

            this.textarea.val(this.textarea.val() + text);

            this.textarea[0].selectionStart = selectionStart;
            this.textarea[0].selectionEnd = selectionEnd;
            this.textarea[0].focus();
        }
    }

    class ProgressIndicator
    {
        constructor(element) {
            this.element = $(element);
        }

        show() {
            this.element.fadeIn(100);
        }

        hide() {
            this.element.fadeOut(200);
        }
    }

    function saveTemplatesSourceUrl(url) {
        if (!url || url.trim().length < 5) {
            url = DEFAULT_URL;
        }

        window.localStorage.setItem(LOCALSTORAGE_URL_KEY, url);
    }

    function getTemplatesSourceUrl() {
        return window.localStorage.getItem(LOCALSTORAGE_URL_KEY);
    }

    function loadTemplates() {
        return new Promise((accept, reject) => {
            const url = getTemplatesSourceUrl();

            $.get(url, data => {
                try {
                    const doc = jsyaml.load(data);
                    // noinspection JSUnresolvedVariable
                    accept(doc.templates);
                } catch (err) {
                    reject(err);
                }
            })
                .fail((xhr, s, err) => reject(`Request failed. ${err}`));
        });
    }

    function replaceAll(str, search, replacement) {
        return str.split(search).join(replacement);
    }

    function render(template, templates) {
        let content = template.content.trim();

        // TODO: may want to make the variable evaluation recursive, that is to allow variable references inside
        //  the content of another variable
        //  could be fun to implement, but probably not really needed for this app
        const templatesWithId = templates.filter(t => t.id);
        templatesWithId.forEach(t => {
            content = replaceAll(content, `$${t.id}$`, t.content.trim());
        });

        return content;
    }

    function applyTemplate(editor, template, templates) {
        const content = render(template, templates);

        switch (template.action) {
            case 'append':
                editor.append('\n' + content);
                break;
            default:
            case 'insert':
                editor.insert(content);
                break;
        }
    }

    function makeModalBox() {
        const modal = $(`
<div class="modal">
    <div class="modal-box">
        <div class="modal-body"></div>
    </div>
</div>
`).appendTo('body');

        styleModal(modal);

        const closeModal = () => modal.remove();

        modal.click(e => {
            if (e.target === modal[0]) {
                closeModal();
            }
        });

        return {
            element: modal,
            body: modal.find('.modal-body'),
            close: closeModal
        }
    }

    function openTemplatesWindow(editor) {
        const modal = makeModalBox();

        const form = $(`
<div>
    <div class="horizontal-group">
        <input type="text" name="url" value="${getTemplatesSourceUrl()}"/>
        <button data-action="download">Загрузить</button>
    </div>
    <div style="height: 20px">
        <img style="display: none;" class="progress" src="https://www.programmersforum.ru/images/1070/misc/progress.gif" alt=""/>
    </div>
</div>`);

        form.find('button[data-action="download"]')
            .click(() => {
                const url = form.find('input[name="url"]').val();
                saveTemplatesSourceUrl(url);

                modal.close();
                openTemplatesWindow(editor);
            });

        styleTemplatesForm(form);

        modal.body.html(form);

        const progress = new ProgressIndicator(form.find('.progress'));
        progress.show();

        loadTemplates()
            .then(templates => {
                progress.hide();

                const shownTemplates = templates.filter(t => !t.hide);

                const templatesList = $('<ul></ul>');
                templatesList.append(shownTemplates.map((template, i) => $(`<li><button data-index="${i}">${template.name}</button></li>`)));

                templatesList.find('button')
                    .click(e => {
                        const index = $(e.currentTarget).data('index');
                        const template = shownTemplates[index];

                        applyTemplate(editor, template, templates);

                        modal.close();
                    });

                styleTemplatesList(templatesList);

                modal.body.append(templatesList);
            })
            .catch(err => {
                progress.hide();
                alert(err)
            });
    }

    function addEditorControls(editorElement) {
        const editor = new Editor(editorElement);

        if (!editor.element.find('.custom-controls').length) {
            $('<div class="controlbar custom-controls"></div>').insertAfter(editor.element.find('.controlbar:first'));
        }

        const customControlsBar = editor.element.find('.custom-controls');
        if (!customControlsBar.find('.reply-templates-btn').length) {
            $('<a href="javascript:void(0)" class="reply-templates-btn" style="border-bottom: 1px dashed #22229C">Шаблоны ответов</a>')
                .appendTo(customControlsBar)
                .click(() => openTemplatesWindow(editor));
        }

        styleCustomControlsBar(customControlsBar);
    }

    $('.vBulletin_editor').each((i, el) => addEditorControls($(el)));

    const posts = $('#posts');
    if (posts.length) {
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes) {
                    $(mutation.addedNodes)
                        .find('.vBulletin_editor')
                        .each((i, el) => addEditorControls($(el)));
                }
            });
        }).observe(posts[0], {childList: true, subtree: true});
    }
})();
