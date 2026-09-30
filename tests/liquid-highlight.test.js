import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { highlightLiquidSource, highlightLiquidPreview } from '../src/js/liquid-highlight.js';

test('Liquid code highlighting preserves literal source and cannot interpret markup', () => {
  const { document } = parseHTML('<html><body><pre><code></code></pre></body></html>');
  const source = '<img onerror="alert(1)" src="{{ image }}">\n{% if {{active}} == "1" %}\nHello {{- name | escape -}}{% endif %}';
  const code = document.querySelector('code');
  highlightLiquidSource(code, source);
  assert.equal(code.textContent, source);
  assert.equal(code.querySelector('img'), null);
  assert.equal(code.querySelectorAll('.liquid-token--logic').length, 2);
  assert.equal(code.querySelectorAll('.liquid-token--value').length, 2);
});

test('preview highlights text without changing attributes, form values, or embedded styles', () => {
  const { document } = parseHTML('<html><body><div id="preview"><p title="{{ title }}">{% if ok %}Hello {{ name }}{% endif %}</p><textarea>{{ value }}</textarea><style>.x { color: {{ color }}; }</style><!-- {{ comment }} --></div></body></html>');
  const root = document.getElementById('preview');
  const text = root.textContent;
  highlightLiquidPreview(root);
  assert.equal(root.textContent, text);
  assert.equal(root.querySelector('p').getAttribute('title'), '{{ title }}');
  assert.equal(root.querySelector('textarea').innerHTML, '{{ value }}');
  assert.equal(root.querySelector('style').textContent, '.x { color: {{ color }}; }');
  assert.equal(root.querySelectorAll('.liquid-token').length, 3);
  highlightLiquidPreview(root);
  assert.equal(root.querySelectorAll('.liquid-token').length, 3);
});
