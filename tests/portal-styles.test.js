import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { loadPortalStyles, portalStylesheets, configurePreviewStyles } from '../src/js/portal-styles.js';

test('portal CSS preserves supplied order ahead of local CSS without duplicates or legacy JS', () => {
 const {document}=parseHTML('<html><head><link rel="stylesheet" href="/css/grad-admissions.css"></head><body></body></html>');
 loadPortalStyles(document);
 loadPortalStyles(document);
 assert.deepEqual([...document.querySelectorAll('link')].map(link=>link.getAttribute('href')), [...portalStylesheets,'/css/grad-admissions.css']);
 assert.equal(document.querySelector('script'),null);
 assert.deepEqual(portalStylesheets.slice(0, 4), ['/simulator/styles/slate-framework-base.css', '/simulator/styles/slate-portal-base.css', '/simulator/styles/slate-render.css', '/simulator/styles/slate-layout.css']);
 assert.equal(portalStylesheets.length, 9);
});

for (const mode of ['design', 'portal', 'legacy']) {
 test(`legacy sources exclude redesign CSS with styles=${mode}`, () => {
  const {document}=parseHTML('<html><head><link rel="stylesheet" href="/css/grad-admissions.css"></head><body></body></html>');
  configurePreviewStyles(document, new URLSearchParams({source:'legacy', styles:mode}));
  assert.equal(document.querySelector('link[href="/css/grad-admissions.css"]'), null);
  assert.deepEqual([...document.querySelectorAll('link[data-portal-style]')].map(link=>link.getAttribute('href')), portalStylesheets);
 });
}
