import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { loadPortalStyles, portalStylesheets } from '../src/js/portal-styles.js';

test('portal CSS preserves supplied order ahead of local CSS without duplicates or legacy JS', () => {
 const {document}=parseHTML('<html><head><link rel="stylesheet" href="/css/grad-admissions.css"></head><body></body></html>');
 loadPortalStyles(document);
 loadPortalStyles(document);
 assert.deepEqual([...document.querySelectorAll('link')].map(link=>link.getAttribute('href')), [...portalStylesheets,'/css/grad-admissions.css']);
 assert.equal(document.querySelector('script'),null);
 assert.deepEqual(portalStylesheets.slice(0, 3), ['/simulator/styles/slate-framework-base.css', '/simulator/styles/slate-portal-base.css', '/simulator/styles/slate-layout.css']);
 assert.equal(portalStylesheets.length, 8);
});
