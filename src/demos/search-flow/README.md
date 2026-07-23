# Search Flow Explorer

Interactive SVG demonstration of a search and recommendation pipeline. The
pipeline is a **simulation** with synthetic educational resources—not a real
search engine.

## Phase status

| Phase | Status |
| --- | --- |
| A — Static diagram | Done |
| B — Data and states | Done |
| C — Interaction | Not started |
| D — Motion | Not started |

## Phase B objective

Separate data from presentation with deterministic snapshots and stage
navigation, still without motion:

`Query → Candidates → Filters → Ranking → Recommendations`

Example query:

> Introductory guide to accessible SVG, published after 2024, under 15 minutes.

## Data and snapshots

- [`data.ts`](./data.ts) — ~12 neutral synthetic educational resources
- [`model.ts`](./model.ts) — five explicit snapshots with stable ids, removal
  reasons, ranking order, and recommendation notes

Candidate identity is stable across stages. Removal reasons and ranking are
precomputed and inspectable.

## Navigation

- Previous / Next controls
- Visible “n of 5” indicator and stage name
- Correct disabled limits at the ends
- `aria-live` announcement of the current step
- Current stage emphasized in the SVG (stroke + label) and in the textual list

## Visual structure

Five labeled SVG stage groups remain. Content updates from the active snapshot.
Desktop uses a horizontal composition from **1024px** upward; below that, a
separate vertical composition is used (not a scaled-down horizontal layout).

## Accessibility decisions

- SVG uses `role="img"` with dynamic `<title>` and `<desc>`
- Meaning is not conveyed by color alone
- Visible HTML textual equivalent updates with the snapshot
- Controls live outside the SVG; nodes are not focusable yet

## Current limitations

- No per-item selection or details panel
- No animation or `prefers-reduced-motion` behavior
- No real retrieval algorithm or external API

Those belong to later phases.
