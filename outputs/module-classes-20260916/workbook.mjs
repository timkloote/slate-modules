import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const dir = new URL('./', import.meta.url).pathname;
const source = '/Users/timkloote/Desktop/northeastern-design/slate-crm-overview/slate-module-inventory.xlsx';
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:3500,tableMaxRows:2,tableMaxCols:11})).ndjson);
const sheet = wb.worksheets.getItemAt(0);
await fs.writeFile(dir+'source-values.json', JSON.stringify(sheet.getUsedRange().values,null,2));
const preview = await wb.render({sheetName:sheet.name,range:'D1:K9',scale:1,format:'png'});
await fs.writeFile(dir+'before.png',new Uint8Array(await preview.arrayBuffer()));
if(process.argv.includes('--edit')) {
  const proposals = JSON.parse(await fs.readFile(dir+'proposals.json','utf8'));
  const before = sheet.getUsedRange().values;
  sheet.getRange('H2:H218').values = proposals.map(p=>[p.newClasses]);
  // Preserve the table's existing style; widen only the changed column.
  sheet.getRange('H1:H218').format.columnWidth = 46;
  wb.recalculate();
  const after = sheet.getUsedRange().values;
  for(let r=0;r<before.length;r++) for(let c=0;c<before[r].length;c++) {
    if(c===7 && r>0) continue;
    if(JSON.stringify(before[r][c])!==JSON.stringify(after[r][c])) throw Error(`Unexpected change ${r+1}:${c+1}`);
  }
  console.log((await wb.inspect({kind:'table',range:"'Main View'!G54:I61",include:'values,formulas',tableMaxRows:8,tableMaxCols:3,maxChars:2400})).ndjson);
  console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},summary:'final formula error scan'})).ndjson);
  for(const [name,range] of [['after','G1:I10'],['after-layout','G135:I140'],['after-js','G174:I183']]) {
    const image = await wb.render({sheetName:sheet.name,range,scale:1.5,format:'png'});
    await fs.writeFile(dir+name+'.png',new Uint8Array(await image.arrayBuffer()));
  }
  const out = await SpreadsheetFile.exportXlsx(wb);
  await out.save(dir+'slate-module-inventory-proposed-classes.xlsx');
  console.log('Exported 217 proposed class lists. Other cell values unchanged.');
}
