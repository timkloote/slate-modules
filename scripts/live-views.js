import { inventory, escapeHtml } from './simulator.js';
export function liveViewPicker(currentView = 'main-view') {
  const destinations = inventory().views.map(view => ({ id: view.slug, name: view.name, url: `/views/${view.slug}/preview/?clean=1&labels=0&classes=new` }));
  const selected = destinations.find(view => view.id === currentView) || destinations[0];
  return `<div class="sim-live-views" data-live-view-picker data-view-destinations="${escapeHtml(JSON.stringify(destinations))}"><label for="live-view-picker">Simulator view</label><select id="live-view-picker">${destinations.map(view => `<option value="${view.id}"${view.id === selected.id ? ' selected' : ''}>${view.name}${view.inactive ? ' (inactive)' : ''}</option>`).join('')}</select><a href="${selected.url}" target="_blank" rel="noopener noreferrer" aria-label="Open selected simulator view in a new tab">Open view ↗</a></div>`;
}
