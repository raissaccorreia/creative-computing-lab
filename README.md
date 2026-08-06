# Creative Computing Lab

This repository is a public lab for small experiments in visual computing and
interface design. Each experiment asks one clear question, produces something
people can run, and records what was learned.

It is used to develop practical patterns for websites, apps, and platform
features without turning every experiment into a product or a generic library.

## Start here

The investigation notes and reusable working method are in [`docs/`](docs/):

- [`docs/README.md`](docs/README.md) — map of the documentation;
- [`docs/search-flow-explorer-plan.md`](docs/search-flow-explorer-plan.md) — the
  first investigation, written as one article from Phase A through Phase E;
- [`docs/search-flow-results.md`](docs/search-flow-results.md) — test results,
  measurements, limits, and final decision;
- [`docs/implementation-standard.md`](docs/implementation-standard.md) — the
  default method for planning, building, and reviewing future work.

## Current experiment

**Search Flow Explorer** is a small SVG demo that shows how a query becomes
explained recommendations. It uses synthetic data, accessible HTML details,
responsive layouts, and a Native/Motion comparison.

The implementation lives in [`src/demos/search-flow/`](src/demos/search-flow/).

## Run it

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm test:a11y
pnpm test:visual
```

All public examples use neutral synthetic data. This repository is a learning
lab, not production-ready application code.
