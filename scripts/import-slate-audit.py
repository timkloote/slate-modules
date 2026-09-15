"""Read the audit XLSX without changing it; preserve cells as audit data."""
import json, re, sys, zipfile
from pathlib import Path
from xml.etree import ElementTree as E

source = Path(sys.argv[1])
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as z:
    strings = [''.join(t.itertext()) for t in E.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', ns)] if 'xl/sharedStrings.xml' in z.namelist() else []
    rows = []
    for name in sorted(z.namelist()):
        if not re.fullmatch(r'xl/worksheets/sheet\d+\.xml', name):
            continue
        for row in E.fromstring(z.read(name)).findall('.//m:sheetData/m:row', ns):
            cells = {}
            for cell in row:
                value = cell.find('m:v', ns)
                inline = cell.find('m:is', ns)
                text = value.text if value is not None else ''.join(inline.itertext()) if inline is not None else ''
                cells[re.sub(r'\d', '', cell.attrib['r'])] = strings[int(text)] if cell.get('t') == 's' else text
            if not cells.get('C', '').isdigit() or not cells.get('D'):
                continue
            keys = dict(A='view', B='viewStatus', C='order', D='name', E='status', F='type', G='originalClasses', H='newClasses', I='js', J='partId', K='notes')
            item = {key: cells.get(col, '') for col, key in keys.items()}
            item['order'] = int(item['order'])
            item['sourceRow'] = int(row.attrib['r'])
            rows.append(item)
output = Path('src/simulator/audit.json')
output.write_text(json.dumps({'source': source.name, 'modules': rows}, indent=2) + '\n')
print(f'Imported {len(rows)} audit rows to {output}')
from collections import Counter
print('Views:', dict(Counter(r['view'] for r in rows)))
print('Types:', dict(Counter(r['type'] for r in rows)))
print('Missing IDs:', sum(not r['partId'] for r in rows))
