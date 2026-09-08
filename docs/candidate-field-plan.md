# Investigation 02 — Candidate Field

Candidate Field is the next investigation after Search Flow Explorer. It tests
what changes when the same visual idea grows from a small, inspectable set of
items into a dense, changing field.

This is a plan, not an implementation or a claim that Canvas is always better
than SVG.

## Current decision status

The direction is approved: include a serious rendering stress test, preserve
keyboard and screen-reader access, and expose the work in layers. PR #6
established the SVG baseline, PR #7 added the Canvas equivalent, and PR #8
implemented the separate comparison view plus guarded stress runner. The
renderer decision remains provisional until repeated runs produce trustworthy
evidence.

## The question

At what volume does Canvas become a useful option for a dynamic collection, and
how do we keep the same meaning, selection behavior, and accessible path when
the renderer changes?

## Success check

The experiment succeeds when it produces a defensible renderer decision: keep
SVG for the tested range, introduce Canvas at a measured threshold, or use a
hybrid. The decision must include interaction parity, an accessible equivalent,
and measurements from a named browser, viewport, build, and workload.

## Why this is the right next phase

Search Flow Explorer already shows that a small set of items can be explained
with SVG and HTML. The next uncertainty is not another visual style. It is the
cost of keeping a rich interface responsive as the number of visible items
grows.

This makes Candidate Field useful for future client-facing work because many
valuable interfaces combine:

- a large collection of items;
- filtering, sorting, or reordering;
- direct selection and inspection;
- responsive layouts;
- keyboard and assistive-technology requirements;
- a need to explain why a result changed.

Examples include search results, catalogs, monitoring views, planning tools,
timelines, maps, and analytical surfaces. The lab will not copy any private
product rules. It will isolate the reusable engineering pattern behind these
interfaces.

## The primary demonstration

Build one **Candidate Field** with synthetic records. The field shows many
candidate marks, lets a person change the collection state, and opens the same
HTML details panel when an item is selected.

The field should demonstrate four deterministic states:

1. **Initial:** all generated candidates are visible.
2. **Filtered:** a known subset is hidden or marked as removed.
3. **Reordered:** the same stable ids move to new positions.
4. **Selected:** one candidate is selected and its metadata is shown outside
   the visual renderer.

The visual representation may be SVG or Canvas, but the data, state, selection
rules, and details content must remain the same.

## Recommended scope

The following choices keep the experiment focused and productive. They are
recommended defaults, not permanent repository rules; confirm or adjust them
before implementation if the first baseline exposes a better question.

| Area | Recommended choice | Why |
| --- | --- | --- |
| Data | Reuse the neutral candidate shape from Search Flow and scale it with deterministic records | Keeps the comparison about rendering, not a new domain model |
| Volumes | 50, 250, 1,000, and 5,000 marks | Shows small, medium, high, and stress ranges without pretending to cover every device |
| Renderers | SVG and Canvas 2D | They answer the current question without jumping to WebGL or WebGPU |
| Public surface | One recommended renderer in the public demo | Keeps the lesson clear and avoids turning the demo into a benchmark dashboard |
| Internal harness | Renderer and volume controls for comparison | Makes the trade-off easy to inspect without adding public complexity |
| Motion | No animation library; use immediate state changes or a short optional transition | Prevents animation cost from hiding renderer cost |
| Data source | Local synthetic data only | Makes runs deterministic, private-safe, and reproducible |
| Semantics | Shared HTML picker/details path for both renderers | Canvas does not become the only way to understand or operate the field |

The volume values are workload labels, not performance promises. The actual
threshold must come from the measurements.

## Stress-test strategy

A useful stress test should show where the renderers stop being comfortable,
not simply display a large number on a slider. Use three bounded profiles:

| Profile | Suggested volumes | Purpose |
| --- | --- | --- |
| Product range | 50, 250, 1,000, 5,000 | Compare the range a dense interface may reasonably need |
| Stress range | 10,000, 25,000, 50,000, 100,000 | Find the point where renderer cost, input delay, or memory becomes material |
| Guarded failure | Stop at the first failed guardrail | Record the limit without freezing the tab or turning the demo into a crash test |

The stress range is a proposal. If the first run is stable, the cap can be
raised in a later experiment; if it becomes unsafe, stop at the last completed
volume and record the reason. Never generate an unbounded number from free-form
user input.

Each stress run should:

- use a deterministic seed and the same records for SVG and Canvas;
- run one renderer at a time so the comparison does not double the workload;
- measure mount, filtered update, reordered update, and selection response;
- report median samples plus the worst useful outlier;
- record long tasks, missed animation frames when relevant, and bundle impact;
- record memory only when the browser exposes a trustworthy measurement;
- stop when the tab becomes unresponsive, a configured time budget is crossed,
  or a measurement cannot be trusted.

The harness should show the current profile and a clear “measurement stopped at
this volume” state. It should not promise a universal frame rate. Every result
must include the browser, operating system, viewport, build, and device-pixel-
ratio assumption.

### Why this creates a stronger project

Most small demos stop at a comfortable number of elements. A bounded stress
profile makes the renderer boundary visible and gives the project a more useful
lesson: a team can see not only how a UI looks, but when its chosen rendering
strategy stops being a good trade.

The stress profile is still an experiment, not a production benchmark. A
100,000-mark Canvas result does not mean that every product should render
100,000 interactive items. It tells us which parts of the experience can stay
visual, which parts need progressive disclosure, and where a hybrid approach
becomes sensible.

## How the comparison could be exposed

There are three reasonable ways to expose SVG and Canvas. They answer slightly
different communication goals.

### Option A — Toggle inside the main demo

**Pros**

- easiest for someone to discover;
- makes the same state change feel directly comparable;
- gives the demo a single entry point.

**Cons**

- adds research controls to the primary user experience;
- invites people to treat the page as a benchmark dashboard;
- makes the accessibility and responsive surface more complex;
- can let renderer-specific controls distract from the field itself.

### Option B — Separate comparison view in the same repository

**Pros**

- keeps the main Candidate Field focused and easier to explain;
- makes the comparison explicit without hiding it;
- gives the harness room for volume presets, measurements, and notes;
- preserves one shared model and renderer contract.

**Cons**

- creates a second view that must stay in sync;
- needs clear navigation so people understand why it exists;
- can still become too technical if raw measurements are exposed without
  explanation.

### Option C — Internal harness only

**Pros**

- keeps all diagnostic controls out of the public demo;
- reduces visual and accessibility surface area;
- makes it easier to try guarded failure volumes.

**Cons**

- hides the most educational part of the investigation;
- makes review dependent on local setup or a developer handoff;
- weakens the project's public value as a reusable reference.

### Recommended exposure

Use a layered approach:

1. **Main demo:** one recommended renderer and one clear Candidate Field
   experience.
2. **Separate comparison view:** an intentional, readable SVG/Canvas
   comparison with volume presets, shared state, and a short explanation of
   the observed trade-off.
3. **Internal stress harness:** guarded high-volume runs, raw timings, and
   failure diagnostics that do not need to be part of the public narrative.

This keeps the public lesson understandable while still making the research
visible. This layered approach is the working contract for the investigation;
the measurements will decide which renderer is recommended.

## Architecture contract

The renderer must be replaceable without changing the meaning of the feature.
Keep these responsibilities separate:

### Shared model

- stable candidate ids;
- deterministic position, size, score, and status data;
- explicit field states for initial, filtered, reordered, and selected views;
- selection eligibility and filter rules;
- the metadata and explanation used by the details panel.

### Renderer contract

Both renderers receive the same state and must expose the same visual facts:

- visible candidates have the same ids and statuses;
- selected candidates have the same id;
- filtered candidates remain understandable through status or explanation;
- reordering preserves identity instead of making items appear to be new;
- the renderer does not own business rules or duplicate the data model.

### Accessible companion

The HTML layer is part of the feature, not a test-only fallback. It should
provide:

- a native control or compact candidate index for keyboard selection;
- the selected candidate's name, metadata, and explanation;
- a live summary of the current volume and state;
- a clear reduced-complexity path when the field is too dense to inspect mark
  by mark.

Pointer hit testing may select a mark in either renderer. Keyboard users must
not have to target Canvas pixels, and the Canvas itself must not be the only
source of meaning.

For the product range, a compact HTML candidate index may be enough. For the
stress range, do not create one tabbable DOM control per mark. Use a searchable
semantic picker keyed by stable id or title, plus the selected item's details
and a live volume/state summary. This keeps keyboard navigation usable without
turning accessibility into a second high-volume rendering problem.

## Implementation sequence

### 1. Freeze the workload

Record the question, proposed volumes, target viewports, mark shape, and the
state transitions to measure. Do not add 3D, shaders, live data, or a second
visual story at this point.

### 2. Build the shared model

Create deterministic records and explicit state snapshots. Use stable ids and
the same seeded positions for every renderer. Add a small state-level test
before writing renderer-specific code.

### 3. Establish the SVG baseline

Render the field with SVG first. Verify the interaction and accessible
companion at the smallest volume before scaling up. This baseline tells us what
is easy to inspect and what becomes expensive as the mark count grows.

### 4. Add the Canvas equivalent

Render the same records and states with Canvas 2D. Keep drawing, resize, device
pixel ratio, and hit testing in the renderer adapter. Do not move filtering,
selection eligibility, or explanation text into Canvas code.

### 5. Add the comparison harness

The implemented comparison view switches renderer, volume, and state while
showing the same contract. It exposes a bounded directional measurement and a
short explanation of what is being compared. The public demo keeps one clear
recommended path; the comparison view is for learning and review.

### 6. Add the guarded stress profile

The implemented runner runs the bounded product and stress ladders. It uses
presets only, returns a guarded result before mounting an unsafe workload, and
records the last trustworthy result. The profile is safe to repeat on a normal
development machine.

### 7. Measure and review

Run the same workload several times in the same built app. Record the median
and useful outliers for:

- initial render at each volume;
- filtered and reordered updates;
- pointer selection and details-panel update;
- long tasks during the interaction;
- bundle change attributable to the new renderer;
- memory only when the browser exposes a trustworthy measurement.

Use `performance.now()` and the browser performance APIs where possible. Do
not turn one local run into a universal frame-rate promise. Every result must
name the browser, operating system, viewport, build, device-pixel-ratio
assumption, and workload.

### 8. Write the decision

The results note should state one of these outcomes:

- **Keep SVG:** the tested range stays understandable and responsive enough;
- **Add Canvas selectively:** Canvas is justified above a measured threshold;
- **Use a hybrid:** Canvas handles dense overview while HTML or SVG handles
  inspection and focus;
- **Reformulate:** the workload or interaction contract was not realistic;
- **Archive:** the added complexity did not create enough value.

## Validation gates

The phase is not ready to publish until all of the following are true:

- both renderers show the same deterministic state for the same input;
- selection, filtering, reordering, and details content remain in sync;
- keyboard users can select candidates without targeting Canvas pixels;
- focus, status, and selection do not rely on color alone;
- the HTML companion remains usable at every tested volume;
- there is no horizontal overflow at 390px, 820px, and 1280px;
- loading, empty, and unsupported-measurement states are honest and readable;
- reduced motion leaves the information immediately available;
- axe, behavior, console, and responsive checks pass;
- canonical screenshots cover at least one low-volume and one high-volume
  state per renderer or harness mode;
- the production build and bundle change are recorded;
- the stress cap and first failed guardrail, if any, are recorded;
- the final decision names what can be reused and what stays specific.

## What this teaches future UI work

Candidate Field is valuable even if SVG wins. It creates a repeatable way to:

1. start with the simplest renderer that preserves semantics;
2. identify the real source of slowness instead of guessing;
3. keep state and identity stable while the visual layer changes;
4. add a denser renderer without throwing away keyboard and screen-reader
   access;
5. use a hybrid presentation when overview and inspection have different needs;
6. explain a technology decision with evidence rather than fashion.

That is the practical foundation for complex, dynamic, high-value interfaces:
the user sees a coherent interaction, the implementation can scale where the
evidence supports it, and the team can still describe the trade-offs clearly.
It does not mean every future website should use Canvas. It means the renderer
can be chosen deliberately instead of becoming an accidental constraint.

## Out of scope

- WebGL, Three.js, React Three Fiber, shaders, and WebGPU;
- live APIs, personalization, authentication, or production data;
- a general chart, visualization, or component library;
- drag-and-drop, infinite scrolling, or a second interaction model;
- a claim that one renderer is universally faster;
- a public benchmark page full of controls and raw timings;
- animation-library comparisons from Search Flow Phase D.

## Expected reusable output

If the phase succeeds, keep the reusable pieces small:

- a deterministic high-volume data generator;
- a renderer-neutral state contract;
- an SVG adapter and a Canvas 2D adapter;
- a semantic picker/details pattern for dense visual fields;
- a bounded stress-test harness with an honest stop condition;
- a small measurement harness and reporting format;
- a decision rule for when to keep, switch, or combine renderers.

Keep the candidate domain, exact mark styling, volume labels, and visual
composition specific to this experiment unless another project independently
validates them.

## Before the renderer decision

Repeat the profile in the same built app and record the browser, operating
system, viewport, build, device-pixel-ratio assumption, workload, and useful
outliers. Do not turn this first run into a universal performance promise. The
next implementation PR should only apply a renderer change if the evidence
supports it.
