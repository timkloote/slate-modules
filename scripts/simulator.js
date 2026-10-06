import { readFileSync, readdirSync, existsSync } from 'node:fs';

export const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function inventory() {
  const audit = JSON.parse(readFileSync('src/simulator/audit.json', 'utf8'));
  const views = [];
  for (const record of audit.modules) {
    const slug = record.view === 'Materials/Checklist' ? 'materials-checklist' : slugify(record.view);
    let view = views.find(v => v.slug === slug);
    if (!view) views.push(view = { slug, name: record.view, status: record.viewStatus, modules: [] });
    const sourceView = record.sourceView || record.view;
    const sourceSlug = sourceView === 'Materials/Checklist' ? 'materials-checklist' : slugify(sourceView);
    const sourceOrder = record.sourceOrder ?? record.order;
    const directory = `src/modules/${sourceSlug}`;
    const candidates = existsSync(directory) ? readdirSync(directory).filter(f => f.startsWith(`${String(sourceOrder).padStart(2, '0')}-`) && f.endsWith('.html')) : [];
    if (candidates.length > 1) throw new Error(`Ambiguous source: ${slug} ${record.order}`);
    const source = candidates.length ? `${directory}/${candidates[0]}` : null;
    const legacyDirectory = `src/legacy/modules/${sourceSlug}`;
    const legacyCandidates = existsSync(legacyDirectory) ? readdirSync(legacyDirectory).filter(f => f.startsWith(`${String(sourceOrder).padStart(2, '0')}-`) && f.endsWith('.html')) : [];
    if (legacyCandidates.length > 1) throw new Error(`Ambiguous legacy source: ${slug} ${record.order}`);
    const legacySource = legacyCandidates.length ? `${legacyDirectory}/${legacyCandidates[0]}` : null;
    const legacyHtml = legacySource ? readFileSync(legacySource, 'utf8') : '';
    const fixture = `src/simulator/fixtures/${slug}/${record.partId}.html`;
    const hasFixture = existsSync(fixture);
    const html = source ? readFileSync(source, 'utf8') : '';
    // Preview the module source itself; captures override only rendered widgets.
    const replacement = null;
    view.modules.push({ ...record, source, legacySource, legacyHtml, fixture, hasFixture, replacement,
      html: hasFixture ? readFileSync(fixture, 'utf8') : html,
      sourceHtml: html,
      needsCapture: record.type !== 'Static Content' && !hasFixture,
    });
  }
  for (const view of views) view.modules.sort((a,b) => a.order-b.order);
  return { source: audit.source, views, capturedParts: JSON.parse(readFileSync('src/simulator/captured-parts.json', 'utf8')) };
}

export function documentPage(title, body, script, css = 'simulator') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/css/${css}.css"></head><body>${body}<script type="module" src="/js/${script}.js"></script>${body.includes('data-live-view-picker') ? '<script type="module" src="/js/live-views.js"></script>' : ''}</body></html>`;
}
