# Search Flow Explorer — what we learned

Date of measurement: 2026-08-06

This is the short record of what we built, tested, and learned. The numbers
describe this local run. They are not a promise for every device and do not
make the demo production-ready.

It follows the repository's [working standard](implementation-standard.md).

## What we checked

The following commands passed on the Phase E branch:

```text
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm test:a11y
```

The full E2E run has 25 passing tests. It covers the flow behavior, four visual
comparisons, a Native/Motion performance check, and three responsive/console
checks. The separate accessibility command passes three axe checks.

Reference screenshots are stored in
`tests/visual.spec.ts-snapshots/`:

1. Candidates, desktop, with `SVG Accessibility Starter Guide` selected;
2. Filters, desktop, with `An Older SVG Primer for Authors` selected and its
   removal reason visible;
3. Ranking, mobile, with a selected resource and score details;
4. Recommendations, desktop, with `SVG Accessibility Starter Guide` selected.

The screenshots use fixed synthetic data, a light color scheme, reduced motion,
fixed viewport sizes, and `animations: 'disabled'`. Review a visual change
before updating them. The deliberate update command is:

```bash
pnpm test:visual:update
```

## Performance and bundle check

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

The production bundle is under the project limits of 100 kB gzip for
JavaScript and 20 kB gzip for CSS. Motion is included on purpose so we can
compare it with Native in the same demo. The Native-only build was smaller, so
the extra size is a real trade-off, not a free improvement.

We also checked stage changes separately for Native and Motion:

| Implementation | Long-task entries | Maximum duration | Total duration |
| --- | ---: | ---: | ---: |
| Native | 0 | 0 ms | 0 ms |
| Motion | 0 | 0 ms | 0 ms |

The browser supported the Long Tasks API. We saw no long tasks in this run.
That is a good local result, but it does not prove that every device or larger
dataset will behave the same way.

## Accessibility and screen-size checks

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
- The main content stayed measurable and within the viewport in the test's 200%
  CSS-zoom approximation. A real browser-zoom and screen-reader review still
  needs a person; this test cannot certify it.

## Native and Motion: the practical difference

Native keeps the dependency list and bundle smaller by using the browser's Web
Animations API directly. Motion adds a dependency, but gives us a higher-level
animation API. In this experiment, both modes use the same data, layout, final
state, keyboard behavior, and reduced-motion fallback. Switching modes also
keeps the current stage and selected resource.

We did not measure development time, run a screen-reader study, or test large
datasets. Those are limits of this experiment.

## Reusable principle

```text
structured data
→ deterministic stage snapshots
→ stable resource identity
→ responsive SVG representation
→ accessible HTML inspection
→ explanatory motion with a reduced-motion equivalent
```

Reusable parts are the snapshot model, stable ids, selection rules,
active-stage-only SVG controls, the HTML details boundary, and the small motion
vocabulary with interruption and reduced-motion rules.

The educational data, ranking weights, fixed coordinates, five-stage flow, and
1024px breakpoint belong only to this demo. Do not assume SVG is the right
renderer for large datasets without testing it.

## Decision

**Incorporate.** Reuse this pattern selectively for small SVG interfaces where
stable identity and an HTML equivalent matter. Keep Native as the low-cost
starting point. Add Motion only when its higher-level controls are worth the
extra dependency.
