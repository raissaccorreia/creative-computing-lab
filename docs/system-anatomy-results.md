# Investigation 03 — System Anatomy results

## Question and success check

The investigation asked what a spatial 3D presentation adds to understanding or
interaction compared with a 2D screen presentation while preserving an
accessible semantic path.

The same local synthetic system was inspected in both modes. The explicit mode
switch, eight stable node ids, Steady/Degraded/Recovering snapshots, selected
`gateway` node, `Attention` state, descriptions, and HTML inspector remained
equivalent. The result satisfies the implementation parity part of the check;
it does not establish a human comprehension gain.

## Named validation conditions

The bounded runner was `pnpm validate:system-anatomy`, with the local preview
already running at `http://127.0.0.1:4173/?demo=system-anatomy`.

- Browser: Google Chrome 152.0.0.0, temporary profile, no login, extensions
  disabled, headless with SwiftShader for reproducible local WebGL.
- Operating system: macOS Darwin 25.6.0.
- Runtime: Node v24.14.0; Vite production preview; device pixel ratio 1.
- Viewports: 1280×900 desktop and 390×844 mobile.
- Modes: `screen` and `spatial`.
- Data: eight fixed synthetic nodes and eight fixed relationships; no network
  or external data source.

## Evidence

| Mode | Viewport | Node ids | Selected/state parity | Mode response | Overflow | Long tasks |
| --- | --- | --- | --- | ---: | ---: | --- |
| 2D Screen | 1280×900 | 8/8 | `gateway` / `Attention` | 5.2 ms | 0 px | none observed |
| 3D Spatial | 1280×900 | 8/8 | `gateway` / `Attention` | 831.7 ms | 0 px | 211 ms, 120 ms |
| 2D Screen | 390×844 | 8/8 | `gateway` / `Attention` | 3.7 ms | 0 px | none observed |
| 3D Spatial | 390×844 | 8/8 | `gateway` / `Attention` | 848.1 ms | 0 px | 110 ms |

The mode response is measured from the radio activation until the selected
renderer is present. The spatial value includes the lazy Three.js chunk and
WebGL scene mount, so it is not a steady-state frame-rate measure. The runner
reported zero console errors, zero page errors, and no external requests in all
four runs. The local Playwright suite also passed 5 focused System Anatomy tests
and 9 axe checks.

Visual captures were reviewed for desktop and mobile in both modes. The 2D view
shows labeled relationships and status text in the diagram. The 3D view shows
the same relationship geometry as depth-separated blocks and supports bounded
pointer/touch rotation; node labels and explanations remain in the shared HTML
inspector so the canvas is not the only semantic path.

The production build reported a 98.49 kB gzip main JavaScript chunk and a
133.88 kB gzip lazy SpatialRenderer chunk. The earlier 2D baseline build was
97.75 kB gzip for its main JavaScript chunk; the main-route increase is therefore
approximately 0.74 kB gzip, while the spatial chunk is downloaded only after
the explicit switch. Vite also reports that the spatial chunk is over 500 kB
minified, which is a real cost even though it is lazy-loaded.

## Accessibility, responsive behavior, and limits

The HTML inspector remained keyboard-operable and carried the same stable ids,
status values, descriptions, and explanations in both modes. Axe reported no
violations. The 2D node marks passed keyboard selection in Chromium; the runner
intentionally selected through the HTML inspector because the external Chrome
accessibility tree did not consistently expose interactive SVG `<g>` roles.
This reinforces the fallback boundary rather than making SVG targeting a
requirement.

The 390px run had no horizontal overflow in either mode. Reduced motion is
respected because the spatial scene has no automatic animation; drag rotation
only occurs during an explicit pointer gesture. The fallback message remains
inside the spatial host if WebGL construction fails, and the inspector remains
available.

These are directional single-run observations, not a benchmark or a claim about
all devices. There was no user study, task-completion measure, screen-reader
session, mobile GPU matrix, memory profile, or immersive input. The eight-node
graph is intentionally small, so its depth does not demonstrate a benefit at
larger or more complex system scale. The WebGL test used SwiftShader in a local
Chrome profile, not a production hardware GPU.

## Decision

Reformulate: keep the explicit 3D Spatial mode as a bounded exploratory adapter
and preserve 2D Screen as the default, but do not claim that this implementation
improves understanding. The next investigation should test a concrete spatial
comprehension task with human-observable success measures before changing the
default or expanding the scene.
