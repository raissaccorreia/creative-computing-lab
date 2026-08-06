# Search Flow Explorer — implementation note

This folder contains the code for the first lab investigation. The plain-
language story from Phase A through Phase E is in
[`docs/search-flow-phases-c-d-e.md`](../../../docs/search-flow-phases-c-d-e.md).
Measured results are in
[`docs/search-flow-results.md`](../../../docs/search-flow-results.md).

## Files

- [`data.ts`](./data.ts) — neutral synthetic resources;
- [`model.ts`](./model.ts) — explicit states, stable ids, removal reasons,
  ranking, and recommendation notes;
- [`SearchFlowExplorer.tsx`](./SearchFlowExplorer.tsx) — the React view,
  controls, selection model, and Native/Motion comparison;
- [`search-flow.css`](./search-flow.css) — responsive SVG and theme-aware
  presentation.

## Implementation rules

- Keep the data and state rules separate from the SVG presentation.
- Keep only the active stage interactive.
- Keep the HTML details panel and text equivalent in sync with the visual state.
- Preserve stable resource ids when layout or stage changes.
- Keep Native as the default animation baseline.
- Respect reduced motion and do not make color the only state indicator.

## Local checks

From the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test:e2e
pnpm test:a11y
pnpm test:visual
pnpm build
```

The data is intentionally synthetic. Do not turn this demo into a real search
integration or copy its fixed dataset and coordinates into another product
without testing the new context.
