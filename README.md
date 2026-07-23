# Creative Computing Lab

A public lab for small, executable experiments in creative computing—SVG, motion, Canvas, 3D, and WebGPU—as tools for interface, narrative, and understanding, not decoration.

Experiments are learning artifacts. They are not production-ready application code.

## Purpose

Explore visual computing techniques through focused demonstrations that:

- make a principle visible in a few minutes;
- record performance, accessibility, and limitations honestly;
- leave behind a small reusable pattern when one earns its place.

## Technologies under investigation

- SVG as interactive interface
- Motion that explains state change
- Canvas 2D for higher element volume
- 3D scenes (WebGL / related toolchains)
- WebGPU and compute-backed visualization

## First experiment

**Search Flow Explorer** — Phase B (data and states) is implemented.

An SVG representation of:

`query → candidates → filters → ranking → recommendation`

Uses synthetic educational resources and deterministic snapshots with stage
navigation. Notes: [`src/demos/search-flow/README.md`](src/demos/search-flow/README.md).

## Principles

- Accessibility (keyboard, contrast, reduced motion, textual equivalents)
- Performance (load, frame budget, bundle size)
- Progressive enhancement and clear fallbacks
- Reusable patterns extracted only when proven

## Current stack

- React 19 + TypeScript
- Vite
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
│   └── demos/search-flow/   # Search Flow Explorer (Phase B)
└── tests/
```

## Status

Phase B of Search Flow Explorer is available: synthetic data, deterministic
snapshots, and Previous/Next stage navigation on an accessible SVG diagram.
Item selection and motion are not implemented yet. Experiments remain learning
artifacts, not production-ready application code.
