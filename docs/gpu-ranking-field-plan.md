# Investigation 05: GPU Ranking Field

## Question

For a deterministic ranking workload with synthetic candidate data, at what
volume does recomputing scores and ordering the results exceed a 50 ms response
budget? If that happens, does GPU scoring reduce the visible update time after
transfer, synchronization, sorting, and drawing costs are included?

## Current evidence

`src/demos/candidate-field/model.ts` calculates a fixed score from four
`RESOURCES` values. `getFieldItems()` sorts those scores when the field enters
its Reordered state, using the stable candidate id as a tie-breaker. The
candidate generator repeats resource scores for its variants. That keeps the
renderer fixture deterministic. It does not exercise changing weighted scores.

`scripts/stress-candidate-field.mjs` measures SVG and Canvas 2D response up to
100,000 marks. It does not isolate score calculation or sorting. Those results
locate a renderer boundary. They provide no evidence about the cost of
recomputing scores.

## Decision for the first slice

Build a CPU-only ranking baseline and measure the complete update before
choosing a GPU API. Use fixed-seed synthetic records with 32 numeric features,
grouped into four neutral criteria. Four native range controls adjust the
criteria weights. The weighted score and descending order must be deterministic;
ties use the stable record id.

Keep the presentation constant: Canvas 2D draws the field, and an HTML list and
inspector expose the top 50 records, their scores, and selection. Put the score
and sort work in a CPU Web Worker so an expensive update does not block the
controls. Initialize the synthetic records once per workload; weight changes
send only new weights to the worker. These are proposed components for this
investigation, not existing code contracts.

Use bounded volumes of 1,000, 10,000, 50,000, and 100,000 records. Keep the
Canvas renderer fixed across all future compute paths so the comparison isolates
ranking work. Measure the weight-change-to-painted-update time, including
worker messaging, score calculation, sorting, and the next paint. Also record
score and sort phases separately. Do not include one-time record generation in
the update measurement.

## Success check

The CPU baseline must produce the same ordered ids and scores as a simple
reference calculation, including ties, at every volume. Run repeated updates
for each volume and report p50, p95, and maximum response time in a named local
browser and device environment. The 100,000-record profile has a 2,500 ms guard
that stops a run safely.

The decision rule is explicit:

- If end-to-end p95 stays at or below 50 ms at 100,000 records, record that the
  measured workload does not justify GPU compute.
- If p95 exceeds 50 ms repeatedly and score calculation dominates the delay,
  plan one GPU scoring comparison against the same CPU baseline.
- If sorting dominates, GPU scoring does not address the measured bottleneck.
  Revisit the CPU ranking algorithm before considering a GPU path.

Use 50 ms as this experiment's threshold. Re-measure on each target device;
this result cannot predict performance across devices. A future GPU comparison
must include data upload, dispatch, synchronization and readback, any CPU
sorting that remains, and the visible update. WebGL and WebGPU remain options
until the measurements and browser support requirements choose between them.

## First local profile

Manual profiles used 20 weight updates per volume in the Codex in-app browser
on macOS with a 1,280 × 720 viewport. The device pixel ratio was not captured.
There was one profile each at 1,000, 10,000, and 50,000 records, and two at
100,000. The table reports p50, p95, maximum, and average score / sort / paint
times in milliseconds. Dataset generation was excluded.

The original profile ended at the first `requestAnimationFrame` callback after
Canvas drawing. That callback runs before the browser's next paint. Treat these
totals as request-to-frame-callback readings, not confirmation that a frame was
presented. Follow-up profiles use a second callback to include one intervening
browser rendering opportunity; their totals are not directly comparable to the
original readings.

| Records | p50 | p95 | Maximum | Average score / sort / paint |
| --- | ---: | ---: | ---: | ---: |
| 1,000 | 11.4 | 17.9 | 18.2 | 0.0 / 0.1 / 0.1 |
| 10,000 | 14.9 | 23.4 | 24.7 | 0.3 / 1.8 / 0.9 |
| 50,000 | 21.9 | 102.4 | 106.6 | 1.2 / 8.7 / 4.4 |
| 100,000 | 41.7–44.7 | 209.3–209.8 | 210.4–222.5 | 2.1–4.0 / 17.1–17.4 / 9.1–9.2 |

The p95 crossed the 50 ms threshold at 50,000 records in this session. Sorting
was the largest average phase. At 100,000 records, the average phase times do
not account for the full end-to-frame response tail. Profile CPU sorting and
that tail before planning a GPU scoring comparison. These measurements describe
one browser session and do not predict performance across devices.

## First-slice implementation status

The first slice is implemented as a CPU Web Worker baseline, with fixed-seed
synthetic data, four normalized group weights, stable ranking, a Canvas 2D
field, and an HTML top-50 inspector. The page reports live score, sort, Canvas
draw, and input-to-rendered-frame timings; it also shows the earlier Candidate
Field renderer findings and the local ranking profiles. WebGL and WebGPU are
not implemented.

## Follow-up slice — CPU sorting and response tail

### Scope and decision

Improve the existing measurement before changing the ranking algorithm. Keep
the same synthetic data, complete stable ordering, worker, and Canvas field.
The worker's current `sortMs` combines index-buffer initialization, the typed
array comparator, and construction of the rank lookup. Split these phases, and
measure the response path around them so each profile reports p50, p95, and
maximum for score, sort setup, comparator sort, rank lookup, top-50 details,
worker/message remainder, response-to-Canvas start, Canvas drawing, and frame
wait. Keep end-to-frame response p50, p95, and maximum as the primary measure.

Measure worker/message remainder as request-to-worker-response time minus the
worker phases. It includes worker dispatch, transfer, event delivery, and any
unmeasured worker work. Measure response-to-Canvas start from main-thread
message receipt to the synchronous Canvas draw start; it includes React render
and commit plus the small setup before drawing. Measure Canvas draw directly,
then measure frame wait from draw completion through the second animation-frame
callback. These sequential intervals explain the end-to-frame total within
timer precision. Phase percentiles are computed independently, so their p95
values do not necessarily come from the same update.

After drawing the Canvas, wait for two animation-frame callbacks before ending
the response measurement. This gives the browser one rendering opportunity
between callbacks. It does not prove that pixels reached a physical display, so
the page describes the result as time to a rendered-frame opportunity rather
than a guaranteed display time.

Do not replace `Uint32Array.sort`, change ranking semantics, or add WebGL / WebGPU
in this slice. Use the measurements to decide whether CPU ordering or a stage
outside score/sort warrants a separate follow-up. A GPU comparison requires
score calculation to dominate the measured delay.

### Flow and file map

- `src/demos/gpu-ranking-field/model.ts`: time index initialization, comparator
  sorting, rank lookup construction, and top-50 detail extraction separately.
- `src/demos/gpu-ranking-field/worker-protocol.ts` and
  `ranking.worker.ts`: return the new phase durations with each ranking.
- `src/demos/gpu-ranking-field/GpuRankingField.tsx`: capture main-thread
  message receipt, React-to-Canvas delay, draw duration, and frame wait; report
  p50 / p95 / maximum per phase; keep GPU decisions conditional on evidence.
- `src/demos/gpu-ranking-field/gpu-ranking-field.css`: style the phase table and
  keep its horizontal overflow keyboard-accessible on narrow screens.
- This document: record the measurement boundary, methodology, local evidence,
  and limitations after the profile is reviewed.

### Implementation status and completion check

The page now reports p50, p95, and maximum for total response and the measured
worker, main-thread, Canvas, and frame intervals. The Canvas measurement ends
after two animation-frame callbacks, with one intervening rendering opportunity.
This timing remains an approximation of visible response, not a hardware
presentation timestamp.

- The live metric names the measured boundary accurately.
- A bounded profile reports total response and each component distribution at
  the selected volume, including partial runs stopped by the existing guard.
- The phase table exposes the worker's sorting subphases and the remaining
  response intervals as p50 / p95 / maximum in semantic HTML.
- Build and lint checks pass; the local ranking page remains available for
  interactive review.

### Follow-up local profile — 2026-11-04

Profiles ran in the Codex in-app browser on macOS, in a 1,280 × 720 CSS
viewport at DPR 2, using the Vite development server. Each profile contains 20
weight updates after the dataset was initialized. The 50,000-record profile was
repeated once and the 100,000-record profile was repeated twice. Values are
separate runs, not pooled samples.

| Records | Response p50 (ms) | Response p95 (ms) | Response maximum (ms) |
| --- | ---: | ---: | ---: |
| 1,000 | 16.6 | 23.6 | 24.7 |
| 10,000 | 16.7 | 21.8 | 22.7 |
| 50,000 | 24.9 / 25.0 | 98.5 / 103.0 | 112.7 / 103.2 |
| 100,000 | 54.0 / 54.9 / 54.4 | 228.1 / 220.5 / 217.3 | 234.0 / 232.5 / 217.7 |

| Records | Comparator sort p95 (ms) | Frame wait p95 (ms) | Frame wait maximum (ms) |
| --- | ---: | ---: | ---: |
| 1,000 | 0.3 | 13.9 | 14.7 |
| 10,000 | 2.0 | 15.1 | 16.8 |
| 50,000 | 8.7 / 9.5 | 77.3 / 9.6 | 89.4 / 81.1 |
| 100,000 | 17.3 / 20.2 / 17.7 | 189.8 / 185.1 / 181.8 | 199.1 / 196.9 / 188.1 |

At 100,000 records, score p95 was 4.2 / 5.9 / 4.3 ms, comparator sort p95 was
17.3 / 20.2 / 17.7 ms, and Canvas draw p95 was 8.9 / 9.0 / 9.4 ms. Frame wait
dominated the end-to-frame response p95 at 182–190 ms across all three runs.
Worker/message p95 stayed at 0.3 / 0.6 / 0.4 ms, while response-to-Canvas p95
was 8.1 / 8.3 / 8.4 ms. One run had a worker/message maximum of 144.4 ms,
showing that this interval can also contain a rare stall even though its p95
stayed small. These local profiles do not show a scoring or sorting bottleneck
large enough to explain the response tail; GPU scoring would not address the
measured frame wait.

At 50,000 records, response p95 exceeded 50 ms in both runs. The location of
the rare delay varied: frame-wait p95 was 77.3 ms in one run and 9.6 ms in the
other, while worker/message maxima were 69.3 / 72.9 ms. These independent phase
percentiles do not identify the same update. Rare delays appeared in frame wait
and, in the latest 100,000-record run, worker/message handling. The measurements
locate the tail in browser/message scheduling intervals but do not explain the
underlying long-task or scheduling cause. They describe this local browser
session only.

## Accessibility and limits

Use labeled native controls with visible values and keyboard support. Keep the
top 50 records and inspector in HTML; the Canvas field is a second view of the
same ranking. The experiment uses synthetic data and makes no claim about real
ranking systems or all devices. It does not implement WebGL or WebGPU in this
slice, and it does not establish that a GPU sort is necessary.

## Reuse boundary

The reusable result may include deterministic vector generation, stable ranking
contracts, a worker measurement harness, and the end-to-end comparison method.
Keep the scoring fixture and field presentation specific to this investigation.

## Decision / next step

Keep the CPU baseline and do not add GPU scoring. In the follow-up local
profiles, comparator sorting remained around 17–20 ms p95 at 100,000 records,
while frame wait reached 182–190 ms p95. If this investigation continues, trace
the rare frame and worker-message delays before changing compute. These results
do not generalize beyond the measured browser session. The current slice does
not use WebGL or WebGPU.
