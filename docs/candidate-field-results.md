# Investigation 02 — Candidate Field: Results and Renderer Decision

This note records the SVG baseline, the Canvas equivalent, the combined
comparison/stress harness, and the first renderer decision. The decision is
bound to the named workload and browser conditions below; it is not a universal
performance claim.

## What is available

- public view at `/?demo=candidate-field`;
- deterministic candidate ids, titles, topics, scores, and positions;
- Initial, Filtered, and Reordered states;
- product volumes of 50, 250, 1,000, and 5,000 candidates;
- pointer selection plus a keyboard and screen-reader search path;
- an experimental Canvas 2D path at `/?demo=candidate-field&renderer=canvas`;
- a separate comparison view at `/?demo=candidate-field-comparison`;
- a reusable bounded runner: `pnpm stress:candidate-field`.

## Chrome baseline run

The stress command was run against the built preview with the installed
external Google Chrome binary. It opened a temporary profile with no account,
sync, or extensions. The browser was Chrome 152, the viewport was 1,440 ×
1,000, and the URL was `http://127.0.0.1:4173/?demo=candidate-field`.

The values below are Playwright-observed wall times for one run. They are
directional evidence for this implementation, not a universal benchmark.

| Volume | Marks | Initial render (ms) | Filtered update (ms) | Reordered update (ms) |
| ---: | ---: | ---: | ---: | ---: |
| 50 | 50 | 18.4 | 19.7 | 87.8 |
| 250 | 250 | 4.6 | 162.7 | 19.1 |
| 1,000 | 1,000 | 8.1 | 19.2 | 29.2 |
| 5,000 | 5,000 | 45.0 | 57.8 | 161.2 |

The 250-candidate filtered result is an outlier in this single run. It should
not be treated as a threshold until repeated samples and the Canvas equivalent
are measured under the same conditions.

## Canvas layer

The Canvas path uses the same deterministic field model and renderer-neutral
interaction contract as the SVG path. It owns only drawing, device-pixel-ratio
scaling, resize redraws, and pointer hit testing. The labelled HTML search form
and details panel remain the keyboard and screen-reader path.

This first layer is implementation evidence. The comparison and repeated runs
below turn it into a bounded renderer decision without claiming a universal
benchmark.

## Comparison and guarded stress profile

The comparison view holds the deterministic records, state, stable ids, and
HTML inspection path constant while a person switches between SVG and Canvas
2D. It exposes product volumes of 50, 250, 1,000, and 5,000 candidates plus a
guarded stress ladder of 10,000, 25,000, 50,000, and 100,000 candidates.

The UI does not mount a workload beyond its renderer limit:

| Renderer | Guarded ceiling | Purpose |
| --- | ---: | --- |
| SVG | 25,000 candidates | Avoid an unbounded DOM experiment in the public tab |
| Canvas 2D | 100,000 candidates | Bound the bitmap experiment before a later GPU investigation |

The `Measure current workload` control remounts the selected renderer, waits for
two animation frames, and records a directional response time. The result is
explicitly not a universal benchmark. The external runner repeats the three
states for each allowed workload, measures the HTML candidate-inspection path,
records optional long-task entries, and emits guarded results without mounting
them. Its Chrome profile is temporary and has no login or extensions.

## Combined profile run

The first complete run of `pnpm stress:candidate-field` used the built preview,
external Google Chrome 152 headless, macOS Darwin 25.6.0, Node 24.14.0, a
1,440 × 1,000 viewport, and device-pixel ratio 1. The profile completed all
allowed workloads and produced these renderer-response readings in milliseconds
for Initial / Filtered / Reordered:

| Volume | SVG response (ms) | Canvas response (ms) | SVG result | Canvas result |
| ---: | ---: | ---: | --- | --- |
| 50 | 31.0 / 32.0 / 30.6 | 31.7 / 31.5 / 30.2 | completed | completed |
| 250 | 30.6 / 31.9 / 32.2 | 31.4 / 30.9 / 30.2 | completed | completed |
| 1,000 | 31.1 / 31.8 / 32.0 | 31.4 / 31.2 / 31.9 | completed | completed |
| 5,000 | 32.4 / 32.5 / 32.4 | 29.9 / 31.3 / 31.7 | completed | completed |
| 10,000 | 47.9 / 44.6 / 38.9 | 31.1 / 31.8 / 32.1 | completed | completed |
| 25,000 | 111.7 / 112.3 / 116.1 | 30.8 / 32.2 / 32.3 | completed; long tasks 95–98 ms | completed |
| 50,000 | — | 30.0 / 32.3 / 32.3 | guarded above 25,000 | completed |
| 100,000 | — | 37.9 / 32.0 / 32.3 | guarded above 25,000 | completed |

The same run measured HTML inspection wall time for `candidate-00001` and
preserved that stable id in all 42 state/renderer/workload checks. The largest
inspection readings were 115.9 ms for SVG at 25,000 candidates and 46.0 ms for
Canvas at 1,000 candidates. No long-task entries were reported for Canvas in
this run; SVG reported one roughly 95–98 ms long task for each 25,000-candidate
state.

These renderer-response values include the harness contract of a fresh mount
and two animation frames, so values near 32 ms are a timing floor rather than
proof that one renderer is faster. They are useful for confirming completion,
guard behavior, and obvious scale boundaries. Repeated runs, memory, missed
frames, pointer latency, and a more realistic mark workload remain necessary
before the renderer decision in PR #9.

## Repeated evidence run — PR #9

The runner now accepts a bounded repeat count. The decision run used:

```bash
CANDIDATE_FIELD_HEADLESS=true CANDIDATE_FIELD_RUNS=3 pnpm stress:candidate-field
```

It completed three samples for each of the 42 measured
renderer/volume/state combinations. The table reports the initial-state
renderer response as `median / maximum` across those three samples; Filtered
and Reordered were measured in the same run and are included in the aggregate
output. The two SVG rows above 25,000 are guards, not failed renders.

| Volume | SVG initial response (ms) | Canvas initial response (ms) | SVG | Canvas |
| ---: | ---: | ---: | --- | --- |
| 50 | 31.7 / 31.7 | 30.4 / 30.7 | measured | measured |
| 250 | 30.7 / 31.1 | 30.4 / 31.4 | measured | measured |
| 1,000 | 30.5 / 30.8 | 31.1 / 31.8 | measured | measured |
| 5,000 | 31.7 / 32.0 | 30.3 / 30.6 | measured | measured |
| 10,000 | 47.0 / 47.3 | 25.1 / 30.8 | measured | measured |
| 25,000 | 116.6 / 117.0 | 30.8 / 31.1 | measured; long tasks | measured |
| 50,000 | — | 30.2 / 30.7 | guarded | measured |
| 100,000 | — | 30.9 / 31.9 | guarded | measured |

SVG produced long-task entries in all three states at 25,000 candidates in all
three runs; the maximum observed entry was 101 ms. Canvas produced no
long-task entries in the repeated profile. HTML inspection of
`candidate-00001` preserved the stable id in all 126 measured checks. The
largest inspection outliers were 129.5 ms for SVG at 25,000 and 51.1 ms for
Canvas at 100,000.

The runner also reports the guarded rows explicitly, limits repeats to five,
and emits per-state medians, maxima, and long-task counts so a later run can be
compared without hand-copying raw samples.

## Bundle and validation evidence

The built preview remained dependency-neutral for this decision pass: PR #9
adds no runtime dependency and changes the stress runner and documentation
only. The current production build reports a 303.40 kB JavaScript asset (95.25
kB gzip) and a 26.66 kB CSS asset (5.19 kB gzip). The comparison route passed
the responsive and axe checks, the full browser suite remained green, and the
comparison/guard visual inspection reported no console errors or warnings.

These renderer-response values still include a fresh mount and two animation
frames, so readings near 30–32 ms are a timing floor rather than proof that
one renderer is intrinsically faster. They are strong enough to identify the
SVG scale boundary in this workload, but not to replace memory, missed-frame,
pointer-latency, or real application-data validation.

## Current decision

The decision is a selective hybrid boundary:

- keep SVG as the public default through the tested 50–5,000 product range;
- preserve the HTML inspection path as the semantic contract for every renderer;
- recommend Canvas for a future dense overview at 10,000 candidates or above,
  subject to a real workload needing that density;
- keep the Canvas path experimental and explicit until a product scenario
  validates pointer behavior, progressive disclosure, memory, and missed-frame
  behavior on target devices.

No automatic public renderer switch is applied in this PR. That keeps the
current product range simple and avoids turning a synthetic benchmark into a
production guarantee. A future application PR is justified only if a real
dense workload appears; otherwise the comparison harness and decision note are
the reusable result.

## Limits

- the repeated run measures one browser family, one operating system, one
  viewport, and one device-pixel ratio;
- the baseline table is from one earlier SVG-only run and is not a comparison
  result;
- the comparison runner can record Canvas response, inspection response, and
  long-task entries, but memory, missed frames, and pointer latency remain
  outside this layer;
- the stress ladder is bounded by the declared renderer ceilings and the
  10,000+ recommendation is conditional on a real application workload;
- the SVG marks are intentionally simple and do not represent a production
  visualization workload;
- timings include browser automation and should be repeated on target hardware
  before changing a product renderer.
