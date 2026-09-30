import { documentPage } from '../scripts/simulator.js';
export const data = { permalink: 'modules/preview/index.html' };
export default function () {
  return documentPage('Individual module preview', '<main id="module-preview-root"><table class="fixed one_column" role="presentation" style="width:100%"><tbody><tr><td><div class="part_rows_container"></div></td></tr></tbody></table></main>', 'module-preview', 'module-preview');
}
