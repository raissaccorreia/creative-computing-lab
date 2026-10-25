# Investigation 04 — Material Lab

## Question

How do material parameters and a small custom shader change the appearance of a
surface, and how can the lab explain those changes while building toward a
visually rich, polished web demonstration?

## Success criterion

The same scene shows a clear change when material or shader parameters change.
Controls expose their values and have concise explanations. The demonstration
works with keyboard and touch, adapts to narrow and wide viewports, and keeps an
HTML explanation when WebGL is unavailable. Later visual complexity must
strengthen the composition without obscuring the materials under study or
making the interface unusable. Local performance evidence names its browser,
device, viewport, and measurement method.

This is a technical and visual investigation. It does not claim to improve
learning and does not require participant research.

## Staged scope

### Slice 1 — Explore a parameterized material

PR1 adds the navigable Material Lab route, one fixed Three.js PBR specimen,
native color/roughness/metalness controls, current values, a reset action, and an
HTML fallback when WebGL cannot start. The object and studio environment stay
fixed while controls update the same `MeshStandardMaterial` instance.

Start with one reference object, a stable camera, and controlled lighting. Add
native HTML controls for base color, roughness, and metalness, with current
values visible as text. Changing a control updates the corresponding
`MeshStandardMaterial` property; reset restores a documented reference state.

Explain in plain language that roughness changes how concentrated reflections
look and metalness changes the lighting response used for metallic surfaces.
Keep descriptions, values, and reset available in HTML beside the WebGL view.

**Success check:** each control changes its intended property, values stay
synchronized with the rendered state, reset restores the reference, and the
controls work without pointer-only interaction.

### Slice 2 — Add one custom procedural shader

PR2 adds a static soft-wave pattern with `ShaderMaterial` on the existing
specimen. A two-option mode switch selects the PBR material or the shader on the
same geometry, camera, and renderer. The shader reads UVs and a view-space
normal, and exposes base color and a pattern-scale uniform. Pattern scale is
bounded from 2 to 14 and starts at 6. It changes how often the bands repeat.

The color control applies in both modes. Roughness and metalness stay visible
with their values, then become disabled in shader mode; pattern scale is
disabled in PBR mode. Switching modes preserves all values. Reset restores the
reference material and shader scale. When WebGL is unavailable, the HTML
fallback shows a CSS band pattern in shader mode and describes its color and
scale.

Do not turn this slice into a general shader editor. Keep the shader source
small enough to explain and keep an HTML fallback that names the effect and its
parameters when WebGL cannot render it.

**Success check:** the parameter produces a deterministic visible change,
updates without losing the baseline material controls, and has an equivalent
text description.

**Out of scope:** a second WebGL canvas, animation, a shader editor, and a
composed multi-object scene.

**Local result:** `pnpm lint`, `pnpm typecheck`, `pnpm build`, and four focused
Playwright Chromium checks pass. They cover mode switching, retained values,
the WebGL fallback, accessibility, and a narrow viewport. The shader is static
and produced no browser console errors in the passing WebGL run. The repository
has no staging deployment workflow, so validation used the local production
preview.

The production build keeps Three.js in its own lazy-loaded chunk at 539.96 KB
minified and 133.69 KB gzipped. Vite warns that this chunk exceeds 500 KB. The
CSS fallback describes and approximates the bands, but does not reproduce the
shader's curved shading. Frame-time and cross-device performance were not
measured.

### Slice 3 — Compose a richer visual demonstration

PR3 composes both render types in one studio scene. It shows the same torus knot
with the PBR material and the wave shader for a direct comparison, plus a
smaller PBR sphere to show the reflections on a smooth form. A shared base color
feeds all specimens. Roughness and metalness affect the two PBR forms; pattern
scale affects the shader form. A short HTML legend identifies each role and
its controls.

The visual thesis is a quiet editorial studio still life, with reflective
surfaces and a graphic wave pattern as the main contrast. The first viewport
contains the title, composed specimen scene, a compact key, and the parameter
inspector. The reset control closes the interaction. Parameter changes update
the same static scene without continuous animation.

Use one renderer, the existing environment, a placed key and rim light, and a
camera framed for the wide and narrow layouts. Keep the current controlled
background. When WebGL is unavailable, show separate CSS material and band
samples with the same labels and values. Keep keyboard focus, descriptions,
reset, reduced-motion behavior, and responsive layout.

**Out of scope:** imported assets, additional dependencies, post-processing,
continuous animation, and a second WebGL renderer.

**Success check:** the PBR reflections and shader bands are both visible in
the same frame. Their labeled controls update the intended specimens and reset
to the reference values. The composition stays clear at wide and narrow
viewports and retains the labeled fallback.

**Local result:** the final scene uses two torus-knot meshes sharing one
geometry, one shared `MeshStandardMaterial` across the PBR knot and smaller
sphere, one `ShaderMaterial` on the other knot, one renderer, one environment,
and placed key and rim lights. The knots separate and scale down at narrow
aspect ratios; the shader and PBR specimens remain visible together without
continuous animation.
All four focused Playwright checks pass, covering parameter mapping and reset,
first-render readiness, the three-sample WebGL fallback, accessibility, and
390 px / 320 px viewport containment. `pnpm lint`, `pnpm typecheck`, and
`pnpm build` pass.

The production build emits the MaterialStage module at 8.48 KB minified / 3.38
KB gzip. Three.js remains in a lazy-loaded chunk at 541.14 KB minified / 134.08
KB gzip, so Vite's over-500 KB chunk warning remains. No dependency or external
asset was added. In one local Playwright-managed Chromium 149.0.7827.55 run on
a Mac laptop with macOS 27.0.1, the first completed scene render was recorded
at 1,318.8 ms from navigation start at a 1280 × 720 viewport. The browser
reported `MacIntel`; the public result records only the device class. This is
a single local observation, not a frame-time or cross-device performance
result.

The fallback preserves the shared color, pattern, values, labels, and controls
as CSS samples. It does not reproduce curved studio reflections or the shader's
surface shading. No staging deployment is configured for this repository.

## Accessibility and fallback

- Use native labeled controls with visible keyboard focus and text values.
- Do not use color alone to communicate parameter values or material states.
- Keep explanations and reset available outside the canvas.
- Provide a useful fallback when WebGL is unavailable. It should describe the
  material or shader and preserve controls that can still be represented in
  HTML.
- Respect reduced-motion preferences; continuous animation must not be needed
  to understand a parameter.
- Check narrow, standard, and wide layouts as each slice changes the scene.

## Performance and validation

Use one deterministic local scene and record browser, operating system, device,
viewport, build, rendering mode, load and interaction observations, and bundle
size. Treat results as local evidence, not a device-wide performance guarantee.
Validate parameter mapping and reset behavior, keyboard use, fallback,
responsive layout, console output, and production build at each completed slice.

The richer composition should reuse the same material and shader controls so
the visual expansion does not become a second, unrelated experiment.

## Explicit non-goals

- No general-purpose material or shader editor.
- No imported model catalog, external asset service, or live data.
- No physics or realistic cloth simulation.
- No WebGPU migration or post-processing stack in the initial investigation.
- No claim about learning outcomes or universal performance.
- No scene complexity added only for decoration.

## Reuse boundary

Potentially reusable results include clear parameter controls for graphics,
HTML explanations paired with a WebGL scene, a small shader example, and the
measured boundary where added visual richness stops helping inspection. The
final decision should identify what can be reused and what remains specific to
this demonstration.

## Decision

**Incorporate selectively.** Reuse the native parameter controls, visible
values, reset behavior, and paired HTML explanation/fallback pattern when a
graphics experiment needs them. Keep the specific torus-knot and sphere studio
scene as a demonstration, not a general material editor or renderer library.
The single local first-render observation and bundle sizes inform this
implementation only; frame-time and cross-device performance remain unmeasured.
