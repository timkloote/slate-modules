import { inventory } from '../scripts/simulator.js';
export default class {
  data() { return { permalink: 'simulator/data.json', eleventyExcludeFromCollections: true }; }
  render() { return JSON.stringify(inventory()); }
}
