# Investigation 03 — System Anatomy

## Question

What does a spatial 3D presentation add to understanding or interaction compared
with a 2D screen presentation, while preserving an accessible semantic path?

## Success criterion

One deterministic synthetic system can be inspected in both modes. The view
switch is explicit; node identity, system state, selection, explanations, and
the accessible inspection path remain equivalent. The results must name the
validation conditions, performance and accessibility evidence, limitations, and
exactly one final decision.

## Bounded scope

System Anatomy uses a small request-processing system with eight stable nodes and
eight labeled relationships. It has three deterministic snapshots: Steady,
Degraded, and Recovering. Each node has a stable id, kind, description, screen
position, spatial position, status, and status explanation.

PR 1 establishes the 2D Screen baseline and this contract. PR 2 adds a direct
Three.js Spatial adapter and an explicit `2D Screen` / `3D Spatial` switch. PR 3
records a reproducible local validation and the decision.

## Presentation contract

The 2D Screen and 3D Spatial renderers consume the same snapshot and selection
state. Both must show the same node ids, relationship labels, state labels, and
selected node. Switching modes must not reset the selected node or snapshot.

The visual layer is an enhancement. The HTML node inspector is the semantic
source of truth: it lists every node as a keyboard-operable button and exposes
the selected node's id, kind, description, status, and explanation. Pointer or
touch targeting in 3D is optional convenience, never a requirement.

## Accessibility plan

- Keep the document language `en` and all public copy in American English.
- Use native fieldsets, radio inputs, buttons, visible labels, and focus styles.
- Keep node identity and explanations in HTML outside the 2D SVG or 3D canvas.
- Preserve keyboard selection with Enter and Space in the 2D view.
- Keep the semantic inspector available in both modes.
- Respect `prefers-reduced-motion`; no automatic camera movement is required.
- Run axe checks for each mode, keyboard selection checks, and responsive overflow
  checks at the named viewports.

## Performance plan

Use a small fixed scene and measure directional local behavior rather than claim
universal 3D performance. Record the build, browser, operating system, viewport,
device-pixel-ratio assumption, bundle change, mode-switch response, and whether
the browser reports console errors. Do not add WebXR, headset APIs, live data,
authentication, telemetry, or unbounded scene generation.

## Explicit non-goals

- No immersive VR, WebXR, headset, gyroscope, or device-specific input.
- No live system integrations, backend, authentication, analytics, or network
  data.
- No general scene or component library.
- No automatic mode selection based on device, viewport, or data.
- No claim that 3D is inherently more understandable or faster.
- No replacement of the HTML semantic path with visual targeting.

## Synthetic demonstration

The model is a request entering through a Gateway and Router, waiting in a Work
queue, taking one of two Worker paths, being written to a Result store, and
leaving through a Response output. Degraded marks the Gateway and queue for
attention and blocks Worker B. Recovering marks the queue, Worker B, and output
as recovering. The rules and labels are local, deterministic, and domain-neutral.

## Validation sequence

1. PR 1: verify deterministic model values, default 2D Screen rendering,
   keyboard selection, state snapshots, details parity, axe, typecheck, lint,
   build, and responsive behavior.
2. PR 2: verify explicit mode switching, state/selection preservation, 3D
   pointer enhancement, shared HTML inspection, reduced-motion behavior, axe,
   console cleanliness, typecheck, lint, and build.
3. PR 3: run both modes in a no-login local Chrome profile at named viewports,
   record bundle and directional interaction observations, capture visual
   evidence, state limitations, and choose one decision: Continue, Incorporate,
   Reformulate, or Archive.

The investigation is successful only if the 3D result is judged against the
same semantic contract as the 2D baseline. Visual novelty alone is not evidence
of added understanding.
