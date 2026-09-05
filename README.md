# Atlas Physica Web

The official public deployment entry for [Atlas Physica](https://github.com/Tech-Echo-Collective/Physics-Atlas).

Atlas Physica is developed and maintained by Tech Echo Collective. Previously
named Physics Atlas, the product retains its existing repository names,
technical identifiers, deployment URLs and historical release records.

Opening the website enters the interactive Atlas directly. The default state is the global Physics-domain heatmap, with field and year controls available on the map. Project documentation is available through a secondary information control and does not replace the Atlas surface.

Public URL: <https://atlas.techecho.org/>

## Source baseline

The `atlas/` submodule is pinned to source commit `1601b7e7f8f3b55bbc09bcb17f79cdb7142b082c`, the validated post-release Atlas Physica naming and staging-storage refinement. The historical Physics Atlas `v3.0.5-alpha` tag remains at `b1974d29334d7c4d1d109601787b9c339ba2e653`; all existing release tags, including `v3.0.4-alpha`, remain unchanged.

This deployment repository contains only the public entry wrapper, GitHub Pages routing adapter, project-information control, and deployment workflow. Scientific models, data, the Metric Engine, and the main application remain in `Tech-Echo-Collective/Physics-Atlas`.

The pinned source preserves the v3.0.4 live-data architecture and adds the v3.0.5 stabilization and scientific-validation foundation: candidate metric contracts, fail-closed activation gates, reconstructable observation metadata, identity-review validation, compact public methodology/status information, and viewport-safe controls. GitHub Pages hosts the static frontend while the separately operated production service supplies live scientific metadata.

The public build is configured with `VITE_ATLAS_API_URL` and uses `APIRepository` on clean Atlas routes. Synthetic fixtures and the bounded INSPIRE pilot remain available internally for tests, reproducibility, and an explicit failure fallback, but they are not normal public selector choices. Repository and dataset-kind guards keep these modes isolated. The production API currently exposes no reviewed metric observations, so the public map remains explicitly neutral: missing data is not interpreted as zero and no unvalidated score is displayed.

The naming refinement changes public titles/navigation only. The source retains
the exact-five fail-closed metric gate; staging storage tooling is not bundled
into the browser or connected to the production worker. Local validation passes
type checking, lint, all 12 deployment/branding tests, and the production API
build with the existing Pages root/deep-route fallback.

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

Atlas Physica is an exploration system, not a scientific ranking, prediction, or recommendation system.

## Local development

Requirements: Node.js 22.13 or newer and npm.

Clone with the pinned Atlas source:

```bash
git clone --recurse-submodules https://github.com/Tech-Echo-Collective/Physics-Atlas-Web.git
cd Physics-Atlas-Web
npm install
npm run dev
```

For an existing clone:

```bash
git submodule update --init --recursive
```

Run the public live configuration locally with:

```bash
VITE_ATLAS_API_URL=https://physics-atlas-api-production.up.railway.app/api npm run dev
```

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
3. requires the repository Actions variable `VITE_ATLAS_API_URL` to contain an HTTPS endpoint;
4. runs lint and deployment tests;
5. builds with the configured API endpoint at the `https://atlas.techecho.org/` custom-domain root;
6. creates the GitHub Pages single-page-app fallback;
7. publishes only `dist/`.

The build copies `public/CNAME` into `dist/CNAME` with the value
`atlas.techecho.org`. The repository's GitHub Pages custom-domain setting must
also be set to `atlas.techecho.org`; DNS should point that subdomain to the
organization's GitHub Pages host.

The workflow can also be run manually from the repository Actions page.

Deep Atlas URLs render through the Pages `404.html` fallback. GitHub Pages still returns an HTTP 404 status for the initial fallback response even though the application loads and restores the requested Atlas state.

## Documentation

- [About Atlas Physica](https://github.com/Tech-Echo-Collective/Physics-Atlas#atlas-physica)
- [Architecture](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/architecture.md)
- [Metric methodology](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/metric-methodology-v1.md)
- [Metric Engine](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/metric-engine.md)
- [Entity resolution](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/entity-resolution.md)
- [Knowledge graph](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/knowledge-graph.md)
- [Deployment roadmap](docs/roadmap.md)

## License

Apache License 2.0. Copyright © 2026 Tech Echo Collective.
