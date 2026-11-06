import { readFileSync } from 'node:fs';
import { escapeHtml } from '../scripts/simulator.js';

export const data = { permalink: 'drafts/application-progress/index.html' };
export default function () {
  const variants = ['submit-your-materials', 'application-under-review', 'decision-available'];
  const previews = variants.map((slug, index) => {
    const file = `00-0${index + 1}-application-progress-${slug}.html`;
    const html = readFileSync(`src/modules/main-view/${file}`, 'utf8').match(/<body>([\s\S]*?)<\/body>/)[1];
    return `<section style="margin-block:2rem"><h2 style="font:600 1rem system-ui;margin-bottom:1rem">Draft variant ${index + 1}: ${escapeHtml(slug.replaceAll('-', ' '))}</h2><div class="part col-span-all status-tracker application-progress-tracker">${html}</div></section>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Application progress tracker drafts</title><link rel="stylesheet" href="../../css/grad-admissions.css"></head><body><main style="max-width:1100px;margin:auto;padding:2rem 1rem"><h1>Application progress tracker</h1><p>Draft variants for review. Slate should display one variant per application.</p>${previews}</main></body></html>`;
}
