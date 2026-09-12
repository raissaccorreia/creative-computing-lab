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
- [`docs/phase-0-visual-foundation.md`](docs/phase-0-visual-foundation.md) —
  visual system decisions and the future investigation sequence;
- [`docs/implementation-standard.md`](docs/implementation-standard.md) — the
  default method for planning, building, and reviewing future work.
- [`docs/lab-roadmap.md`](docs/lab-roadmap.md) — the high-level PR sequence and
  decision gates for the lab's visual-computing investigations.
- [`docs/candidate-field-plan.md`](docs/candidate-field-plan.md) — the plan for
  the Candidate Field investigation, comparing SVG and Canvas at increasing
  volumes.
- [`docs/candidate-field-results.md`](docs/candidate-field-results.md) — the
  first SVG baseline and initial external-Chrome measurements.
- [`docs/system-anatomy-plan.md`](docs/system-anatomy-plan.md) — the bounded
  plan for comparing a 2D Screen presentation with an explicit 3D Spatial mode.

## Current experiment

**Search Flow Explorer** is a small SVG demo that shows how a query becomes
explained recommendations. It uses synthetic data, accessible HTML details,
responsive layouts, and a Native/Motion comparison.

The implementation lives in [`src/demos/search-flow/`](src/demos/search-flow/).

The current investigation is **Candidate Field**, available at
`/?demo=candidate-field` with an experimental Canvas path at
`/?demo=candidate-field&renderer=canvas`, implemented in
[`src/demos/candidate-field/`](src/demos/candidate-field/).
The bounded SVG/Canvas comparison harness is available at
`/?demo=candidate-field-comparison`; its external Chrome profile is exposed as
`pnpm stress:candidate-field`.

The current **System Anatomy** investigation is available at
`/?demo=system-anatomy`. It contains an explicit 2D Screen / 3D Spatial switch,
shared deterministic state, and a keyboard-operable HTML node inspector. The
recorded conditions and limits are in
[`docs/system-anatomy-results.md`](docs/system-anatomy-results.md).

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
# Uses external Google Chrome with a temporary profile for the bounded comparison.
pnpm stress:candidate-field
# Uses external Google Chrome with a temporary no-login profile for System Anatomy evidence.
pnpm validate:system-anatomy
```

All public examples use neutral synthetic data. This repository is a learning
lab, not production-ready application code.
