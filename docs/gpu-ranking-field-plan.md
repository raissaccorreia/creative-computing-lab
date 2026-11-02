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

## Implementation status

The first slice is implemented as a CPU Web Worker baseline, with fixed-seed
synthetic data, four normalized group weights, stable ranking, a Canvas 2D
field, and an HTML top-50 inspector. The page reports live score, sort, paint,
and end-to-paint timings; it also shows the earlier Candidate Field renderer
findings and the local ranking profiles. WebGL and WebGPU are not implemented.

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

Continue with the CPU baseline and profile sorting and the end-to-frame response
tail before considering GPU compute. The recorded threshold crossing is in the
sort phase's workload range, while average phase timings do not explain the
whole tail. Plan a GPU scoring comparison only if follow-up measurements show
score calculation is the dominant bottleneck. The current slice does not use
WebGL or WebGPU.
