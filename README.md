# Physics Atlas Web

The official public deployment entry for [Physics Atlas](https://github.com/Tech-Echo-Collective/Physics-Atlas).

Opening the website enters the interactive Atlas directly. The default state is the global Physics-domain heatmap, with field and year controls available on the map. Project documentation is available through a secondary information control and does not replace the Atlas surface.

Public URL: <https://tech-echo-collective.github.io/Physics-Atlas-Web/>

## Source baseline

The `atlas/` submodule is pinned to Physics Atlas `v3.0.3-alpha` at commit `c3ce6c8bb4c3d9714db3b327eca5e503dab00334`.

This deployment repository contains only the public entry wrapper, GitHub Pages routing adapter, project-information control, and deployment workflow. Scientific models, data, the Metric Engine, and the main application remain in `Tech-Echo-Collective/Physics-Atlas`.

No v3.0.4 live-data infrastructure is included.

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

Physics Atlas is an exploration system, not a scientific ranking, prediction, or recommendation system.

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

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## GitHub Pages deployment

Pushes to `main` automatically run the GitHub Pages workflow. It:

1. checks out this repository and the pinned Physics Atlas submodule;
2. installs the locked dependencies;
3. builds with the `/Physics-Atlas-Web/` project base path;
4. creates the GitHub Pages single-page-app fallback;
5. publishes only `dist/`.

The workflow can also be run manually from the repository Actions page.

Deep Atlas URLs render through the Pages `404.html` fallback. GitHub Pages still returns an HTTP 404 status for the initial fallback response even though the application loads and restores the requested Atlas state.

## Documentation

- [About Physics Atlas](https://github.com/Tech-Echo-Collective/Physics-Atlas#physics-atlas)
- [Architecture](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/architecture.md)
- [Metric methodology](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/metric-model.md)
- [Metric Engine](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/metric-engine.md)
- [Entity resolution](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/entity-resolution.md)
- [Knowledge graph](https://github.com/Tech-Echo-Collective/Physics-Atlas/blob/main/docs/knowledge-graph.md)
- [Deployment roadmap](docs/roadmap.md)

## License

Apache License 2.0. Copyright © 2026 Tech Echo Collective.
