# Physics Atlas deployment roadmap

This page summarizes the public Atlas baseline. Detailed scientific and engineering documentation remains in the [main Physics Atlas repository](https://github.com/Tech-Echo-Collective/Physics-Atlas).

## Released foundations

### v3.0.1 — Metric Engine Foundation

Versioned metric definitions, calculator contracts, observation queries, and the composite-weighting framework.

### v3.0.2 — Real Data Pilot

A deliberately bounded INSPIRE-HEP metadata pilot for testing ingestion, normalization, provenance, entity resolution, and sample-relative engineering signals.

### v3.0.3 — Knowledge Graph Foundation

Canonical institution and researcher identities, temporal affiliations, typed external resources, entity-aware search, graph-backed profiles, and non-destructive update lineage.

### v3.0.4 — Live Scientific Data Infrastructure

PostgreSQL persistence, migrations, FastAPI access, incremental source connectors, identity-safe update processing, resource monitoring, and the frontend API repository boundary.

The public instance is pinned to `v3.0.4-alpha`. Its GitHub Pages build remains in static/pilot fallback mode because a public backend is not currently deployed. The API-backed mode is implemented and deployment-ready, but it is not presented as live until a separately operated API, database, and worker are configured.

## Scope boundary

The roadmap records direction rather than a promise of timing. Proposed scientific data and methods must retain explicit provenance, scope, uncertainty, and limitations.
