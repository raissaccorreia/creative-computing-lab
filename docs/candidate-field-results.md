# Investigation 02 — Candidate Field: First Results

This note records the first runnable result and the Canvas equivalent. It does
not make a renderer decision: the comparison harness and repeated measurements
are still future steps.

## What is available

- public view at `/?demo=candidate-field`;
- deterministic candidate ids, titles, topics, scores, and positions;
- Initial, Filtered, and Reordered states;
- product volumes of 50, 250, 1,000, and 5,000 candidates;
- pointer selection plus a keyboard and screen-reader search path;
- an experimental Canvas 2D path at `/?demo=candidate-field&renderer=canvas`;
- a reusable stress command: `pnpm stress:candidate-field`.

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

This layer is implementation evidence, not performance evidence. No Canvas
timings have been recorded yet.

## Current decision

The SVG baseline is usable through the 5,000-candidate product range in this
run, and the accessible HTML path keeps the experiment understandable without
creating one keyboard stop per mark. Canvas now has an equivalent implementation,
but no renderer decision can be made yet. The next step is a separate comparison
harness followed by repeated measurements under the same conditions.

## Limits

- this run measures one browser session and one viewport;
- it does not measure Canvas performance, memory, long tasks, or missed frames;
- the stress ladder of 10,000–100,000 marks is not yet enabled;
- the SVG marks are intentionally simple and do not represent a production
  visualization workload;
- timings include browser automation and should be repeated before making a
  product recommendation.
