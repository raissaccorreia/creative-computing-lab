# Creative Computing Lab — working standard

This is the default way to plan, build, and review experiments in this
repository. It also gives future projects a small, practical starting point.

The goal is simple: build one useful thing, make its behavior easy to see, and
leave behind knowledge that another project can reuse.

## The short version

```text
clear question
→ small success check
→ data and states
→ simplest working interface
→ accessible equivalent
→ progressive enhancement
→ tests and evidence
→ documented decision
```

Do not start with a library, a visual effect, or a large architecture. Start
with the behavior a person should understand.

## 1. Start with one question

Write down:

- what the experiment is trying to show;
- what a person should be able to do;
- one result that tells us whether it worked;
- what is deliberately out of scope.

If the question grows, split it into another experiment. This keeps a demo,
website, app, or platform feature understandable and testable.

## 2. Model the behavior before the screen

Keep data, state changes, and presentation separate:

- use small synthetic or neutral data when real data is not needed;
- give items stable ids;
- define the important states explicitly;
- make the same state available to visual and textual interfaces;
- keep calculations deterministic when the experiment is meant to be
  reproducible.

Stable identity is especially important for lists, recommendations, timelines,
filters, rankings, and transitions. An item should not look like a new item
only because its position changed.

## 3. Use the simplest renderer that proves the point

Choose technology because the current question needs it:

| Need | Start with |
| --- | --- |
| Document, form, list, or settings flow | Semantic HTML and CSS |
| A small explainable diagram | SVG plus HTML details |
| Many independent 2D marks | Canvas, after testing the SVG limit |
| A real 3D scene | WebGL or Three.js |
| A compute-heavy visual | WebGPU, with a usable fallback |

Canvas, 3D, shaders, WebGPU, state libraries, component libraries, and
animation libraries are available options. They are not automatic defaults.

## 4. Choose motion by cost and need

Start with no motion, then add a small motion vocabulary only when it explains
change:

- movement preserves the identity of an item;
- a short fade or scale shows an item entering;
- emphasis shows a new priority;
- a removal keeps the reason visible instead of making the item disappear;
- no loop, bounce, flash, or decoration without a clear meaning.

Use the browser's native animation APIs first for simple transitions. Add a
library such as Motion when the flow needs orchestration, interruption, or
reusable animation controls that are clearer with the library. Keep the native
version when it is already good enough.

Every animated feature must also define what reduced motion does. Information
must remain available immediately, even when spatial movement is disabled.

## 5. Keep accessibility and layout in the main design

For every website, app, or platform feature:

- use semantic controls before custom controls;
- support keyboard and visible focus where the platform allows it;
- do not make color the only way to understand a state;
- keep important content in an accessible text or native-control path;
- support text expansion and different date/number formats;
- test narrow, normal, and wide layouts;
- include loading, empty, error, and reduced-motion states when they exist.

An SVG, Canvas, or 3D view is a presentation layer. It must not be the only
place where the meaning lives.

## 6. Validate the behavior, not just the pixels

Use the smallest validation set that proves the question:

1. smoke test and type/lint checks;
2. behavior tests for the important state changes;
3. keyboard and accessibility checks;
4. responsive checks at the real target sizes;
5. reference screenshots for a few stable states;
6. a production build and a simple performance measurement;
7. a manual review of limitations and console output.

Reference screenshots are evidence, not marketing assets. Update them only when
the visual change is intentional and reviewed.

Performance numbers must name their environment, browser, viewport, build, and
measurement method. A passing local run is useful evidence, not a promise for
all devices.

## 7. Record the result in plain language

Every finished experiment should answer:

- What did we build?
- What did we observe?
- What did not work or was not measured?
- What can another project reuse?
- What must stay specific to this experiment?
- What is the next action?

Use one final decision:

- **Continue** — another small question is needed;
- **Incorporate** — reuse the pattern selectively;
- **Reformulate** — change the question or approach;
- **Archive** — stop because the result is not worth extending.

## Reusable build pattern

```text
data
→ explicit state
→ stable identity
→ responsive view
→ accessible equivalent
→ progressive enhancement
→ measured validation
→ short decision record
```

This pattern works for a simple website, a mobile screen, or a larger platform
feature. The exact renderer, data source, navigation, and deployment choices
must still be tested in their own context.

## Decision record template

```markdown
# [Experiment or feature] result

Question:
Success check:
Baseline:
Options compared:
Observed result:
Accessibility and responsive notes:
Performance and bundle notes:
Reusable parts:
Experiment-specific parts:
Limitations:

## Decision

**[Continue | Incorporate | Reformulate | Archive].** [Short reason.] 
```

Keep this file short. Put detailed implementation instructions next to the
experiment only when a future contributor needs them to reproduce the work.
