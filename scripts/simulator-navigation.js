import { escapeHtml } from './simulator.js';
import { liveViewPicker } from './live-views.js';

/** Compact, keyboard-accessible tools menu shared by simulator pages. */
export function simulatorNavigation(title = 'Slate simulator', viewId) {
  return `<header class="sim-bar sim-site-header"><a class="sim-brand" href="/views/">${escapeHtml(title)}</a><nav aria-label="Simulator tools"><details class="sim-tools-menu"><summary>Explore tools <span aria-hidden="true">⌄</span></summary><div class="sim-tools-panel"><div class="sim-tools-group"><h2>Workspace</h2><a href="/views/">Portal views <span>Inspect and preview each view</span></a><a href="/modules/">Module library <span>Browse individual components</span></a></div><div class="sim-tools-group"><h2>Design &amp; drafts</h2><a href="/drafts/application-progress/">Application progress <span>Interactive tracker mockup · Draft</span></a><a href="/drafts/application-progress-wireframe/">Application progress wireframe <span>Grayscale tracker review</span></a><a href="/references/">Design references</a><a href="/photography/">Photography</a><a href="/">Landing page</a></div><div class="sim-tools-live"><h2>Open a view</h2>${liveViewPicker(viewId)}</div></div></details></nav></header>`;
}
