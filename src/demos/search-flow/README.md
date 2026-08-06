# Search Flow Explorer

Interactive SVG demonstration of a search and recommendation pipeline. The
pipeline is a **simulation** with synthetic educational resources—not a real
search engine.

## Phase status

| Phase | Status |
| --- | --- |
| A — Static diagram | Done |
| B — Data and states | Done |
| C — Interaction | Done |
| D — Motion | Done |
| E — Evidence and reuse decision | Done |

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

## Phase C interaction

Resource representations in the active stage are selectable by pointer and
keyboard. Enter and Space activate a focused resource; selection is exposed with
`aria-pressed` and a visible non-color indicator. Previous and Next preserve a
selection only when its id remains selectable in the destination stage.

An HTML details panel shows metadata and a stage-specific explanation. Removed
resources remain inspectable in Filters, while a removed selection is cleared on
entry to Ranking. Ranking exposes the deterministic score components and
Recommendations expose the exact synthetic recommendation note.

Only the active stage's resource representation is interactive. Contextual
representations in other stages are not duplicate keyboard stops.

## Phase D motion comparison

The demo exposes one accessible `Animation implementation` control with two
options:

- **Native** (the default): browser Web Animations API, with no Motion runtime.
- **Motion**: the Motion library, using the same bounded transitions.

Both options share the same deterministic snapshots, stable resource ids,
responsive SVG layout, selection behavior, and reduced-motion fallback. The
explanatory copy makes the cost-benefit experiment explicit: Native minimizes
dependency and bundle cost, while Motion provides a higher-level animation
API. Switching options preserves the current stage and selected resource.

## Phase E evidence

Four canonical visual states are checked by Playwright under
`tests/visual.spec.ts-snapshots/`. The final evidence also covers the 390px,
820px, 1024px, and 1280px viewports, a 200% CSS-zoom approximation, console
errors, and separate Native/Motion long-task profiles. See
[`docs/search-flow-results.md`](../../../docs/search-flow-results.md) for the
environment, bundle measurements, limitations, and reuse decision.

## Accessibility decisions

- SVG uses a named group with dynamic `<title>` and `<desc>` while interactive
  resource descendants remain available to assistive technology
- Meaning is not conveyed by color alone
- Visible HTML textual equivalent updates with the snapshot
- Details and score explanations live outside the SVG
- The mobile and horizontal SVG compositions share the same selection model
- Publication dates use `Intl.DateTimeFormat` with a fixed UTC interpretation

## Current limitations

- The comparison measures implementation behavior qualitatively; it is not a
  production benchmark
- No real retrieval algorithm or external API
- Visual snapshots and performance evidence describe this local Chromium run;
  they do not certify every browser, device, screen reader, or dataset volume

Those belong to later phases.
