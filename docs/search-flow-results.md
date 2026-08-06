# Search Flow Explorer — Phase E results

Date of measurement: 2026-08-06

This document records the observed result of the Search Flow Explorer
experiment. It is evidence for this repository, not a universal benchmark or
a claim of production readiness.

## Validation summary

The following commands passed on the Phase E branch:

```text
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm test:a11y
```

The full E2E run contains 25 passing tests: the existing flow behavior, four
canonical visual comparisons, one Native/Motion long-task profile, and three
responsive/console evidence checks. The explicit accessibility command passes
three axe checks.

Canonical screenshots are stored in
`tests/visual.spec.ts-snapshots/`:

1. Candidates, desktop, with `SVG Accessibility Starter Guide` selected;
2. Filters, desktop, with `An Older SVG Primer for Authors` selected and its
   removal reason visible;
3. Ranking, mobile, with a selected resource and score details;
4. Recommendations, desktop, with `SVG Accessibility Starter Guide` selected.

Capture conditions use synthetic deterministic data, a light color scheme,
reduced motion, fixed viewport sizes, and `animations: 'disabled'`. Review a
visual change before updating snapshots. The deliberate update command is:

```bash
pnpm test:visual:update
```

## Performance and bundle evidence

Environment:

- macOS 26.5.2, Darwin 25.5.0, arm64;
- Chromium 149.0.7827.55 through Playwright 1.61.1;
- default Playwright Desktop Chrome viewport for the long-task profile;
- production command: `pnpm build`.

Build output:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| JavaScript | 282,425 bytes | 88,093 bytes |
| CSS | 9,410 bytes | 2,367 bytes |

The production bundle remains under the Phase E budgets of 100 kB gzip for
JavaScript and 20 kB gzip for CSS. The Motion implementation is the intentional
dependency in this combined build; the earlier Native-only build was smaller,
so this total includes the cost of making the comparison executable in the
public demo.

The browser profile observes stage changes separately for Native and Motion:

| Implementation | Long-task entries | Maximum duration | Total duration |
| --- | ---: | ---: | ---: |
| Native | 0 | 0 ms | 0 ms |
| Motion | 0 | 0 ms | 0 ms |

The Long Tasks API was supported in the observed browser. Zero entries means
that no JavaScript long task was observed during this local run; it does not
prove that every device or content volume will behave identically.

## Accessibility and responsive evidence

- Keyboard selection, Enter/Space activation, focus indication, selection
  persistence, and interruption behavior remain covered by the existing E2E
  tests.
- Reduced motion reaches the same information state without active animations
  in both implementations.
- The SVG has dynamic title/description content, while resource metadata and
  explanations remain available in HTML.
- Three axe checks pass: initial desktop, initial mobile, and Filters after
  navigation. Axe is only an automated signal, not a complete accessibility
  audit.
- No console errors or page errors were observed during the complete flow.
- No horizontal overflow was observed at 390px, 820px, 1024px, or 1280px.
- The main content remained measurable and within the viewport in the test's
  200% CSS-zoom approximation. A real assistive-technology and browser-zoom
  review remains a human follow-up, not something this test can certify.

## Comparison observations

Native minimizes application dependency and bundle cost while using the
browser Web Animations API directly. Motion adds a deliberate runtime
dependency and a higher-level animation API. In this bounded experiment, both
implementations share the same data, geometry, final information state,
selection model, keyboard behavior, and reduced-motion fallback. The existing
tests also confirm that switching implementation preserves the current stage
and selected resource.

The comparison is qualitative rather than a product benchmark: it does not
measure maintainers' development time, a screen-reader study, or performance at
large dataset volumes.

## Reusable principle

```text
structured data
→ deterministic stage snapshots
→ stable resource identity
→ responsive SVG representation
→ accessible HTML inspection
→ explanatory motion with a reduced-motion equivalent
```

Reusable parts are the snapshot model, stable-id continuity, selection rules,
active-stage-only SVG semantics, HTML details boundary, and the small motion
vocabulary with interruption and reduced-motion rules.

The educational dataset, ranking weights, fixed coordinates, five-stage flow,
and 1024px breakpoint are experiment-specific. SVG should not be assumed for
large datasets without a new volume and interaction test.

## Decision

**Incorporate.** Reuse this pattern selectively for small, explainable SVG
interfaces where stable identity and an HTML equivalent matter. Keep Native as
the low-cost baseline and add Motion only when its higher-level controls justify
the dependency for the next experiment.
