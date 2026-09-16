import fs from 'node:fs';
import { parseHTML } from '../../node_modules/linkedom/esm/index.js';
import { inventory } from '../../scripts/simulator.js';
const dir = new URL('./', import.meta.url).pathname;
const rows = JSON.parse(fs.readFileSync(dir+'source-values.json'));
const range = (a,b) => Array.from({length:b-a+1},(_,i)=>a+i);
const main = {
  'module-styles':[1,2], 'chatbot':[3], 'portal-header':[4], 'hidden-fields':[5],
  'messaging-block':[...range(6,15),21,26,51,56,97,98],
  'content-block':[16,17,18,19,57,93,102,103,104,123,131],
  'notification':[20,22,38,46,47,78,81,82,90,91,92,94],
  'form-action':[23,24,25,27,28,32,43,44,50,63,66,72,73,74,79,85,128,129],
  'document-link':[29,30,31,...range(33,37),69,70],
  'event-registration':[39,40,41], 'resource-links':[42,71,75,80],
  'enrollment-actions':[45,48,49], 'student-comments':[52,88,99,100,101],
  'checklist':[53,86,87,95,96,105,106,107,108],
  'payment-block':[54,62,64,65,67,68], 'application-selector':[55],
  'photo-block':[58,59,60,61], 'status-summary':[76,77],
  'form-widget':[83,89], 'video-upload':[84], 'welcome-links':range(109,120),
  'materials-upload':[121,122], 'application-details':[124,125],
  'support-block':[126,127], 'debug-output':[130], 'module-layout':[132], 'module-scripts':[133],
};
const groups = {
  'main-view':main,
  'enrollment-module':{'module-styles':[1],'portal-header':[2],'enrollment-actions':[3],'module-layout':[4],'module-scripts':[5]},
  'fce-evaluation-status':{'application-selector':[1],'module-scripts':[2],'portal-navigation':[3],'notification':[4,23],'content-block':[5],'divider':[6,18],'status-summary':[7],'status-tracker':range(8,17),'spacer':[19],'faq':[20],'checklist':[21,24],'student-comments':[22]},
  'fce-updates-temp-message':{'notification':[1],'materials-upload':[2]},
  'information':{'module-styles':[1],'portal-header':[2],'resource-links':[3],'module-layout':[4],'module-scripts':[5]},
  'letters':{'module-styles':[1],'portal-header':[2],'document-link':[3],'module-layout':[4],'module-scripts':[5]},
  'options':{'module-styles':[1],'portal-header':[2],'form-widget':[3],'checklist':[4],'document-link':[5],'navigation-card':[...range(6,12),15],'module-layout':[13],'module-scripts':[14]},
  'transactions':{'portal-header':[1],'module-styles':[2],'form-action':[...range(3,15),18],'module-layout':[16],'module-scripts':[17]},
  'unsubmitted-applications':{'messaging-block':[1]},
  'admissions-file-review-hub':{'application-selector':[1],'portal-navigation':[2]},
  'materials-checklist':{'module-styles':[1],'portal-header':[2],'checklist':[3,4],'materials-upload':[5],'module-layout':[6],'module-scripts':[7]},
};
const proposals = [];
for(const view of inventory().views) for(const module of view.modules) {
  const row = rows[module.sourceRow-1];
  if(row[9]!==module.partId || row[3]!==module.name) throw Error('Workbook/audit mismatch: '+module.partId);
  const matches = Object.entries(groups[view.slug]).filter(([,orders])=>orders.includes(module.order));
  if(matches.length!==1) throw Error('Component mapping must be unique: '+module.name);
  const component = matches[0][0];
  const original = (row[6]||'').split(/\s+/);
  const layout = [...new Set(original.map(c=>({leftcolumn:'col-left',rightcolumn:'col-right',maincolumn:'full-width','col-left':'col-left','col-right':'col-right','full-width':'full-width',fullwidth:'full-width'})[c]).filter(Boolean))];
  if(layout.length>1) throw Error('Conflicting layout: '+module.name);
  if(!module.legacySource) throw Error('Missing legacy source: '+module.name);
  const document = parseHTML(module.legacyHtml).document;
  const scripts = [...document.querySelectorAll('script')].filter(s=>!s.getAttribute('type') || /^(module|(?:text|application)\/(?:java|ecma)script)$/i.test(s.getAttribute('type')));
  const handlers = [...document.querySelectorAll('*')].flatMap(el=>[...el.attributes].filter(a=>/^on\w+/i.test(a.name) || /^\s*javascript:/i.test(a.value)));
  const commentedJs = [...module.legacyHtml.matchAll(/<!--[\s\S]*?-->/g)].some(([comment])=>/<script\b|\son\w+\s*=|javascript:/i.test(comment));
  const hasJs = scripts.length>0 || handlers.length>0 || commentedJs;
  proposals.push({row:module.sourceRow,partId:module.partId,view:view.name,order:module.order,name:module.name,originalClasses:row[6]||'',newClasses:[...layout,...(hasJs?['has-js']:[]),component].join(' '),component,hasJs,scriptCount:scripts.length,handlerCount:handlers.length,legacySource:module.legacySource});
}
if(proposals.length!==217) throw Error('Unexpected module count');
fs.writeFileSync(dir+'proposals.json',JSON.stringify(proposals,null,2)+'\n');
console.log(JSON.stringify({modules:proposals.length,hasJs:proposals.filter(p=>p.hasJs).length,components:[...new Set(proposals.map(p=>p.component))].sort(),layoutChanges:proposals.filter(p=>(rows[p.row-1][7]||'')!==p.newClasses.split(' ').filter(c=>['col-left','col-right','full-width'].includes(c)).join(' ')).map(p=>[p.row,p.name,rows[p.row-1][7],p.newClasses])},null,2));
