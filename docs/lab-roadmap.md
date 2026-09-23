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
- System Anatomy's 2D baseline, explicit 3D mode, and results are complete. The
  recorded decision is to keep 2D as the default and reformulate the question
  before claiming that spatial presentation improves understanding.
- The responsive lab shell was merged in PR #17.

The next investigation is the System Anatomy follow-up documented in
[`system-anatomy-plan.md`](system-anatomy-plan.md). Its question, task, measures,
and decision rule are defined; implementation and evaluation have not started.

## Next

### System Anatomy — define a comprehension task

**Status:** question and comparison contract defined; implementation and
evaluation not started.

The defined task uses the Degraded snapshot: identify the blocked Worker B and
select the valid route from Request input to Response output through Worker A.
Exact ordered-route accuracy is the primary measure; blocked-node accuracy,
completion time, mode order, and inspector use are also recorded. The task and
comparison controls are specified in
[`system-anatomy-plan.md`](system-anatomy-plan.md#follow-up-question-trace-a-surviving-path-in-degraded).

Before evaluation, set the sample and minimum meaningful difference, and make
task-relevant labels and status cues equivalent across modes without exposing
the answer. Do not expand the scene or change the default mode unless the
comparison supports added value.

## Completed investigation decisions

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

**Decision: Reformulate.** Keep 2D Screen as the default and 3D Spatial as a
bounded exploratory mode. Existing parity and local performance evidence do
not establish a human comprehension benefit. The queued follow-up must measure
a concrete task before expanding the scene or changing defaults.

## Later candidates

These are options, not commitments to adopt every technology:

1. **Material Lab** — study parameterized materials or shaders with an
   accessible explanation or fallback.
2. **GPU Ranking Field** — compare CPU, WebGL, and WebGPU only if a measured
   workload justifies the added scale and complexity.
3. **Spatial Computing Lab** — consider only after a stable 3D foundation and a
   task with evidence of value.
4. **Consolidation** — collect reusable renderer contracts, measurement
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
