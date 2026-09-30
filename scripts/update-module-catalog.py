"""Merge the current module workbook by stable part ID; never execute workbook notes."""
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as E


def update(source, target):
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    audit = json.loads(target.read_text())
    by_id = {r['partId']: r for r in audit['modules']}
    records = []
    with zipfile.ZipFile(source) as archive:
        strings = [''.join(t.itertext()) for t in E.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', ns)] if 'xl/sharedStrings.xml' in archive.namelist() else []
        for name in sorted(archive.namelist()):
            if not re.fullmatch(r'xl/worksheets/sheet\d+\.xml', name):
                continue
            headers = None
            for row in E.fromstring(archive.read(name)).findall('.//m:sheetData/m:row', ns):
                cells = {}
                for cell in row:
                    value, inline = cell.find('m:v', ns), cell.find('m:is', ns)
                    text = value.text if value is not None else ''.join(inline.itertext()) if inline is not None else ''
                    cells[re.sub(r'\d', '', cell.attrib['r'])] = strings[int(text)] if cell.get('t') == 's' else text
                if 'Module ID' in cells.values():
                    headers = {value: col for col, value in cells.items()}
                    continue
                if not headers:
                    continue
                get = lambda label: cells.get(headers.get(label), '')
                part_id = get('Module ID')
                if not part_id:
                    continue
                if part_id not in by_id:
                    raise ValueError(f'Unmapped module ID: {part_id}; add an explicit source mapping first')
                old = by_id[part_id]
                record = dict(old)
                record.setdefault('legacyName', old['name'])
                record.setdefault('sourceOrder', old['order'])
                record.setdefault('sourceView', old['view'])
                for label, field in [('Slate View', 'view'), ('View Status', 'viewStatus'), ('Module Name', 'name'), ('Module Status', 'status'), ('Module Type', 'type'), ('Original CSS Class Names', 'originalClasses'), ('New CSS Class Names', 'newClasses'), ('Dev Notes', 'notes')]:
                    if label in headers:
                        record[field] = get(label)
                record['order'] = int(get('Order'))
                record['sourceRow'] = int(row.attrib['r'])
                records.append(record)
    ids = [r['partId'] for r in records]
    if len(ids) != len(set(ids)) or set(ids) != set(by_id):
        raise ValueError('Workbook must map each existing module exactly once; no changes written')
    target.write_text(json.dumps({'source': source.name, 'modules': records}, indent=2) + '\n')
    print(f'Updated {len(records)} modules by ID from {source.name}')


if __name__ == '__main__':
    update(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else Path('src/simulator/audit.json'))
