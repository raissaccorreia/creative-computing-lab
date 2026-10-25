# Creative Computing Lab — PR roadmap

This roadmap tracks completed investigations and the next bounded question for
the lab. Each new investigation should keep one primary demonstration, one
success criterion, and an honest record of evidence and limits.

## Current position

- Search Flow Explorer and the visual foundation are complete. Search Flow
  records the Native and Motion comparison and the decision to reuse its
  patterns selectively.
- Candidate Field's SVG baseline, Canvas adapter, comparison harness, and
  evidence are complete (PRs #6–#9). SVG remains the default for the tested
  product range. Canvas is a conditional option for a real dense workload.
- System Anatomy's 2D baseline, explicit 3D mode, and results are complete. Keep
  2D as the default and 3D as an exploratory presentation. The 3D mode has a
  higher local load and mount cost, so it remains an explicit choice for people
  who want to explore the scene. This solo lab will not run a human comprehension
  study or claim a learning benefit.
- The responsive lab shell was merged in PR #17.

Material Lab has completed all three planned slices. The composed scene, local
evidence, limitations, and final decision are recorded in
[`material-lab-plan.md`](material-lab-plan.md).

## Completed investigation decisions

### Material Lab

**Decision: Incorporate selectively.** Reuse the native parameter controls,
visible values, reset behavior, and HTML explanation/fallback pattern when a
graphics experiment needs them. Keep this specific torus-knot and sphere studio
scene as a demonstration rather than turning it into a general material editor
or renderer library. Three.js remains lazy-loaded; its production chunk is
still above Vite's 500 KB warning threshold. Local first-render timing is
evidence from one Mac/Chromium run, not a cross-device performance claim.

### Search Flow Explorer

**Decision: Incorporate.** Reuse its deterministic snapshots, stable identity,
accessible HTML inspection, and reduced-motion patterns selectively. Native
animation remains the low-cost starting point; Motion is useful when its
higher-level controls justify the dependency.

### Candidate Field

Keep SVG as the public default through the tested 50–5,000 candidate range.
Keep the HTML inspection path as the semantic contract for each renderer.
Canvas remains experimental and may be useful for a dense overview only when a
real workload needs that density. No follow-up implementation is currently
planned; reopen this decision only if a real workload or a specific maintenance
need warrants it.

### System Anatomy

**Decision: Incorporate.** Keep 2D Screen as the default and 3D Spatial as an
explicit exploratory mode. Local results show a substantially higher initial
load and mount cost for 3D in the tested conditions, so it is an opt-in way to
explore the scene. The investigation verified technical state and semantic-path
parity; it did not test human comprehension. This lab will not run a participant
study or claim learning outcomes.

## Later candidates

These are options, not commitments to adopt every technology:

1. **GPU Ranking Field** — compare CPU, WebGL, and WebGPU only if a measured
   workload justifies the added scale and complexity.
2. **Spatial Computing Lab** — consider only after a stable 3D foundation and a
   task with evidence of value.
3. **Consolidation** — collect reusable renderer contracts, measurement
   patterns, accessibility techniques, and explicit failure boundaries when
   another project needs them.

## Pull request description contract

Every implementation PR should answer these questions in English, as required
by the repository's public documentation standard:

```md
## Question

## Scope

## Out of scope

## Success criterion

## Validation

## Evidence and limits

## Decision / next step
```

Do not describe a local prototype, benchmark, or browser-specific result as a
production guarantee. Keep live data, private product rules, credentials, and
domain-specific integrations outside this public lab.
