# Investigation 01 — Search Flow Explorer

This article tells the story of the first lab investigation. It combines the
five small steps that were once tracked as Phases A–E.

The question was:

> Can a visual flow explain how a query becomes a few recommendations without
> hiding the data, the rules, or the accessibility path?

This is a learning demo, not a search engine. It uses neutral synthetic data.
There is no backend, live search, personalization, AI, or real user data.

## What we built

The Search Flow Explorer shows one query moving through five states:

```text
Query → Candidates → Filters → Ranking → Recommendations
```

The same state appears in three ways:

- a responsive SVG diagram;
- a text equivalent below the diagram;
- an HTML details panel for the selected resource.

Each resource has a stable id. The data and rules are fixed, so another person
can run the same flow and get the same result.

## Phase A — Make the idea visible

We started with a static SVG diagram. It showed the five stages and the basic
direction of the flow.

The goal was not to make a finished interface. The goal was to answer one
simple question: does the visual structure make the process easier to follow?

The first lesson was to keep the diagram small. A visual experiment is easier
to judge when it has one main idea and no unrelated decoration.

## Phase B — Add real states, without real search

Next, we separated the data from the SVG. We created a small list of synthetic
resources and five explicit snapshots.

Each snapshot defines:

- which resources are visible;
- which resources were removed and why;
- the fixed ranking order;
- the recommendations and their explanations;
- the text equivalent of the state.

Previous and Next controls move through the snapshots. The result is
deterministic: the same input always produces the same visual and textual
output.

This separation became important later. The animation and accessibility work
could change without changing the underlying rules.

## Phase C — Let people inspect the result

The diagram became interactive only in the active stage.

People can:

- select a resource with a pointer;
- focus it with the keyboard;
- activate it with Enter or Space;
- read its metadata and the reason for its current state;
- move forward and backward without losing a valid selection.

Resources outside the active stage stay visible for context, but they are not
duplicate keyboard controls. A removed resource remains visible in Filters so
the person can understand why it was removed.

The main lesson was that an SVG should not carry the whole meaning alone. The
HTML details panel and the textual equivalent make the same information easier
to inspect and provide a safer accessibility path.

The mobile layout is a separate vertical composition below 1024px. It is not a
shrunk desktop diagram. This fixed the early mobile overflow problem and made
the layout easier to test.

## Phase D — Use motion to explain change

We compared two ways to animate the same transitions:

- **Native:** the browser Web Animations API, with no Motion runtime;
- **Motion:** the Motion library, using the same state and motion rules.

Native is the default because it has the lower dependency and bundle cost.
Motion is available when a higher-level animation API makes a complex flow
clearer to build or maintain.

Both modes use the same:

- data and stable ids;
- final layout and visual hierarchy;
- selection and keyboard behavior;
- interruption behavior;
- reduced-motion result.

The motion vocabulary is intentionally small:

- move an item when it keeps its identity but changes position;
- use a short fade and scale when an item first appears;
- emphasize a new priority without bouncing or flashing;
- keep removed items and their reasons visible.

Motion is useful here only when it explains a state change. It is not a reason
to animate every element.

The lab shell also gained a small light/dark/system theme control. It changes
the presentation, not the experiment's data or rules.

## Phase E — Check the result

The final step was to make the result repeatable and reviewable.

We added:

- four reference screenshots for important states;
- tests for the full flow, keyboard selection, reduced motion, and switching
  Native/Motion;
- responsive checks at 390px, 820px, 1024px, and 1280px;
- a 200% CSS-zoom approximation;
- a console-error check;
- a separate Native/Motion long-task check;
- an axe accessibility check;
- a production bundle measurement.

The local run passed 25 E2E tests and three accessibility checks. No long task
was observed for either animation mode in the measured run. The current build
is under the experiment's bundle limits, although Motion is measurably more
expensive than the Native-only baseline.

The full evidence is in [`search-flow-results.md`](search-flow-results.md).

## What we learned

### Start with the smallest working version

The simplest renderer that proves the question is usually the best starting
point. SVG and HTML were enough for this investigation. Canvas, 3D, shaders,
and WebGPU should answer their own later questions instead of being added here
for status or decoration.

### Keep the state independent from the presentation

Stable data and explicit states make it possible to change the renderer,
animation system, or layout without changing the meaning of the feature.

This also makes testing easier: tests can check the state, not just the pixels.

### Use Native first, then justify a library

Motion is not bad or unnecessary. It has a real place when orchestration,
interruption, or reuse becomes difficult with browser APIs. The cost should be
measured before the library becomes a project-wide default.

### Treat accessibility as part of the feature

Keyboard access, visible focus, text equivalents, reduced motion, and responsive
layout are part of the design. They are not a final polish pass.

### Evidence makes visual decisions useful

Reference screenshots, behavior tests, bundle numbers, and clear limits turn a
visual opinion into knowledge another project can check.

## Reusable pattern

```text
clear question
→ data and explicit state
→ stable identity
→ responsive view
→ accessible HTML equivalent
→ progressive enhancement
→ measured validation
→ short decision
```

This pattern can guide a website, an app screen, or a platform feature. The
specific renderer, data source, navigation, and breakpoint still need to be
tested in the new context.

## What should not be copied blindly

Do not copy the educational dataset, ranking weights, fixed coordinates, five
stage names, or the 1024px breakpoint as universal rules. Do not choose SVG for
large datasets without a new volume and interaction test. Do not add Motion,
GSAP, a state library, or a component library without a concrete problem and a
recorded reason.

## Final decision

**Incorporate.** Reuse the pattern selectively for small, explainable
interfaces where stable identity and an accessible equivalent matter. Keep
Native as the low-cost starting point. Add a library only when its controls are
worth the extra cost.

The repository-wide version of this method is in
[`implementation-standard.md`](implementation-standard.md).
