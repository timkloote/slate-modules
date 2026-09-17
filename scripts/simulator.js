import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { component } from './components.js';

export const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function inventory() {
  const audit = JSON.parse(readFileSync('src/simulator/audit.json', 'utf8'));
  const views = [];
  for (const record of audit.modules) {
    const slug = record.view === 'Materials/Checklist' ? 'materials-checklist' : slugify(record.view);
    let view = views.find(v => v.slug === slug);
    if (!view) views.push(view = { slug, name: record.view, status: record.viewStatus, modules: [] });
    const directory = `src/modules/${slug}`;
    const candidates = existsSync(directory) ? readdirSync(directory).filter(f => f.startsWith(`${String(record.order).padStart(2, '0')}-`) && f.endsWith('.html')) : [];
    if (candidates.length > 1) throw new Error(`Ambiguous source: ${slug} ${record.order}`);
    const source = candidates.length ? `${directory}/${candidates[0]}` : null;
    const legacyDirectory = `src/legacy/modules/${slug}`;
    const legacyCandidates = existsSync(legacyDirectory) ? readdirSync(legacyDirectory).filter(f => f.startsWith(`${String(record.order).padStart(2, '0')}-`) && f.endsWith('.html')) : [];
    if (legacyCandidates.length > 1) throw new Error(`Ambiguous legacy source: ${slug} ${record.order}`);
    const legacySource = legacyCandidates.length ? `${legacyDirectory}/${legacyCandidates[0]}` : null;
    const legacyHtml = legacySource ? readFileSync(legacySource, 'utf8') : '';
    const fixture = `src/simulator/fixtures/${slug}/${record.partId}.html`;
    const hasFixture = existsSync(fixture);
    const html = source ? readFileSync(source, 'utf8') : '';
    let replacement = null;
    if (/^header(?:\b|$)/i.test(record.name)) replacement = 'header';
    // These imported DOM modules contain the old footer. Substitution is local only.
    if (record.name === 'DOM' && /<footer\b/i.test(html)) replacement = 'footer';
    view.modules.push({ ...record, source, legacySource, legacyHtml, fixture, hasFixture, replacement,
      html: hasFixture ? readFileSync(fixture, 'utf8') : replacement ? component(`${replacement}.html`).replaceAll('src="images/', 'src="/images/') : html,
      sourceHtml: html,
      needsCapture: record.type !== 'Static Content' && !hasFixture,
    });
  }
  for (const view of views) view.modules.sort((a,b) => a.order-b.order);
  return { source: audit.source, views, capturedParts: JSON.parse(readFileSync('src/simulator/captured-parts.json', 'utf8')) };
}

export function documentPage(title, body, script, css = 'simulator') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/css/${css}.css"></head><body>${body}<script type="module" src="/js/${script}.js"></script></body></html>`;
}
