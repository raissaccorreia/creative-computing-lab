# Creative Computing Lab

A public lab for small, executable experiments in creative computing. We use
SVG, motion, Canvas, 3D, and WebGPU to make interface ideas visible and
testable.

Experiments are learning artifacts. They are not production-ready application code.

## Purpose

We build focused demonstrations that:

- show one clear idea in a few minutes;
- record what worked, what did not, and what we measured;
- leave a small pattern that another project can reuse when it earns its place.

The repository's default build and review method is in
[`docs/implementation-standard.md`](docs/implementation-standard.md). It is
written for future experiments as well as websites, apps, and platform
features.

## Technologies under investigation

- SVG as interactive interface
- Motion that explains state change
- Canvas 2D for higher element volume
- 3D scenes (WebGL / related toolchains)
- WebGPU and compute-backed visualization

## First experiment

**Search Flow Explorer** — a small experiment about how a query becomes
explained recommendations, and how motion can clarify that change.

An SVG representation of:

`query → candidates → filters → ranking → recommendation`

Uses synthetic educational resources and deterministic snapshots with stage
navigation, keyboard selection, and an HTML details panel. Notes:
[`src/demos/search-flow/README.md`](src/demos/search-flow/README.md).

## Principles

- Accessibility (keyboard, contrast, reduced motion, textual equivalents)
- Performance (load, frame budget, bundle size)
- Progressive enhancement and clear fallbacks
- Reusable patterns extracted only when proven

## Current stack

- React 19 + TypeScript
- Vite
- Motion (Phase D comparison)
- ESLint
- Playwright + `@axe-core/playwright` for end-to-end and accessibility checks

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test:e2e
pnpm test:a11y
pnpm test:visual
pnpm build
pnpm preview
```

## Project structure

```text
.
├── AGENTS.md
├── README.md
├── LICENSE
├── playwright.config.ts
├── src/
│   ├── App.tsx
│   └── demos/search-flow/   # Search Flow Explorer (Phase E)
└── tests/
```

## Status

Phase E is complete for Search Flow Explorer. The repository now includes
canonical visual snapshots, responsive and console evidence, a Native/Motion
long-task profile, and the measured results in
[`docs/search-flow-results.md`](docs/search-flow-results.md). The final
decision is to incorporate the tested pattern selectively in small,
explainable SVG interfaces. Experiments remain learning artifacts, not
production-ready application code.
