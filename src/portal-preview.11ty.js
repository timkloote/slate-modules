import { inventory, documentPage } from '../scripts/simulator.js';
export default class {
 data() { return { pagination: {data: 'simulatorViews',size:1,alias:'view'}, simulatorViews:inventory().views, permalink:({view})=>`views/${view.slug}/preview/index.html` }; }
 render({view}) {
  return documentPage(`${view.name} preview`, `<main id="main-content" data-view="${view.slug}"><table class="fixed one_column" role="presentation"><tbody><tr><td><div class="part_rows_container"></div></td></tr></tbody></table></main>`, 'simulator-preview', 'simulator-preview').replace('</head>', '<link rel="stylesheet" href="/css/grad-admissions.css"></head>');
 }
}
