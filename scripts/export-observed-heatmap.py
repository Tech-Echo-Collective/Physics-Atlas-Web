"""Export observed activity from the owner's trusted acquisition checkpoints.

This preview counts INSPIRE source records, with existing fractional affiliation
shares. It does not run, certify, or substitute for Metric System v1. Run with
the pinned Atlas backend on PYTHONPATH; never load third-party pickle files.
"""

import gc
import gzip
import hashlib
import json
import pickle
import sys
from collections import defaultdict
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path

import pycountry

root, output = map(Path, sys.argv[1:3])
provenance = {
    'source': 'INSPIRE source records and retained paper-time affiliation shares',
    'sourceType': 'derived', 'version': 'observed-activity-preview-v1',
    'status': 'unverified', 'acquisitionScope': 'nuclear-physics-launch-v1',
}
countries = [dict(id='country-' + c.alpha_2.lower(), isoAlpha3=c.alpha_3,
                  isoNumeric=c.numeric, name=c.name, region='Global',
                  provenance=provenance) for c in pycountry.countries]
institutions, years, seen = {}, [], set()
for year in range(2018, 2024):
    path = root / f'source-{year}.pickle.gz'
    checksum = hashlib.file_digest(path.open('rb'), 'sha256').hexdigest()
    with gzip.open(path, 'rb') as stream:
        captured, attributions = pickle.load(stream)
    assert len(captured.occurrences) == len(attributions)
    country_values, institution_values = defaultdict(Fraction), defaultdict(Fraction)
    allocated = Fraction()
    for occurrence, attribution in zip(captured.occurrences, attributions, strict=True):
        key = occurrence.reference.source_record_id
        assert key not in seen, f'Duplicate source record: {key}'
        seen.add(key)
        assert occurrence.reference == attribution.paper_reference
        fractional = attribution.fractional
        if fractional is None:
            continue
        assert sum((s.weight for s in fractional.shares), Fraction()) == 1
        for affiliation in attribution.affiliations:
            identity = affiliation.institution
            if not identity or not identity.canonical_institution_id or not affiliation.country_code:
                continue
            institution_id = identity.canonical_institution_id
            location = next((x for x in affiliation.locations if x.longitude is not None and x.latitude is not None), None)
            candidate = dict(id=institution_id, name=affiliation.canonical_name or affiliation.raw_name or institution_id,
                             countryId='country-' + affiliation.country_code.lower(),
                             city=(location.city if location else None) or 'Location unspecified',
                             fieldIds=['nuclear'], provenance=provenance)
            if location:
                candidate['location'] = dict(longitude=location.longitude, latitude=location.latitude)
            institutions[institution_id] = candidate
        for share in fractional.shares:
            if share.status != 'allocated' or not share.institution_id or not share.country_id:
                continue
            country_values[share.country_id] += share.weight
            institution_values[share.institution_id] += share.weight
            allocated += share.weight
    assert all(key in institutions for key in institution_values)
    assert allocated == sum(country_values.values(), Fraction()) == sum(institution_values.values(), Fraction())
    total = len(captured.occurrences)
    assert 0 < allocated <= total
    summary = json.loads((root / f'source-{year}-summary.json').read_text())
    assert summary['papers'] == total
    assert abs(float(allocated) - summary['canonicalMass']) < 1e-7
    years.append(dict(year=year, sourceRecords=total, allocatedMass=float(allocated),
                      unknownMass=float(total - allocated), coverage=float(allocated / total),
                      countries={k:float(v) for k,v in sorted(country_values.items())},
                      institutions={k:float(v) for k,v in sorted(institution_values.items())},
                      inputSha256=checksum, sourceManifestDigest=captured.manifest_digest,
                      sourceSnapshotId=f'nuclear-physics-launch-v1:inspire:{year}'))
    print(json.dumps({k:v for k,v in years[-1].items() if k not in ('countries','institutions')}), flush=True)
    del captured, attributions, fractional, occurrence, attribution
    gc.collect()

policy = json.loads((Path(__file__).resolve().parents[1] / 'atlas/src/data/reference/geographic-views.json').read_text())
views = [{**v, 'provenance': provenance} for v in policy['views']]
used = {key for item in years for key in item['institutions']}
dataset = dict(version='observed-activity-preview-20260908-v1',
               generatedAt=datetime.now(timezone.utc).isoformat(),
               scope='Nuclear physics · INSPIRE · preprint years 2018–2023',
               status='preview', unit='fractional source-record equivalents',
               method='Each INSPIRE source record contributes one unit, split equally among its authors and their recorded affiliations. Only already resolved shares are mapped. Unresolved shares stay unassigned; records are not asserted to be deduplicated canonical publications. Colour uses a fixed logarithmic scale across all six years, separately for countries and institutions.',
               countries=countries, geographicViews=views,
               institutions=[institutions[k] for k in sorted(used)], years=years)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(dataset,ensure_ascii=False,separators=(',',':')))
print(json.dumps(dict(output=str(output), bytes=output.stat().st_size, sourceRecords=len(seen), institutions=len(used))), flush=True)
