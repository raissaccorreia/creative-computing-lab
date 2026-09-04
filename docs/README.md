# Documentation map

This folder is the knowledge base for the lab. The root README only gives the
short orientation; the decisions and reusable methods live here.

## Investigation 01 — Search Flow Explorer

- [`search-flow-explorer-plan.md`](search-flow-explorer-plan.md) — one plain-
  language article covering the investigation from the first static diagram
  through testing and the final reuse decision.
- [`search-flow-results.md`](search-flow-results.md) — the concrete evidence:
  screenshots, checks, measurements, limits, and the result of the experiment.

## Foundation

- [`phase-0-visual-foundation.md`](phase-0-visual-foundation.md) — the visual
  system, typography, validation gates, and sequence for future investigations.

## Repository method

- [`implementation-standard.md`](implementation-standard.md) — the shared
  method for future websites, apps, platform features, and visual experiments.
- [`lab-roadmap.md`](lab-roadmap.md) — the proposed PR sequence from the
  Candidate Field renderer decision through the later visual investigations.

## Investigation 02 — Candidate Field

- [`candidate-field-plan.md`](candidate-field-plan.md) — the investigation plan:
  compare SVG and Canvas at increasing volumes while preserving state,
  interaction, accessibility, and a reusable renderer decision.
- [`candidate-field-results.md`](candidate-field-results.md) — the first SVG
  baseline, Canvas layer, and initial external-Chrome measurements.

## How to add the next investigation

Create one document in this folder for the investigation as a whole. Keep its
sub-steps inside that document when they belong to the same question. Add a
separate results note only when measurements or evidence would make the main
article hard to read.

Every investigation should finish with:

- the question and success check;
- what was built and tested;
- what can be reused;
- what must stay specific;
- known limits;
- one final decision.
