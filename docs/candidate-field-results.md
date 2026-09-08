# Investigation 02 — Candidate Field: First Results

This note records the first runnable result, the Canvas equivalent, and the
combined comparison/stress harness. It still does not make a renderer decision:
the harness must be run repeatedly under named conditions before the trade-off
is trustworthy.

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

This first layer is implementation evidence, not a renderer decision. The
comparison run below is the first performance-oriented evidence collected after
the Canvas equivalent was added.

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

## Current decision

The SVG baseline remains usable through the 5,000-candidate product range, and
the accessible HTML path keeps the experiment understandable without creating
one keyboard stop per mark. This first combined run gives the project a useful
boundary: SVG reached a long-task signal at its 25,000 ceiling while Canvas
completed the declared 100,000 ceiling in the same bounded harness. That is a
reason to investigate Canvas selectively, not a final adoption decision. PR #9
should repeat the profile and choose whether to keep SVG, introduce Canvas
selectively, use a hybrid, reformulate, or archive the extension.

## Limits

- this run measures one browser session and one viewport;
- the baseline table is from one earlier SVG-only run and is not a comparison
  result;
- the comparison runner can record Canvas response, inspection response, and
  long-task entries, but memory and missed frames remain outside this layer;
- the stress ladder is bounded by the declared renderer ceilings and still needs
  repeated named-browser runs before it supports a decision;
- the SVG marks are intentionally simple and do not represent a production
  visualization workload;
- timings include browser automation and should be repeated before making a
  product recommendation.
