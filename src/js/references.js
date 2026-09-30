export function filterReferences(pages, query, category) {
 const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return pages.filter(p => (!category || p.category === category) && words.every(word => [p.title, p.category, p.url, ...p.headings].join(' ').toLowerCase().includes(word)));
}
export function initReferences(pages, doc = document, win = window) {
 const el = id => doc.getElementById(`reference-${id}`);
 let visible = pages;
 let selected;
 const cards = [...doc.querySelectorAll('[data-reference]')];
 function select(id, updateUrl = true) {
  selected = pages.find(p => p.id === id) || visible[0];
  if (!selected) return;
  el('title').textContent = selected.title;
  el('image').src = selected.screenshot;
  el('image').alt = `Full page screenshot of ${selected.title}`;
  el('original').href = selected.screenshot;
  el('live').href = selected.url;
  el('meta').textContent = `${selected.category} · 1440 × ${selected.height}px · ${new URL(selected.url).pathname}`;
  cards.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.reference === selected.id)));
  const index = visible.indexOf(selected);
  el('prev').disabled = index <= 0;
  el('next').disabled = index < 0 || index >= visible.length - 1;
  const canvas = doc.querySelector('.reference-canvas');
  canvas.scrollTop = 0; canvas.scrollLeft = 0;
  if (updateUrl) { const url = new URL(win.location.href); url.searchParams.set('page', selected.id); win.history.replaceState(null, '', url); }
 }
 function filter() {
  visible = filterReferences(pages, el('search').value, el('category').value);
  const ids = new Set(visible.map(p => p.id));
  cards.forEach(c => { c.hidden = !ids.has(c.dataset.reference); });
  el('count').textContent = `${visible.length} of ${pages.length} pages${visible.length ? '' : ' — no matches. Try another search.'}`;
  if (visible.length) select(ids.has(selected?.id) ? selected.id : visible[0].id);
  else { el('prev').disabled = true; el('next').disabled = true; }
 }
 cards.forEach(c => c.addEventListener('click', () => select(c.dataset.reference)));
 el('search').addEventListener('input', filter);
 el('category').addEventListener('change', filter);
 for (const [name, step] of [['prev', -1], ['next', 1]]) el(name).addEventListener('click', () => { const p = visible[visible.indexOf(selected) + step]; if (p) select(p.id); });
 el('size').addEventListener('change', () => { el('image').style.width = el('size').value === 'fit' ? '100%' : '1440px'; });
 select(new URL(win.location.href).searchParams.get('page'), false);
 el('count').textContent = `${pages.length} of ${pages.length} pages`;
}
if (typeof document !== 'undefined' && document.getElementById('reference-list')) {
 fetch('/references/catalog.json').then(r => { if (!r.ok) throw new Error('Catalog unavailable'); return r.json(); }).then(pages => initReferences(pages)).catch(() => { document.getElementById('reference-count').textContent = 'Could not load references. Reload to try again.'; });
}
