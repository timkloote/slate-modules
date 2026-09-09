import { component } from '../scripts/components.js';

export default class {
  data() {
    return {
      modules: ['header', 'navigation', 'account-menu', 'content', 'footer', 'styles', 'scripts'],
      pagination: { data: 'modules', size: 1, alias: 'moduleName' },
      permalink: ({ moduleName }) => `slate/${moduleName}.html`,
      eleventyExcludeFromCollections: true,
    };
  }
  render({ moduleName }) {
    return component(`${moduleName}.html`);
  }
}
