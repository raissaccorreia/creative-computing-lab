# Creative Computing Lab — PR roadmap

This roadmap turns the lab's visual-computing direction into small, reviewable
pull requests. The numbers are provisional; each PR should keep one question,
one primary demonstration, and one success criterion.

## Current position

Search Flow Explorer and the visual foundation are complete. PR #6 established
the Candidate Field SVG baseline with deterministic synthetic data, explicit
initial/filtered/reordered states, product volumes, an accessible HTML
inspection path, and a first directional Chrome run. PR #7 added the equivalent
Canvas 2D layer without changing that contract.

The current question is not whether Canvas is fashionable or universally
faster. It is when a denser renderer becomes a useful trade-off while meaning,
identity, selection, and accessible inspection remain stable.

## Candidate Field — immediate sequence

### PR #7 — Canvas renderer

**Suggested title:** `feat: add Candidate Field Canvas renderer`

Add a renderer-neutral contract and a Canvas 2D adapter for the existing
Candidate Field model. Preserve the same ids, states, selection behavior,
metadata, and HTML details path as SVG. Keep the public default on SVG; expose
Canvas only as an experimental single-renderer path until the comparison
harness exists.

**Success criterion:** both renderers expose the same deterministic meaning and
interaction contract for the tested product volumes. This PR does not make a
performance claim.

### PR #8 — Comparison harness + guarded stress profile

**Suggested title:** `feat: add Candidate Field comparison and guarded stress harness`

Create a separate, intentional comparison view with renderer, volume, and state
presets. Keep the main demo readable while giving the investigation a serious
place to compare the same workload across SVG and Canvas 2D. Add the bounded
stress ladder of 10,000, 25,000, 50,000, and 100,000 candidates, renderer-specific
guard limits, a directional render-response measurement, and an external Chrome
runner that records inspection response and optional long-task evidence.

**Success criterion:** switching renderer or state does not change candidate
identity, selection, explanation text, or accessibility behavior; the same
repeatable runner can measure product and stress presets without accepting
unbounded input or mounting a workload beyond its declared renderer limit.

This PR is still an experiment, not a renderer decision. Its output is a safe,
repeatable evidence surface for the next gate.

### PR #9 — Evidence and renderer decision

**Suggested title:** `docs: record Candidate Field renderer decision`

Repeat the combined harness in a named browser, operating system, viewport,
build, and device-pixel-ratio assumption. Record medians, useful outliers,
screenshots, responsive and accessibility checks, bundle change, and known
limits. Separate renderer response from HTML inspection response and report
guarded or unsupported workloads as boundaries rather than as failures.

**Success criterion:** the repository contains one evidence-backed renderer
decision and states what is reusable versus specific to Candidate Field.

Choose one outcome:

- keep SVG for the tested range;
- add Canvas selectively above a measured threshold;
- use a hybrid overview and inspection path;
- reformulate the workload; or
- archive the extension if its complexity does not create enough value.

**Success criterion:** the repository contains one evidence-backed decision and
states what is reusable versus specific to Candidate Field.

### PR #10 — Apply the decision, if necessary

**Suggested title:** `refactor: apply Candidate Field renderer decision`

Open this PR only if PR #10 changes the recommended public renderer or requires
cleanup of experiment-only code. Preserve the accessible HTML path and keep the
comparison evidence reproducible.

## Later investigations

These are not commitments to adopt every technology. Each investigation should
have its own plan, implementation, results, and decision when the scope needs
more than one PR.

1. **Motion Comparer** — compare native CSS/Web Animations API with Motion for
   orchestration, interruption, reduced motion, and bundle cost. Add Motion
   only when a concrete limitation is demonstrated.
2. **System Anatomy** — build a small interactive 3D scene and test what 3D
   adds to understanding, interaction, and fallback behavior.
3. **Material Lab** — study parameterized materials and shaders with an
   accessible non-shader explanation or fallback.
4. **GPU Ranking Field** — compare CPU, WebGL, and WebGPU only if earlier
   evidence justifies the added scale and complexity.
5. **Spatial Computing Lab** — optional work after the 3D foundation is stable.
6. **Consolidation** — collect reusable renderer contracts, measurement
   patterns, accessibility techniques, and explicit failure boundaries.

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
