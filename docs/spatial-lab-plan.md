# Investigation 06 — Spatial Computing Lab

## Question

Can an immersive WebXR session be added to a small 3D inspection task as a
progressive enhancement, sharing one selection state with the keyboard,
pointer, and HTML paths, while every browser without WebXR keeps the complete
task and the added cost stays measurable?

## Success criterion

The same five-anchor selection task completes through the HTML list, the
pointer, and an XR controller when an `immersive-vr` session is available.
Selection lives in one state that survives entering and leaving the session.
Every unavailable, unsupported, or failed WebXR state leaves the full task
usable and is announced in HTML. The results name the browser, emulator or
device, build, and measurement method. They also state which paths were
verified only in an emulator.

This is a technical investigation. It does not claim that immersive
presentation improves understanding, and it does not include a participant or
comfort study.

## Starting point

System Anatomy and Material Lab provide the 3D foundation: a lazy-loaded
Three.js scene, an HTML inspector as the semantic source of truth, and a WebGL
fallback. Three.js 0.186 already includes `WebXRManager` through
`renderer.xr`, so the investigation needs no new dependency.

No physical XR device is available for this lab. Automated checks cover the
non-XR paths and the capability states. The immersive path is checked manually
in a WebXR emulator and recorded as emulator evidence, not device evidence.

## Synthetic demonstration

One abstract sculpture sits on a plinth. It has five labeled anchors with
stable ids: Ring, Spire, Cube, Arc, and Core. Each anchor has a short neutral
description and a fixed position in meters relative to the sculpture. The
sculpture and anchors are static. Selecting an anchor highlights it in the
scene and shows its name and description in the inspector.

## Capability states

The page derives one explicit WebXR state and shows it as text next to the
enter control:

| State | Meaning | Enter control |
| --- | --- | --- |
| `checking` | Support query in progress | Disabled |
| `no-api` | `navigator.xr` is missing | Disabled, with reason |
| `insecure` | The page is not a secure context | Disabled, with reason |
| `unsupported` | `isSessionSupported('immersive-vr')` is false | Disabled, with reason |
| `available` | A session can be requested | Enabled |
| `starting` | `requestSession` is pending | Disabled |
| `active` | A session is running | Becomes Exit |
| `failed` | The request was rejected or the session failed to start | Enabled, with reason |

A session that ends returns to `available`. A missing WebGL context keeps the
existing pattern: the HTML inspector and a CSS fallback stay available, and the
WebXR control explains that the 3D scene could not start.

## Staged scope

### Slice 1 — Non-XR baseline and capability status

Add the navigable Spatial Lab route, the static sculpture scene, the five
anchors, and an HTML anchor list built from native radio inputs, with an
inspector and reset. Pointer and touch selection use a raycast that writes to
the same selection state as the list. Detect the WebXR capability state and
display it, but keep the enter control disabled in this slice.

Keep the capability logic in a small pure module so it can be tested without
a browser.

**Success check:** list and pointer selection produce the same selected id and
inspector content. Reset restores the reference state. Each capability state
listed above, except `active`, renders its text when `navigator.xr` is stubbed
for it. The page passes axe and has no horizontal overflow at 390 px and
320 px.

### Slice 2 — Immersive VR session

Turn the native enter control into an Enter VR / Exit VR button. Request an
`immersive-vr` session with `local-floor` as an optional feature, falling back
to `local`. Hand it to `renderer.xr.setSession`. Place the sculpture about
1.2 m in front of the viewer at a comfortable height. The app moves nothing:
there is no locomotion, no artificial camera motion, and no flashing.

Each controller shows a simple target-ray line drawn locally. On `select`, it
raycasts against the anchors and writes to the shared selection state.
A small in-scene text label shows the selected anchor's name, because the
HTML inspector is not visible inside the headset. When the session ends, the
page shows the same selection, and focus returns to the enter button.

Do not use `XRControllerModelFactory`. It fetches controller models from a
public CDN at runtime, which this lab avoids. Do not use the `VRButton` helper.
It creates its own styled DOM element instead of using the lab's native
control and status text.

**Success check:** in a WebXR emulator, a selection made with the controller
appears in the HTML inspector after exit. A selection made in HTML before entry
appears highlighted inside the session. Rejecting the session request produces
the `failed` state with an explanation. The production build reports the size
of the Spatial Lab chunk, and a Three.js chunk that is still shared.

### Slice 3 — Evidence and decision

Record the environment and the results for each path, whether automated,
emulated, or not verified. Include the bundle change and the local first-render
time. List the limits below. Finish with one decision.

## Accessibility and fallback

- Use native radio inputs, buttons, visible labels, and focus styles; the HTML
  list is the complete way to do the task.
- Announce capability changes through a polite live region; never rely on the
  scene alone to report state.
- Do not use color as the only selection cue in the scene or in HTML.
- Treat the in-headset label as a visual convenience. It is not exposed to
  assistive technology, so the HTML inspector remains the semantic record.
- Respect `prefers-reduced-motion`; the scene is static in both modes.
- Keep text expandable and do not hard-code language, number, or date
  formats; format timings with `Intl.NumberFormat`.

## Validation

- Node test for the capability-state module, covering every transition in the
  table.
- Playwright: list/pointer selection parity, reset, capability states through
  `addInitScript` stubs of `navigator.xr` (missing, unsupported, rejected
  request), the WebGL fallback, axe, and the 390 px / 320 px viewports.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build`, with the Spatial Lab and
  Three.js chunk sizes recorded.
- Manual emulator check of the Slice 2 criteria, naming the browser and
  emulator versions. Automated tests cannot open an `active` session; a mock
  `XRSession` complete enough for Three.js is out of scope.

## Explicit non-goals

- No `immersive-ar`, hit testing, anchors, planes, DOM overlay, or hand
  tracking.
- No locomotion, teleporting, or scene physics.
- No new dependencies, WebXR polyfill, or runtime asset fetch.
- No claim about headset frame rate, comfort, or cross-device performance.
- No participant study or learning claim.
- No general XR framework or reusable scene library.

## Known limits

- No physical XR device is available, so emulator results stand in for device
  results. They show that the state and input wiring works, not that the
  experience is fast or comfortable.
- A local check of Playwright's headless Chromium 149.0.7827.55 found
  `navigator.xr` present but `immersive-vr` unsupported. Automated runs can
  reach `available` and `failed` only through stubs, so they cover the
  fallback paths and not a real session.
- The in-headset text label is not accessible to screen readers.

## Reuse boundary

Potentially reusable: the WebXR capability-state module and its status text,
the pattern of one selection state shared by HTML, pointer, and XR input, and
the decision to avoid runtime controller-model fetches. Keep the sculpture,
anchors, and scene layout specific to this demonstration.

## Decision

Pending. Slice 3 records one of: continue, incorporate, reformulate, or archive.
