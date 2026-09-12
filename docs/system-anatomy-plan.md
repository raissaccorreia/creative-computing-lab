# Investigation 03 — System Anatomy plan

## Question

What does a spatial 3D presentation add to understanding or interaction compared
with a 2D screen presentation, while preserving an accessible semantic path?

## Success criterion

One deterministic synthetic system can be inspected in both modes; the view
switch is explicit; identity, state, selection, explanations, and accessibility
remain equivalent. The results must name validation conditions, performance and
accessibility evidence, limitations, and exactly one final decision.

## Bounded scope

The experiment uses one five-node synthetic system: Intake accepts a request,
Parser normalizes structure, Index stores relationships, Coordinator combines
signals, and Output returns a result. The model has two deterministic snapshots:
Nominal and Degraded. Degraded marks Index and its downstream relationship as
needing attention without changing node identity or topology.

PR 1 establishes a screen-oriented 2D SVG overview and the shared model/state
contract. PR 2 adds a minimal 3D Spatial adapter and an explicit labelled
`2D Screen` / `3D Spatial` switch. PR 3 records bounded browser evidence and
one decision.

## Synthetic model

The model owns stable node ids, titles, roles, explanations, positions, edges,
labels, and state. Renderers receive a snapshot and a selected id; they do not
decide which nodes exist, how state is calculated, or what a node means.

The stable ids are `intake`, `parser`, `index`, `coordinator`, and `output`.
The relationship edges are deterministic and labelled. Selection is by stable
id, so changing state updates the explanation while preserving the selected
node when it remains present.

## 2D / 3D comparison contract

Both presentations must use the same:

- snapshot, node ids, titles, roles, statuses, edges, and explanations;
- selected id and state transition behavior;
- visible state summary and node inspection result;
- HTML search/list/details path for keyboard and assistive technology;
- responsive container and no-console-error expectation.

The switch must be a native, labelled control with no automatic renderer choice.
3D pointer or touch targeting is an enhancement only. A user must be able to
understand and operate the experiment without targeting 3D pixels.

## Accessibility plan

The visual overview has a named SVG with a title and description, but the SVG is
not the only semantic source. A labelled HTML search form and a finite list of
node buttons expose stable ids, state, role, selection, and explanation. Focus
indicators, non-color selection/status cues, native controls, visible summaries,
and `prefers-reduced-motion` behavior are required. Automated axe checks are a
signal, not a complete screen-reader certification; manual review remains a
limitation.

## Performance plan

Use the production build and a named local browser/viewport in PR 3. Record the
build asset sizes, directional interaction response observations, and whether
state changes create long tasks. Keep the scene intentionally small; a single
five-node result cannot support a general 3D performance claim. Compare 2D and
3D under the same state sequence and viewport conditions.

## Explicit non-goals

- WebXR, headset APIs, immersive input, or a claim of VR support;
- live data, authentication, external services, or production integrations;
- a general-purpose visualization/component library;
- automatic device-based renderer switching;
- replacing the HTML semantic path with canvas or 3D pixels;
- a universal claim that 3D is faster, clearer, or more accessible;
- expanding the synthetic system into a product domain or benchmark suite.

## Staged implementation sequence

1. **PR 1 — 2D baseline and contract:** model, screen view, state controls,
   HTML inspection/details path, focused behavior/a11y tests, and this plan.
2. **PR 2 — 3D spatial mode:** smallest appropriate dependency, shared model
   adapter, explicit switch, parity/fallback tests, and reduced-motion behavior.
3. **PR 3 — evidence and decision:** reproducible local browser validation,
   responsive/accessibility/performance observations, concise results, and one
   final decision. The aggregate staging-to-main PR remains for human review.
