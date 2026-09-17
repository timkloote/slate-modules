import fs from 'node:fs';
const proposals=JSON.parse(fs.readFileSync(new URL('proposals.json',import.meta.url)));
const auditPath='src/simulator/audit.json';
const audit=JSON.parse(fs.readFileSync(auditPath));
const byId=new Map(proposals.map(p=>[p.partId,p]));
for(const module of audit.modules) {
  const proposal=byId.get(module.partId);
  if(!proposal) throw Error('Unmatched module '+module.partId);
  module.newClasses=proposal.newClasses;
}
fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');
const components=[...new Set(proposals.map(p=>p.component))].sort();
const classes=['full-width','col-left','col-right','has-js',...components];
const path='src/scss/modules.scss';
const marker='/* Proposed Slate module class hooks';
let scss=fs.readFileSync(path,'utf8');
if(scss.includes(marker)) scss=scss.slice(0,scss.indexOf(marker)).trimEnd()+'\n';
scss+='\n'+marker+'\n   Paste the complete New CSS Class Names value into Slate’s module Class Name\n   field. These selectors target the generated .part wrapper, not body.\n   has-js records JavaScript in legacy source, including commented scripts;\n   it does not enable scripts or imply sanitized content still contains them.\n   Layout and component rules are intentionally pending. Comments keep these\n   declaration-free hooks visible in the compiled modules.css export. */\n\n';
scss+=classes.map(c=>`.part.${c} {\n  /* Styling pending. */\n}`).join('\n\n')+'\n';
fs.writeFileSync(path,scss);
console.log(`Updated ${audit.modules.length} proposals and ${classes.length} stylesheet hooks.`);
