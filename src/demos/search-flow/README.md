# Search Flow Explorer

Interactive SVG demo of a search and recommendation flow. It uses synthetic
educational resources, so it is a simulation—not a real search engine.

## Phase status

| Phase | Status |
| --- | --- |
| A — Static diagram | Done |
| B — Data and states | Done |
| C — Interaction | Done |
| D — Motion | Done |
| E — Evidence and reuse decision | Done |

## How the demo works

The data and the screen are kept separate. The flow moves through five fixed
states:

`Query → Candidates → Filters → Ranking → Recommendations`

Example query:

> Introductory guide to accessible SVG, published after 2024, under 15 minutes.

## Data and states

- [`data.ts`](./data.ts) — about 12 neutral synthetic resources
- [`model.ts`](./model.ts) — five explicit states with stable ids, removal
  reasons, ranking order, and recommendation notes

Each candidate keeps the same id as it moves through the flow. Removal reasons
and ranking are fixed so the result can be tested again.

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

The demo has one accessible `Animation implementation` control:

- **Native** (the default): browser Web Animations API, with no Motion runtime.
- **Motion**: the Motion library, using the same bounded transitions.

Both options use the same states, stable ids, layout, selection behavior, and
reduced-motion fallback. Native keeps the demo smaller. Motion gives a
higher-level animation API. Switching options keeps the current stage and
selected resource.

## Phase E evidence

Four reference visual states are checked by Playwright under
`tests/visual.spec.ts-snapshots/`. The final evidence also covers the 390px,
820px, 1024px, and 1280px viewports, a 200% CSS-zoom approximation, console
errors, and separate Native/Motion long-task profiles. See
[`docs/search-flow-results.md`](../../../docs/search-flow-results.md) for the
environment, bundle measurements, limitations, and reuse decision.

## Accessibility decisions

- SVG has a dynamic `<title>` and `<desc>` while interactive resources remain
  available to assistive technology
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

Those are outside this demo's scope.
