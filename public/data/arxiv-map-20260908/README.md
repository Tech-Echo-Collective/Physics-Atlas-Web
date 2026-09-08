# Map display partitions

Derived from the immutable `../arxiv-20260908/` attributed INSPIRE/arXiv release.
Run `python3 scripts/prepare-attributed-map.py` from the Web checkout to reproduce
these assets. No observations, attribution rules or fitted parameters are
recalculated. The original corpus coverage limitations still apply.

`manifest.json` records compressed/decoded SHA-256 hashes and byte sizes. The
map bootstrap contains countries, institutions, categories and available years;
metric rows are partitioned by year and native category, with a separate
equal-field overview. All 1,263,445 observations are conserved. Paper/researcher
catalogs and relationships remain in the original release and load only when
requested through the background worker.

Default 2025 overview scientific data: 806,217 compressed bytes and 18,640,408
decoded bytes, previously 14,239,986 and 176,735,777 respectively. These are
dataset transport sizes, not page-load timing measurements or total JS/CSS size.
