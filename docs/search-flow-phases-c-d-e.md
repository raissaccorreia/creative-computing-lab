# Search Flow Explorer — Phases C, D, and E

## Purpose of this specification

This document is the implementation contract for completing the first Creative
Computing Lab experiment. Implement the phases in order and stop at every phase
gate. Do not combine the three phases into one unreviewable change.

The experiment has one purpose: explain how a synthetic query becomes
candidates, passes through hard filters, receives a deterministic ranking, and
ends as a small set of explained recommendations.

The experiment is not a search engine and must never imply that it uses live
retrieval, personalization, machine learning, or artificial intelligence.

## Read before changing code

Read these files completely before implementation:

1. `AGENTS.md`
2. `README.md`
3. `src/demos/search-flow/README.md`
4. `src/demos/search-flow/data.ts`
5. `src/demos/search-flow/model.ts`
6. `src/demos/search-flow/SearchFlowExplorer.tsx`
7. `src/demos/search-flow/search-flow.css`
8. `tests/home.spec.ts`
9. `tests/home.a11y.spec.ts`
10. `playwright.config.ts`

The Obsidian Vault contains planning and learning notes. The implementation
agent working from this repository must not edit the Vault. Repository code,
public documentation, tests, and recorded results belong in this repository.

## Current baseline

Phase B is complete. The current implementation already has:

- twelve neutral synthetic educational resources;
- five deterministic stage snapshots;
- stable resource ids;
- explicit filter-removal reasons;
- deterministic ranking scores and recommendation explanations;
- Previous and Next navigation;
- separate horizontal and vertical SVG compositions;
- a textual equivalent outside the SVG;
- end-to-end and automated accessibility tests for Phase B.

At the start of this work, `pnpm lint` and `pnpm typecheck` pass. Playwright may
require its matching local browser binary before tests can run:

```bash
pnpm exec playwright install chromium
```

Installing the browser is environment setup, not a new application dependency.

## Global constraints for all three phases

### Required

- Keep all visible copy and public documentation in American English.
- Keep the dataset synthetic, deterministic, and domain-neutral.
- Preserve stable resource ids across stages.
- Keep important explanations in HTML outside the SVG.
- Keep the vertical composition below `1024px` and the horizontal composition
  at `1024px` and above unless browser evidence proves a change is necessary.
- Preserve operation at 200% browser zoom and allow text expansion.
- Use native `Intl` APIs for human-readable dates.
- Use native platform and browser APIs before adding an abstraction.
- Test behavior that supports the experiment's thesis.
- Describe limitations honestly.

### Out of scope for Search Flow Explorer

- No backend, database, authentication, analytics, telemetry, or network API.
- No real documents, company data, client data, or private-project examples.
- No search engine, embeddings, personalization, AI, or randomized ranking.
- No autoplay, drag and drop, editor, or generic diagram builder.
- No package publication and no premature generic `StatefulSvgDiagram` API.
- No provider-specific deployment integration unless a deployment target is
  explicitly supplied in a later request.
- Do not redesign the lab home or turn it into a portfolio page.
- Do not silently change the dataset, score weights, filter rules, breakpoint,
  or experiment question.

### Progressive technology boundary

Canvas, WebGL, Three.js, React Three Fiber, shaders, and WebGPU are not rejected
technologies. They are intentionally reserved for subsequent experiments so
each renderer can answer a distinct question and be compared against a complete
SVG baseline:

1. Search Flow Explorer — SVG state, accessible inspection, and motion.
2. Candidate Field — Canvas 2D at higher element volume.
3. System Anatomy — Three.js first, then React Three Fiber when declarative
   React integration provides a concrete advantage.
4. Material Lab — documented shader and material experiments.
5. GPU Ranking Field — WebGPU render/compute comparison with a fallback.

Do not add those later-stage technologies to Search Flow Explorer. This is a
boundary around the current experiment, not a permanent prohibition in the lab.

The dependency policy is also progressive:

- Phase C uses the current React and SVG stack without new application
  dependencies.
- Phase D first establishes a native CSS/Web Animations API baseline, then
  implements the same bounded motion behavior with Motion for comparison.
- GSAP is considered only if the native and Motion implementations reveal a
  concrete timeline or orchestration limitation. Record the evidence and stop
  for approval before adding GSAP.
- A state library or component library is considered only after the current
  React state or local components produce a documented maintainability or
  accessibility limitation. Do not add one preemptively.

If any out-of-scope technology appears necessary, stop and write down the
observed limitation. Do not expand scope without approval.

## Execution protocol

For each phase:

1. Implement only that phase.
2. Add or update tests for its behavior.
3. Run the phase validation commands.
4. Fix failures caused by the phase.
5. Update phase status and limitations in repository documentation.
6. Stop and report changed files, validation results, and remaining limits.

Do not start the next phase while the current phase has a failing acceptance
criterion. Existing unrelated failures must be identified precisely and must
not be hidden.

---

# Phase C — Accessible resource inspection

## Question

Can a person inspect the resources and understand each decision without using
a mouse?

## Success criterion

A keyboard-only user can select every resource represented by the active stage,
read its metadata and stage-specific explanation, move forward and backward,
and always understand which resource is selected.

## C1. Selection state

Add one selection state to `SearchFlowExplorer`:

```ts
const [selectedId, setSelectedId] = useState<string | null>(null)
```

Define the selectable resource ids for each stage explicitly:

| Stage | Selectable resources |
| --- | --- |
| Query | None |
| Candidates | All twelve candidate ids |
| Filters | All twelve ids, including removed resources |
| Ranking | The kept ids in ranked order |
| Recommendations | The three highlighted recommendation ids |

Only the resource representation inside the **active stage** is interactive.
Upstream and downstream representations may remain visible for context, but
they must not create duplicate keyboard stops or duplicate accessible controls.

When the stage changes:

1. Keep `selectedId` if the same id is selectable in the destination stage.
2. Otherwise clear `selectedId` to `null`.
3. Entering Query always clears selection.
4. Do not automatically select the first item.
5. Going backward follows exactly the same rules.

Examples:

- A kept resource selected in Candidates remains selected in Filters.
- A removed resource selected in Filters is cleared when entering Ranking.
- A ranked resource outside the top three is cleared when entering
  Recommendations.
- A recommended resource remains selected when returning to Ranking.

Put the rule in one small pure helper and test the helper or its visible
behavior. Do not scatter stage-specific selection cleanup across event handlers.

## C2. Interactive SVG resources

Refactor `NodeMark` or introduce one small resource-mark component that can
render selected, removed, and interactive states. Do not create a general
diagram framework.

For a resource in the active stage:

- expose one accessible control with a specific name, for example
  `Select SVG Accessibility Starter Guide`;
- include it in the normal Tab order;
- activate it on pointer click;
- activate it with Enter;
- activate it with Space and prevent the page from scrolling for that keypress;
- expose selected state programmatically, using `aria-pressed` when the resource
  behaves as a toggle button;
- render a high-contrast visible focus indicator;
- render a selected indicator that is not color-only;
- use a pointer target large enough to select reliably even when the visible
  circle is small.

For resources outside the active stage:

- do not attach click or keyboard handlers;
- do not add `tabIndex`;
- do not expose them as duplicate interactive controls.

The SVG currently uses `role="img"`. An SVG that contains accessible interactive
descendants must not hide those controls behind image semantics. Update the root
semantics deliberately, preserve the accessible title and description, and
verify the result in Chromium rather than assuming the role combination works.
The hidden responsive SVG must not appear in the accessibility tree.

Do not implement custom arrow-key navigation or a roving-tabindex system in this
phase. Native Tab and Shift+Tab order plus Enter and Space activation are the
required keyboard model.

## C3. Details panel

Add an HTML details panel outside the SVG. It should appear below the diagram on
small screens and may sit beside it at `1024px` and above if there is enough
space without compressing the diagram.

When nothing is selected, show a concise instruction:

> Select a resource in the active stage to inspect its data and explanation.

When a resource is selected, show:

- title;
- topics;
- level;
- publication date formatted for English with `Intl.DateTimeFormat` and a fixed
  UTC interpretation so the calendar day cannot shift by timezone;
- duration in minutes;
- a clear stage label;
- the stage-specific explanation below.

Stage-specific explanation:

| Stage | Required explanation |
| --- | --- |
| Candidates | State that the resource is included in the broad initial synthetic pool before hard constraints. Do not invent a retrieval source. |
| Filters | State whether it was kept or removed. For removed items, use the exact `removedReasons` value. For kept items, state that it meets the topic, date, duration, and level constraints. |
| Ranking | Show one-based position, total deterministic score, the four component values, and the score weights. Explain that the score is simulated. |
| Recommendations | Show ranking position and the exact recommendation note. Say that it is one explained option, not an absolute answer. |

Move or export the score calculation only as much as necessary to avoid
duplicating the weights. There must be one source of truth for the formula:

```text
query match × 0.40
+ beginner fit × 0.25
+ recency × 0.20
+ data quality × 0.15
```

Display component scores consistently, for example as percentages, and display
the total with a documented fixed precision. Do not imply statistical accuracy.

The panel must have a stable heading. A concise polite live announcement may
identify a newly selected resource, but do not make the entire long details
panel a live region.

## C4. Visual and responsive behavior

- Focus and selection must be visually distinct from each other.
- Removed, selected, focused, and current-stage states must remain distinguishable
  when combined.
- Do not rely only on green versus gray.
- Preserve the existing hatch and strike treatment for removed resources.
- Prevent focus outlines and enlarged hit targets from being clipped by the SVG
  viewBox.
- Keep the page free of horizontal overflow at `390px`, `820px`, `1024px`, and
  `1280px` widths.
- At 200% zoom, controls and details must remain readable and operable.
- The mobile layout must not hide metadata available on desktop.

## C5. Required automated coverage

Extend Playwright coverage with tests that prove:

1. Query has no resource controls and shows the empty details instruction.
2. Candidates exposes twelve resource controls.
3. Tab can reach a resource and Enter selects it.
4. Space selects a different focused resource without scrolling the page.
5. The selected control exposes selected state.
6. The panel shows the exact selected title and metadata.
7. A kept selection survives Candidates → Filters → Ranking.
8. A removed selection survives Candidates → Filters and is cleared on Ranking.
9. A non-top-three ranked selection clears on Recommendations.
10. A recommended selection survives Recommendations → Ranking.
11. Filters show exact kept or removed reasoning.
12. Ranking shows position, components, weights, and total score.
13. Recommendations show the exact note and non-absolute language.
14. The interaction works in the vertical and horizontal compositions.
15. Axe reports no detectable violations in every interactive stage.
16. The tested mobile and tablet viewports have no horizontal overflow.

Prefer behavior and accessible-role locators. Do not make tests depend on SVG
coordinates, element order that is not meaningful, or implementation-only class
names when an accessible query is available.

## Phase C gate

Run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm test:a11y
```

Phase C is complete only when:

- all commands pass;
- the full experiment can be explored without a mouse;
- selection persistence matches the table and examples;
- selected details are equivalent on mobile and desktop;
- no motion has been added;
- no new application dependency has been added;
- `README.md` and `src/demos/search-flow/README.md` say Phase C is complete and
  Phase D is next.

Stop after this gate and report the result before starting Phase D.

---

# Phase D — Motion that explains change

## Question

Does motion make continuity and causality easier to understand, or does it only
make the interface more decorative?

## Success criterion

Stage changes communicate which resources persisted, moved, were removed, or
became recommended, while reduced-motion users receive the same information
immediately and without animated spatial movement.

## D1. Motion inventory

Use a small, explicit motion vocabulary:

| Change | Full-motion behavior | Purpose |
| --- | --- | --- |
| Resource persists and changes position | Translate from previous to new position | Preserve identity |
| Resource first enters the active representation | Short fade and subtle scale from `0.98` to `1` | Show arrival without spectacle |
| Resource is removed by a filter | Keep it visible; reveal or emphasize hatch, strike, and reason | Show causality instead of disappearance |
| Ranking order changes | Animate bars/resources from old position to new position | Connect score to order |
| Resource becomes recommended | Transition border/emphasis; do not bounce or pulse | Show hierarchy |
| Stage focus changes | Short border/label emphasis | Orient the viewer |

Do not animate decorative background elements, text reading order, every line,
or anything in a loop.

## D2. Native baseline and Motion comparison

Implement Phase D in two sequential steps. Do not begin the Motion version until
the native version is working, reduced-motion behavior is verified, and its
limitations are recorded.

### D2a. Native reference

Use CSS transitions and the Web Animations API for the native reference. For
movement between measured positions, use a small local FLIP-style
implementation:

1. Capture the previous bounding box by stable resource id.
2. Render the next deterministic snapshot.
3. Measure the new bounding box.
4. Animate the inverse delta to zero using `transform`.
5. Cancel and replace an existing animation when navigation is interrupted.
6. Remove temporary inline styles when an animation finishes or is cancelled.

Keep this logic local to Search Flow Explorer. Do not create a general animation
engine, hook package, or cross-project abstraction.

### D2b. Motion reference

After the native reference passes its behavioral tests, add Motion as the one
intentional Phase D application dependency and implement the same bounded
motion vocabulary with it. The native and Motion versions must use:

- the same deterministic snapshots;
- the same stable resource ids;
- the same selection and focus rules;
- the same durations and intended easing categories;
- the same reduced-motion information state;
- the same final geometry and visual hierarchy.

Before exposing the second implementation, stop and ask the repository owner to
choose how the comparison should appear. Present these bounded options:

1. a small accessible `Motion implementation` control in the main demo;
2. a separate comparison view in the same repository;
3. an internal test harness with one selected implementation in the public demo.

Do not choose the public interaction model implicitly. Regardless of the chosen
presentation, both approaches must remain executable and measurable. If the
chosen presentation allows live switching, preserve the selected stage and
resource when switching implementations.

Keep both implementations narrow and readable. Share the deterministic state
and geometry, but do not force animation-specific code into an abstraction that
makes either approach harder to inspect.

Record at least these comparison observations for Phase E:

- added production bundle cost;
- amount and clarity of implementation code;
- control over interruption and reversal;
- reduced-motion handling;
- focus and selection continuity;
- any behavior that was materially easier or harder in one approach.

### D2c. GSAP decision gate

GSAP is not an automatic third implementation. Consider it only if the first
two implementations expose a specific need for multi-step timeline sequencing
or orchestration that cannot be expressed clearly enough with the native API or
Motion.

If that condition occurs:

1. record the exact transition and limitation;
2. explain what evidence a GSAP comparison would produce;
3. stop and request approval before adding the dependency;
4. do not weaken the Phase D gate while waiting for that decision.

Suggested motion budget:

- movement: `240–320ms`;
- emphasis or fade: `140–200ms`;
- easing: one restrained ease-out curve for arrival and one ease-in-out curve
  for movement;
- no stagger longer than `80ms` across the whole group;
- no transition should block Previous, Next, selection, or keyboard input.

These are budgets, not an invitation to animate every eligible element. Use the
fewest animations that explain the transition.

## D3. Reduced motion

Respect the operating-system preference with
`prefers-reduced-motion: reduce`.

In reduced-motion mode:

- do not animate translation, scale, or opacity;
- update positions and styles immediately;
- keep removed resources, reasons, ordering, focus, and selected details fully
  available;
- do not replace spatial motion with flashing or another animated effect;
- cancel any running native or Motion animation if the preference changes while
  the page is open.

A separate user-facing motion toggle is not required in this phase. Do not add
one unless later usability evidence justifies it.

## D4. Interaction and interruption

- Previous and Next remain usable during motion.
- Rapid Next → Previous navigation must finish in the correct snapshot.
- Focus must not be lost when the focused resource remains selectable.
- Selection persistence rules from Phase C must not change.
- Details must update from application state, not from animation completion.
- Animations must never determine business state.
- No stale transform or opacity style may remain after interruption.
- Motion must work in both responsive SVG compositions.

## D5. Required automated and manual coverage

Add automated tests that prove:

1. Native full-motion mode starts a bounded transition for an eligible stage
   change.
2. Motion full-motion mode reaches the same final state.
3. Both implementations reach the same state without active animations when
   reduced motion is enabled.
4. The owner-approved comparison presentation exposes both implementations; if
   it supports live switching, switching preserves the current stage and valid
   selection.
5. Rapid forward and backward navigation ends at the correct stage in both
   implementations.
6. Selection and focus behavior from Phase C still pass.
7. Canonical screenshots are captured only after animations settle or with
   motion disabled.
8. Axe still reports no detectable violations.

Perform one browser profiling session and record the environment and result.
The stage transition must not introduce a JavaScript long task above `50ms` in
the observed profile. This is an experiment result, not a universal benchmark.

## Phase D gate

Run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm test:a11y
```

Then manually verify:

- native and Motion on desktop with full motion;
- native and Motion on mobile with full motion;
- native and Motion on desktop with reduced motion;
- native and Motion on mobile with reduced motion;
- the owner-approved comparison presentation, including state preservation if
  it supports live switching;
- rapid forward and backward navigation;
- keyboard selection before, during, and after a transition;
- browser console contains no errors or unhandled promise rejections.

Phase D is complete only when the native and Motion implementations reach the
same final information states, their full-motion and reduced-motion experiences
are equivalent, and the comparison has a documented result. Motion is the only
pre-authorized Phase D application dependency. GSAP still requires the decision
gate above.

Update repository documentation to say Phase D is complete and Phase E is next.
Stop after this gate and report the result before starting Phase E.

---

# Phase E — Validation, evidence, and reusable conclusion

## Question

Can another developer understand the result, verify it, and reuse the principle
without copying the entire demonstration?

## Success criterion

The repository contains reproducible validation, canonical visual evidence,
measured results with declared conditions, honest limitations, and a final
decision about the experiment.

## E1. Complete the test story

Preserve all Phase B, C, and D behavior tests. Organize tests only when it makes
them easier to understand; do not rewrite passing tests for style.

Required final coverage:

- page smoke and declared `lang="en"`;
- all five stages and navigation limits;
- deterministic candidate, filter, ranking, and recommendation content;
- selection by pointer and keyboard;
- selection persistence and clearing rules;
- stage-specific details;
- responsive composition and no horizontal overflow;
- full-motion interruption behavior;
- reduced-motion information equivalence;
- native/Motion comparison-presentation behavior and state preservation when
  live switching is part of the approved presentation;
- axe scan at each stage on desktop and at least one complete mobile state;
- canonical visual comparisons.

## E2. Canonical screenshots

Use Playwright visual comparisons in a stable local/CI environment. Keep the
set small and meaningful:

1. Candidates, desktop, one selected resource.
2. Filters, desktop, one selected removed resource and its reason.
3. Ranking, mobile, one selected kept resource and score details.
4. Recommendations, desktop, one selected recommendation.

Capture screenshots with reduced motion enabled and after fonts/layout settle.
Mask nothing unless it is genuinely nondeterministic. There should be no dynamic
dates, random data, remote images, or network content to mask.

Document how to update snapshots deliberately. A snapshot change must be
reviewed visually; never update snapshots merely to make CI green.

## E3. Performance and bundle baseline

Build the production bundle and record measured values in
`docs/search-flow-results.md`.

Record:

- date of measurement;
- operating system and architecture;
- browser and version;
- viewport;
- build command;
- total generated JavaScript, raw and gzip;
- total generated CSS, raw and gzip;
- observed stage-transition long tasks;
- whether horizontal overflow was found;
- any measurement limitation.

Measure the runtime behavior of the native and Motion implementations
separately through the owner-approved comparison presentation. Attribute the
Motion dependency's bundle cost
explicitly rather than reporting only the combined application total.

Initial budgets for this small experiment:

- total application JavaScript: at most `100 kB` gzip;
- total application CSS: at most `20 kB` gzip;
- no observed stage-change JavaScript long task above `50ms` in the declared
  profiling environment;
- no network request other than the local static application assets;
- no console error during the complete flow.

If a budget is exceeded, do not hide it or change the budget after measuring.
Identify the cause and either reduce the cost or record a justified negative
result and final decision.

Do not add a performance dependency solely to produce these numbers. Use the
production build output and browser developer tools.

## E4. Accessibility and responsive evidence

Record the final accessibility checks and their limitations:

- keyboard-only complete flow;
- visible focus;
- programmatic selected state;
- SVG title and description;
- details equivalent to visual state;
- removed state not conveyed by color alone;
- reduced-motion equivalence;
- axe automated result;
- 200% zoom observation;
- `390px`, `820px`, `1024px`, and `1280px` viewport observations.

Do not claim full accessibility compliance from axe alone. Automated checks are
only one part of the evidence.

## E5. Documentation deliverables

Update `README.md` so a new visitor can find, without reading the code:

- the problem;
- demonstrated principles;
- what the person can do in the demo;
- local setup, including Playwright browser setup;
- architecture and deterministic data flow;
- complete validation commands;
- observed performance and accessibility summary;
- exact reusable principle;
- limitations;
- final experiment decision.

Update `src/demos/search-flow/README.md` with:

- Phases A–E status;
- selection and keyboard model;
- motion vocabulary and reduced-motion behavior;
- data and score explanation;
- responsive behavior;
- validation summary;
- limitations.

Create `docs/search-flow-results.md` as a concise evidence record. Do not copy
this entire specification into the results file. Record what was actually
observed, including negative or inconclusive results.

## E6. Reuse without premature abstraction

Document this reusable pattern:

```text
structured data
→ deterministic stage snapshots
→ stable resource identity
→ responsive SVG representation
→ accessible HTML inspection
→ explanatory motion with a reduced-motion equivalent
```

State what can be reused:

- deterministic snapshot modeling;
- stable-id continuity across visual states;
- rules for selection persistence;
- active-stage-only interactive SVG semantics;
- HTML details as an accessible equivalent;
- the small motion vocabulary and interruption rules;
- the SVG-versus-HTML responsibility boundary.

State what must not be copied as a universal solution:

- fixed coordinates;
- the educational dataset;
- the ranking weights;
- the five search stages;
- the `1024px` breakpoint without testing the new content;
- SVG as the renderer for large datasets.

Extract a component or pure helper only if it already has at least two concrete
uses inside the completed experiment or makes a tested responsibility materially
clearer. Otherwise, document the pattern and leave the implementation local.

## E7. Final decision

End `docs/search-flow-results.md` with exactly one decision:

- **Continue** — the experiment needs another bounded question before its
  principle is reusable.
- **Incorporate** — the demonstrated pattern is ready to reuse selectively.
- **Reformulate** — the thesis or implementation approach needs a new question.
- **Archive** — the observed value does not justify further work.

Support the decision with evidence from comprehension, accessibility,
performance, implementation complexity, and limitations. Do not select
“Incorporate” merely because the implementation is complete.

## E8. Public-readiness review

Before declaring the experiment ready:

- inspect tracked and ignored files;
- inspect environment-variable usage;
- confirm no secrets, personal data, private paths, or private-project names;
- confirm all visible resources remain synthetic;
- confirm license and metadata are accurate;
- confirm links and commands work;
- confirm the production build contains no source-map or artifact that should
  remain private;
- confirm no provider-specific deployment claim is made without a real deploy.

The experiment may be declared **ready to publish** without creating a new
hosting integration. If no public URL exists, state that deployment remains a
separate operational step.

## Phase E gate

Run the complete validation from a clean checkout or an equivalent clean local
state:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm test:a11y
```

Phase E is complete only when:

- the complete command sequence passes;
- canonical screenshots have been reviewed;
- measured results and conditions are recorded;
- accessibility and responsive evidence is recorded honestly;
- READMEs describe the completed experiment accurately;
- reusable and non-reusable parts are explicit;
- one final decision is recorded;
- the public-readiness review finds no private or unlicensed material.

---

# Final acceptance matrix

| Capability | C | D | E |
| --- | ---: | ---: | ---: |
| Pointer and keyboard resource selection | Required | Preserve | Verify and document |
| Deterministic selection persistence | Required | Preserve | Verify and document |
| Stage-specific accessible details | Required | Preserve | Verify and document |
| Responsive vertical and horizontal SVG | Required | Preserve | Capture evidence |
| Explanatory motion | Not part of Phase C | Required | Verify and document |
| Reduced-motion equivalence | No motion yet | Required | Verify and document |
| Canonical screenshots | Optional during development | Stable capture support | Required |
| Performance measurement | No regression | Profile transition | Record baseline |
| Reusable conclusion | Not yet | Not yet | Required |
| Final continue/incorporate/reformulate/archive decision | Not yet | Not yet | Required |

## Final non-goals reminder

Completing this specification does not authorize implementation of the next
experiment, but it deliberately prepares that progression. After Search Flow
Explorer reaches a final Phase E decision, the intended sequence is Candidate
Field with Canvas 2D, System Anatomy with Three.js and possibly React Three
Fiber, Material Lab with shaders, and GPU Ranking Field with WebGPU.

Those technologies are future subjects of the lab, not forbidden choices. Each
new experiment still requires its own question, primary demonstration, success
criterion, performance and accessibility plan, and explicit authorization.
A generic component library and deployment-provider integration also remain
separate decisions driven by an observed need.
