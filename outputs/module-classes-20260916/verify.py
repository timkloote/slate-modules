import json, zipfile, xml.etree.ElementTree as E
from pathlib import Path
root=Path(__file__).resolve().parent
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
source=Path('/Users/timkloote/Desktop/northeastern-design/slate-crm-overview/slate-module-inventory.xlsx')
output=root/'slate-module-inventory-proposed-classes.xlsx'
def inspect(path):
    with zipfile.ZipFile(path) as z:
        strings=[''.join(s.itertext()) for s in E.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns)] if 'xl/sharedStrings.xml' in z.namelist() else []
        sheet=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
        cells={}
        for c in sheet.findall('.//m:sheetData/m:row/m:c',ns):
            v=c.find('m:v',ns)
            value=v.text if v is not None else ''.join(c.find('m:is',ns).itertext()) if c.find('m:is',ns) is not None else ''
            if c.get('t')=='s': value=strings[int(value)]
            if value or c.find('m:f',ns) is not None: cells[c.get('r')]=(value,c.findtext('m:f',None,ns))
        features={}
        for tag in ['pane','mergeCell','dataValidation','conditionalFormatting','autoFilter']:
            features[tag]=[E.tostring(x,encoding='unicode') for x in sheet.findall('.//m:'+tag,ns)]
        tables=[]
        for name in z.namelist():
            if name.startswith('xl/tables/') and name.endswith('.xml'):
                t=E.fromstring(z.read(name))
                tables.append((t.get('name'),t.get('ref'),[(c.get('id'),c.get('name')) for c in t.findall('m:tableColumns/m:tableColumn',ns)]))
        return cells,features,tables
a,af,at=inspect(source)
b,bf,bt=inspect(output)
proposals=json.loads((root/'proposals.json').read_text())
changed={'H'+str(p['row']) for p in proposals}
assert {k:v for k,v in a.items() if k not in changed}=={k:v for k,v in b.items() if k not in changed}
for p in proposals: assert b['H'+str(p['row'])]==(p['newClasses'],None)
assert at==bt,(at,bt)
assert af==bf,(af,bf)
audit=json.loads(Path('src/simulator/audit.json').read_text())
assert {m['partId']:m['newClasses'] for m in audit['modules']}=={p['partId']:p['newClasses'] for p in proposals}
css=Path('dist/css/modules.css').read_text()
for token in {c for p in proposals for c in p['newClasses'].split()}: assert '.part.'+token+' {' in css,token
print('Verified saved workbook: 217 exact proposals; all other cell values/formulas, table columns, panes, merges, validations and conditional formats preserved. Audit and compiled CSS match.')
