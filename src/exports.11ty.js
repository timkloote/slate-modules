import { component } from '../scripts/components.js';

export default class {
  data() {
    return {
      // Slate CRM only takes whole-page modules — header and footer. Each
      // export is fully self-contained: component() inlines every nested
      // <!-- component: x.html --> (navigation, account-menu, icons, etc.)
      // so the markup can be pasted into Slate as-is, with nothing left to
      // divide into smaller pieces.
      modules: ['header', 'footer'],
      pagination: { data: 'modules', size: 1, alias: 'moduleName' },
      permalink: ({ moduleName }) => `slate/${moduleName}.html`,
      eleventyExcludeFromCollections: true,
    };
  }
  render({ moduleName }) {
    return component(`${moduleName}.html`);
  }
}
