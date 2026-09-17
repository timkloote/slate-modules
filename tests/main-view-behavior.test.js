import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { initMainViewBehavior } from '../src/js/main-view-behavior.js';

const documentFor = html => parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;

test('moves original and proposed classes in order without moving layout ancestors', () => {
 const document=documentFor(`<div id="root"><div id="a" class="part leftcolumn"></div><div id="b" class="part col-left"></div><div id="c" class="part rightcolumn"></div><div class="leftcolumn" id="layout"><div id="leftcolumn"></div><div id="rightcolumn"></div></div></div>`);
 const root=document.getElementById('root');
 initMainViewBehavior(root);initMainViewBehavior(root);
 assert.deepEqual([...document.getElementById('leftcolumn').children].map(n=>n.id),['a','b']);
 assert.equal(document.getElementById('c').parentElement.id,'rightcolumn');
 assert.equal(document.getElementById('layout').parentElement,root);
});

test('updates widget content and remains idempotent when rerun', () => {
 const document=documentFor(`
 <div class="applicant_events_widget"></div>
 <div id="part_8957922f-9774-4ff2-a799-6efef0feacf3"><div><h3>Old</h3><a>Old link</a></div></div>
 <div id="part_93ad9de8-bb73-4452-b320-a89aa09af839"><div><form></form></div></div>
 <div id="part_416aad3d-54b3-4596-9c3c-bf4360ffe893"><select></select></div>
 <div id="part_2dd69944-5553-456a-8b05-4c6903e6f2be"><div class="annotation">Preview label</div></div>
 <div id="content"><table class="fixed"></table></div>`);
 const options={ignoreElement:element=>element.classList.contains('annotation')};
 initMainViewBehavior(document,options);initMainViewBehavior(document,options);
 assert.equal(document.querySelectorAll('[data-slate-visit-heading]').length,1);
 assert.equal(document.querySelectorAll('[data-slate-switch-heading]').length,1);
 assert.equal(document.querySelectorAll('.slate-payment-heading').length,1);
 assert.equal(document.querySelectorAll('.row').length,1);
 assert.equal(document.querySelector('#part_8957922f-9774-4ff2-a799-6efef0feacf3 h3').textContent,'You Have An Admissions Decision');
 assert.equal(document.querySelector('#content table').classList.contains('fixed'),false);
});

test('does not invent absent widgets or replace existing payment content', () => {
 const document=documentFor('<div id="part_2dd69944-5553-456a-8b05-4c6903e6f2be"><p>Payment due: $100</p></div>');
 const before=document.body.innerHTML;
 const {missing}=initMainViewBehavior(document);
 assert.equal(document.body.innerHTML,before);
 assert.ok(missing.includes('#leftcolumn'));
 assert.ok(missing.includes('#part_416aad3d-54b3-4596-9c3c-bf4360ffe893 > select'));
});
