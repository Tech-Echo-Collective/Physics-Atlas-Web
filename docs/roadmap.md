# Atlas Physicus deployment roadmap

This page summarizes the public Atlas baseline. Detailed scientific and engineering documentation remains in the [main Atlas Physicus repository](https://github.com/Tech-Echo-Collective/atlas-physicus).

Atlas Physicus is the canonical product name within Tech Echo Physica. Its
primary repository is `atlas-physicus`; historical release records and deployed
backend compatibility identifiers remain unchanged. The auxiliary Pages
repository remains `Physics-Atlas-Web`; the three primary family repositories
are `atlas-physicus`, `illuminatio-physica`, and `theatrum-physicum`.

## Released foundations

### v3.0.1 — Metric Engine Foundation

Versioned metric definitions, calculator contracts, observation queries, and the composite-weighting framework.

### v3.0.2 — Real Data Pilot

A deliberately bounded INSPIRE-HEP metadata pilot for testing ingestion, normalization, provenance, entity resolution, and sample-relative engineering signals.

### v3.0.3 — Knowledge Graph Foundation

Canonical institution and researcher identities, temporal affiliations, typed external resources, entity-aware search, graph-backed profiles, and non-destructive update lineage.

### v3.0.4 — Live Scientific Data Infrastructure

PostgreSQL persistence, migrations, FastAPI access, incremental source connectors, identity-safe update processing, resource monitoring, and the frontend API repository boundary.

### v3.0.5 — Stabilization & Scientific Validation

Viewport-safe map controls, reviewable candidate definitions for the five base metrics, metric-specific normalization and fail-closed activation gates, reconstructable observation metadata, independent identity-review validation, and compact public methodology/status information.

This deployment wrapper pins validated source commit `21bfcdb885b6cac4dd91bf8a271de359eebed9bd`, including the Atlas Physicus / Tech Echo Physica naming alignment and the unchanged exact-five withholding boundary. The historical Physics Atlas `v3.0.5-alpha` tag remains unchanged at `b1974d29334d7c4d1d109601787b9c339ba2e653`. The GitHub Pages build uses the operated Railway API through `APIRepository` as its normal data path. Static fixtures and the bounded pilot remain internal reproducibility and fallback resources rather than normal public dataset choices.

Live scientific metadata is active, but all five base metric definitions remain experimental candidates and no reviewed metric observations are published. The current public map therefore remains neutral and explicitly distinguishes missing values from zero; activating unvalidated scores is outside this milestone.

## Scope boundary

The roadmap records direction rather than a promise of timing. Proposed scientific data and methods must retain explicit provenance, scope, uncertainty, and limitations.
