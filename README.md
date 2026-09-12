# Atlas Physicus Web

## Archive status

Active development ended on **12 September 2026** by the owner's decision. The
interactive map and source remain available as a project archive. Data is frozen
at the **8 September 2026** capture; no further acquisition, expansion or metric
certification is planned.

The public map loads the retained data files directly from GitHub Pages. It does
not require Railway, a live API or a database. The former Railway backend is
being retired separately after its database backup is restored and verified.
The frozen source, methods, coverage receipts and missing-data disclosures remain
part of the archive; this is not a complete or representative census of physics.

## Preserved attributed arXiv explorer — September 8, 2026

The homepage uses the original full explorer with 51 native arXiv physics categories and freshly acquired INSPIRE records spanning 2018–2026. This supersedes the earlier nuclear-only activity preview. The frozen source pin is `f8c2c06800a18c6a544919ee697b529d19e1b353`.

61,846 INSPIRE records were retrieved; 46,524 dated papers have supported paper-time institution attribution, covering 4,569 institutions in 135 countries/regions. Every one of 459 category/year queries succeeded, and 5,423 institution authority records were recovered. 841,619 of 1,015,866 source author positions have supported attribution. Unknown shares remain unallocated. Exact ROR identity links unify institutions; ambiguous affiliations do not acquire guessed ownership.

Five observed metric dimensions have raw values and 0–100 normalization with retained cohort parameters. Category classification follows native arXiv cross-lists; the Physics overview averages available normalized category scores equally. Yearly metric files and the existing on-demand relationship transport keep the full institution/researcher/paper exploration. Public source toggles are hidden for this integrated dataset.

This is a bounded INSPIRE corpus: up to 250 most-recent source records per category/year, not a complete arXiv census or representative sample. 2026 is partial. Impact uses the present citation capture date for older publication cohorts. Momentum covers 2023–2025 and is affected by differing acquisition completeness. Missing values are not zero. The earlier joint five-metric certification experiment is not a prerequisite for this owner-authorized observed release.

Coverage, query receipts, attribution counts and methods are published at `/data/arxiv-20260908/coverage.html` and `.json`. Public immutable assets total approximately 60.6 MB. The pipeline and methodology are in the pinned source repository's `pipeline/arxiv-attributed/` directory; the retained source SQLite snapshot stays in the owner's evidence workspace. No provider secrets or API credentials are shipped to the browser.

Validation: TypeScript, lint, all 18 Web tests, real default-year schema validation, all 51 category activity observations, finite normalized values, exact source receipt checks, and the production build passed. Local browser checks confirmed the full colored map, native category selection, and yearly loading. These are historical validation results for that data release.

## Source baseline

The `atlas/` submodule preserves the final explorer, small-country geometry and
NTU institution/search fixes at `f8c2c06800a18c6a544919ee697b529d19e1b353`.
Existing release tags remain unchanged. This repository contains the public
entry wrapper, static research assets, GitHub Pages routing, project information
and deployment workflow. Models, acquisition methods and the main application
remain in `Tech-Echo-Collective/atlas-physicus`.

`src/App.tsx` injects the attributed static repository; map partitions are loaded
by year/category and entity relationships are deferred to a browser worker.
Historical API adapters remain in the source for reproducibility, but are not the
public data path. Missing static data produces an error rather than synthetic
observations.

## Exploration path

```text
Physics domain global heatmap
        ↓
Research field
        ↓
Year
        ↓
World
        ↓
Country
        ↓
Institution
        ↓
Researcher
```

Atlas Physicus is an exploration system, not a scientific ranking, prediction, or recommendation system.

## Local development

Requirements: Node.js 22.13 or newer and npm.

Clone with the pinned Atlas source:

```bash
git clone --recurse-submodules https://github.com/Tech-Echo-Collective/Physics-Atlas-Web.git
cd Physics-Atlas-Web
npm ci
npm run dev
```

For an existing clone:

```bash
git submodule update --init --recursive
```

The archive runs locally without an API URL or Railway credentials.

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## GitHub Pages deployment

Pushes to `main` automatically run the GitHub Pages workflow. It:

1. checks out this repository and the pinned Atlas source submodule;
2. installs the locked dependencies;
3. runs lint and deployment tests;
4. builds the static archive at the `https://atlas.techecho.org/` custom-domain root;
5. creates the GitHub Pages single-page-app fallback;
6. publishes only `dist/`.

The build has no `VITE_ATLAS_API_URL` requirement.

The build copies `public/CNAME` into `dist/CNAME` with the value
`atlas.techecho.org`. The repository's GitHub Pages custom-domain setting must
also be set to `atlas.techecho.org`; DNS should point that subdomain to the
organization's GitHub Pages host.

The workflow can also be run manually from the repository Actions page.

Deep Atlas URLs render through the Pages `404.html` fallback. GitHub Pages still returns an HTTP 404 status for the initial fallback response even though the application loads and restores the requested Atlas state.

## Documentation

- [About Atlas Physicus](https://github.com/Tech-Echo-Collective/atlas-physicus#atlas-physicus)
- [Architecture](https://github.com/Tech-Echo-Collective/atlas-physicus/blob/main/docs/architecture.md)
- [Metric methodology](https://github.com/Tech-Echo-Collective/atlas-physicus/blob/main/docs/metric-methodology-v1.md)
- [Metric Engine](https://github.com/Tech-Echo-Collective/atlas-physicus/blob/main/docs/metric-engine.md)
- [Entity resolution](https://github.com/Tech-Echo-Collective/atlas-physicus/blob/main/docs/entity-resolution.md)
- [Knowledge graph](https://github.com/Tech-Echo-Collective/atlas-physicus/blob/main/docs/knowledge-graph.md)
- [Deployment roadmap](docs/roadmap.md)

## License

Apache License 2.0. Copyright © 2026 Tech Echo Collective.
