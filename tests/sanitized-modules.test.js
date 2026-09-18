import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const bootstrapClass = /^(?:row|col(?:-(?:sm|md|lg|xl|xxl))?(?:-\d+|-auto)?|container(?:-fluid|-(?:sm|md|lg|xl|xxl))?|position-(?:static|relative|absolute|fixed|sticky)|stretched-link|navbar(?:-.*)?|nav-(?:item|link)|dropdown(?:-.*)?|collapse|collapsing|table(?:-.*)?|btn(?:-.*)?|justify-content-.*|text-right)$/;

test('sanitized modules contain no Bootstrap classes, controls, or imports', () => {
 const files = readdirSync('src/modules', { recursive: true }).filter(file => file.endsWith('.html'));
 assert.equal(files.length, 217);
 for (const file of files) {
  const html = readFileSync(`src/modules/${file}`, 'utf8');
  for (const match of html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/gs)) {
   for (const name of match[2].split(/\s+/)) assert.ok(!bootstrapClass.test(name), `${file}: ${name}`);
  }
  assert.doesNotMatch(html, /<(?:script|link)\b[^>]*(?:bootstrap|popper)/i, file);
  assert.doesNotMatch(html, /\bdata-(?:bs-)?(?:toggle|target)=/, file);
 }
});
