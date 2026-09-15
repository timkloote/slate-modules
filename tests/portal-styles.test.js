import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { loadPortalStyles, portalStylesheets } from '../src/js/portal-styles.js';

test('portal CSS preserves supplied order ahead of local CSS without duplicates or legacy JS', () => {
 const {document}=parseHTML('<html><head><link rel="stylesheet" href="/css/slate.css"><link rel="stylesheet" href="/css/accessibility.css"></head><body></body></html>');
 loadPortalStyles(document);
 loadPortalStyles(document);
 assert.deepEqual([...document.querySelectorAll('link')].map(link=>link.getAttribute('href')), [...portalStylesheets,'/css/slate.css','/css/accessibility.css']);
 assert.equal(document.querySelector('script'),null);
});
