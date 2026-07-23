# Search Flow Explorer

Interactive SVG demonstration of a search and recommendation pipeline. Phase A
is a static diagram only.

## Phase A objective

Make the sequence understandable from composition alone, before data, controls,
states, or motion:

`Query → Candidates → Filters → Ranking → Recommendations`

Example query used in the demo:

> Introductory guide to accessible SVG, published after 2024, under 15 minutes.

## Visual structure

Five labeled SVG stage groups connected by directional connectors:

1. **Query** — text block and conceptual tokens entering the system
2. **Candidates** — six symbolic nodes in a wider field
3. **Filters** — gate shape; some nodes continue, others marked removed
4. **Ranking** — ordered bars with position indexes
5. **Recommendations** — three symbolic options, one with moderate emphasis

Desktop uses a horizontal composition. Mobile uses a separate vertical
composition (not a scaled-down horizontal layout).

## Accessibility decisions

- SVG uses `role="img"` with `<title>` and `<desc>`
- Meaning is not conveyed by color alone (labels, hatch, strike, size)
- A visible HTML textual equivalent describes the same five steps
- No focusable controls inside the SVG in this phase

## Current limitations

- No synthetic document collection or scores
- No stage navigation, selection, or keyboard exploration of nodes
- No animation or `prefers-reduced-motion` behavior yet

Those belong to later phases (data/states, interaction, then motion).
