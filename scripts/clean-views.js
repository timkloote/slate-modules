import { escapeHtml } from './simulator.js';

export function allCleanViewsButton(views, capturedParts) {
  const destinations = views.map(view => ({
    slug: view.slug,
    parts: capturedParts[view.slug] || view.modules.filter(module => module.status === 'Active').map(module => module.partId),
  }));
  return `<div class="sim-actions"><button type="button" data-all-clean-views="${escapeHtml(JSON.stringify(destinations))}">Open all clean views ↗</button><span data-clean-views-status role="status"></span></div>`;
}
