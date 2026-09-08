# Creative Computing Lab — PR roadmap

This roadmap turns the lab's visual-computing direction into small, reviewable
pull requests. The numbers are provisional; each PR should keep one question,
one primary demonstration, and one success criterion.

## Current position

Search Flow Explorer and the visual foundation are complete. PR #6 established
the Candidate Field SVG baseline with deterministic synthetic data, explicit
initial/filtered/reordered states, product volumes, an accessible HTML
inspection path, and a first directional Chrome run.

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

### PR #8 — Comparison harness

**Suggested title:** `feat: add Candidate Field comparison harness`

Create a separate, intentional comparison view with renderer, volume, and state
presets. Show a concise explanation of what is being compared. Keep the main
demo readable and avoid turning the public page into a raw benchmark dashboard.

**Success criterion:** switching renderer or state does not change candidate
identity, selection, explanation text, or accessibility behavior.

The exact public-versus-internal presentation should be confirmed before this
PR becomes an implementation contract.

### PR #9 — Guarded stress profile

**Suggested title:** `feat: add guarded Candidate Field stress profile`

Add bounded stress presets such as 10,000, 25,000, 50,000, and 100,000 marks.
Measure initial render, filtered update, reordered update, pointer selection,
details response, long tasks, and bundle impact where the browser supports it.
Stop at the first configured guardrail and preserve the last trustworthy result.

**Success criterion:** the harness is safe to repeat on a normal development
machine, never accepts unbounded volume input, and reports unsupported or
interrupted measurements honestly.

The stress cap remains provisional until the first guarded runs are reviewed.

### PR #10 — Evidence and renderer decision

**Suggested title:** `docs: record Candidate Field renderer decision`

Repeat the workload in a named browser, operating system, viewport, build, and
device-pixel-ratio assumption. Record medians, useful outliers, screenshots,
responsive and accessibility checks, bundle change, and known limits.

Choose one outcome:

- keep SVG for the tested range;
- add Canvas selectively above a measured threshold;
- use a hybrid overview and inspection path;
- reformulate the workload; or
- archive the extension if its complexity does not create enough value.

**Success criterion:** the repository contains one evidence-backed decision and
states what is reusable versus specific to Candidate Field.

### PR #11 — Apply the decision, if necessary

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
