# Phase 0 — Visual foundation

Phase 0 establishes the visual system for the lab before the next renderer
experiment. It is a design foundation, not a new product surface.

## Question

Can the lab feel intentional and reusable across light, dark, mobile, and
desktop states without adding a component library or decorative complexity?

## Visual thesis

An editorial systems lab: warm paper in light mode, graphite in dark mode,
verdigris signals, geometric display type, and calm readable body copy.

## Decisions

- Verdigris `#27A1A4` is the single global accent.
- Light mode uses warm neutral surfaces; dark mode uses neutral graphite
  surfaces rather than green-tinted backgrounds.
- Space Grotesk is used for headings, labels, and diagram text.
- Elms Sans is used for paragraphs, controls, and dense interface copy.
- Both fonts are self-hosted through pinned Fontsource packages. Their package
  licenses are SIL Open Font License 1.1.
- The layout uses one content shell, a readable text measure, and full-width
  visual areas without arbitrary nested width caps.
- The interface stays card-light. Borders and surfaces mark real interaction
  boundaries only.

## Interaction thesis

1. Theme changes should be clear but quiet.
2. Selection and stage changes should use accent, shape, and weight together;
   color must not carry meaning alone.
3. Motion remains explanatory and has a reduced-motion equivalent.

## Validation

Review the initial page and the five Search Flow stages at 390px, 820px,
1024px, and 1280px in light, dark, and system themes. Check:

- no horizontal overflow;
- readable text measure and wrapping;
- visible keyboard focus;
- sufficient contrast for text and controls;
- equivalent information with reduced motion;
- stable canonical screenshots;
- production build and bundle size.

## Future investigation sequence

1. **Candidate Field** — compare SVG and Canvas at increasing volumes.
2. **Motion Comparer** — isolate Native and Motion trade-offs when the shared
   Search Flow comparison needs its own reusable method.
3. **System Anatomy** — introduce a small interactive 3D scene.
4. **Material Lab** — study parameterized materials and shaders.
5. **GPU Ranking Field** — compare CPU, WebGL, and WebGPU only when scale
   justifies the added complexity.
6. **Spatial Computing Lab** — optional work after the 3D foundation is stable.

Each investigation keeps one question, one primary demonstration, one success
criterion, synthetic neutral data, an accessible equivalent, and a final
decision: continue, incorporate, reformulate, or archive.
