import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { component } from '../scripts/components.js';

test('nested components preserve Slate Liquid exactly', () => {
  const root = mkdtempSync(join(tmpdir(), 'slate-liquid-'));
  try {
    const liquid = `{% if applicant %}{{ applicant.name | escape }}{% endif %}\n{% include 'slate-owned' %}`;
    writeFileSync(join(root, 'parent.html'), '<main><!-- component: child.html --></main>');
    writeFileSync(join(root, 'child.html'), liquid);
    assert.equal(component('parent.html', [], root), `<main>${liquid}</main>`);
    writeFileSync(join(root, 'child.html'), '<!-- component: parent.html -->');
    assert.throws(() => component('parent.html', [], root), /Circular component/);
    assert.throws(() => component('../outside.html', [], root), /Invalid component/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
