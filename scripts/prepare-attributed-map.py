"""Partition existing attributed outputs for display; never recalculate metrics."""
import gzip,hashlib,json
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'public/data/arxiv-20260908';OUT=ROOT/'public/data/arxiv-map-20260908';OUT.mkdir(parents=True,exist_ok=True)
packed=json.loads(gzip.decompress((SOURCE/'atlas.json.gz').read_bytes()));source_receipt=json.loads((SOURCE/'coverage.json').read_text());names=json.loads((SOURCE/'canonical-names.json').read_text())
def restore(row):
 row=dict(row)
 if isinstance(row.get('provenance'),int):row['provenance']=packed['provenance'][row['provenance']]
 if isinstance(row.get('normalizationParameters'),int):row['normalizationParameters']=packed['normalizationParameters'][row['normalizationParameters']]
 return row
def save(name,data):
 raw=json.dumps(data,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode();zipped=gzip.compress(raw,compresslevel=6,mtime=0);(OUT/name).write_bytes(zipped)
 return {'path':name,'bytes':len(zipped),'decodedBytes':len(raw),'sha256':hashlib.sha256(zipped).hexdigest(),'decodedSha256':hashlib.sha256(raw).hexdigest()}
core=packed['dataset'];map_core={k:([restore(r) for r in v] if isinstance(v,list) else v) for k,v in core.items() if k not in ['papers','researchers','metricObservations']}
map_core.update(papers=[],researchers=[],metricObservations=[]);map_core['metadata']={**core['metadata'],'availableYears':list(range(2018,2027))}
for inst in map_core['institutions']:
 name=names.get(inst['id'])
 if name and name in inst['aliases']:
  inst['aliases']=sorted((set(inst['aliases'])|{inst['name']})-{name});inst['name']=inst['canonicalName']=name
manifest={'version':'arxiv-map-partitions-v1','sourceVersion':source_receipt['version'],'bootstrap':save('map.json.gz',map_core),'years':{}}
for year,ref in source_receipt['metricFiles'].items():
 compact=json.loads(gzip.decompress((SOURCE/ref['path']).read_bytes()));groups=defaultdict(list)
 for values in compact['rows']:
  row=restore({k:v for k,v in zip(compact['columns'],values) if v is not None});groups[row.get('fieldId','overview')].append(row)
 manifest['years'][year]={key:{**save(f'{year}-{key}.json.gz',rows),'records':len(rows)} for key,rows in sorted(groups.items())}
 assert sum(len(rows) for rows in groups.values())==ref['records']
 print(year,len(groups),sum(len(rows) for rows in groups.values()),flush=True)
manifest['totalMetricRecords']=sum(r['records'] for y in manifest['years'].values() for r in y.values());assert manifest['totalMetricRecords']==source_receipt['metrics']
(OUT/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
print('bootstrap',manifest['bootstrap']);print('2025 overview',manifest['years']['2025']['overview']);print('total stored bytes',sum(p.stat().st_size for p in OUT.iterdir()))
