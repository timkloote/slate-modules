import { liveViews } from '../src/js/live-views.js';
export function liveViewPicker(currentView = 'main-view') {
  const selected = liveViews.find(view => view.id === currentView) || liveViews[0];
  return `<div class="sim-live-views" data-live-view-picker><label for="live-view-picker">Live Slate view</label><select id="live-view-picker">${liveViews.map(view => `<option value="${view.id}"${view.id === selected.id ? ' selected' : ''}>${view.name}${view.inactive ? ' (inactive)' : ''}</option>`).join('')}</select><a href="${selected.url}" target="_blank" rel="noopener noreferrer" aria-label="Open selected live Slate view in a new tab">Open live view ↗</a></div>`;
}
