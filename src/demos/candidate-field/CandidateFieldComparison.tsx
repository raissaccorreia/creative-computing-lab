import { useEffect, useMemo, useRef, useState } from 'react'
import CandidateFieldInspector from './CandidateFieldInspector'
import { STATE_OPTIONS } from './constants'
import { getRendererGuard, MEASUREMENT_TIME_BUDGET_MS } from './guards'
import RendererSurface from './RendererSurface'
import {
  CANDIDATE_STRESS_VOLUMES,
  CANDIDATE_VOLUMES,
  isCandidateFieldVolume,
  type CandidateFieldRenderer,
  type CandidateFieldState,
  type CandidateFieldVolume,
} from './types'
import {
  getFieldDimensions,
  getFieldItems,
  getFieldSummary,
  getFieldVolumeSummary,
  getMarkRadius,
} from './model'
import './candidate-field.css'
import './candidate-comparison.css'

type MeasurementStatus = 'idle' | 'measuring' | 'completed' | 'budget-exceeded' | 'guarded'

type Measurement = {
  status: MeasurementStatus
  durationMs: number | null
  renderedCount: number
  workloadKey: string
  message: string
}

type PendingMeasurement = {
  startedAt: number
  workloadKey: string
}

function readRenderer(): CandidateFieldRenderer {
  if (typeof window === 'undefined') return 'svg'
  return new URLSearchParams(window.location.search).get('renderer') === 'canvas'
    ? 'canvas'
    : 'svg'
}

function readState(): CandidateFieldState {
  if (typeof window === 'undefined') return 'initial'
  const value = new URLSearchParams(window.location.search).get('state')
  return value === 'filtered' || value === 'reordered' ? value : 'initial'
}

function readVolume(): CandidateFieldVolume {
  if (typeof window === 'undefined') return 250
  const value = Number(new URLSearchParams(window.location.search).get('volume'))
  return isCandidateFieldVolume(value) ? value : 250
}

function formatDuration(durationMs: number | null): string {
  return durationMs === null ? 'not measured' : `${durationMs.toFixed(1)} ms`
}

function CandidateFieldComparison() {
  const [renderer, setRenderer] = useState<CandidateFieldRenderer>(readRenderer)
  const [volume, setVolume] = useState<CandidateFieldVolume>(readVolume)
  const [state, setState] = useState<CandidateFieldState>(readState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [measurementNonce, setMeasurementNonce] = useState(0)
  const [measurement, setMeasurement] = useState<Measurement>({
    status: 'idle',
    durationMs: null,
    renderedCount: 0,
    workloadKey: '',
    message: 'Run a bounded measurement after choosing a renderer and workload.',
  })
  const pendingMeasurement = useRef<PendingMeasurement | null>(null)
  const workloadKey = `${renderer}:${volume}:${state}`
  const guard = getRendererGuard(renderer, volume)

  const items = useMemo(
    () => (guard.allowed ? getFieldItems(volume, state) : []),
    [guard.allowed, state, volume],
  )
  const dimensions = getFieldDimensions()
  const radius = getMarkRadius(volume)
  const summary = guard.allowed
    ? getFieldSummary(items, state)
    : getFieldVolumeSummary(volume, state)

  useEffect(() => {
    if (measurementNonce === 0 || !guard.allowed) return

    const pending = pendingMeasurement.current
    if (!pending || pending.workloadKey !== workloadKey) return

    let cancelled = false
    let firstFrame = 0
    let secondFrame = 0

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (cancelled) return
        const durationMs = performance.now() - pending.startedAt
        const status =
          durationMs <= MEASUREMENT_TIME_BUDGET_MS ? 'completed' : 'budget-exceeded'
        setMeasurement({
          status,
          durationMs,
          renderedCount: items.length,
          workloadKey,
          message:
            status === 'completed'
              ? 'The renderer completed within the directional response budget.'
              : 'The renderer exceeded the directional response budget; investigate before scaling further.',
        })
        pendingMeasurement.current = null
      })
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [guard.allowed, items.length, measurementNonce, workloadKey])

  const handleSelect = (id: string) => {
    if (items.some((item) => item.id === id)) setSelectedId(id)
  }

  const startMeasurement = () => {
    if (!guard.allowed) {
      setMeasurement({
        status: 'guarded',
        durationMs: null,
        renderedCount: 0,
        workloadKey,
        message: guard.reason,
      })
      return
    }

    pendingMeasurement.current = {
      startedAt: performance.now(),
      workloadKey,
    }
    setMeasurement({
      status: 'measuring',
      durationMs: null,
      renderedCount: 0,
      workloadKey,
      message: 'Mounting the selected renderer and waiting for two animation frames…',
    })
    setMeasurementNonce((current) => current + 1)
  }

  const measurementIsCurrent = measurement.workloadKey === workloadKey
  const visibleMeasurement = measurementIsCurrent
    ? measurement
    : {
        status: 'idle' as const,
        durationMs: null,
        renderedCount: 0,
        workloadKey,
        message: 'Run a bounded measurement after choosing a renderer and workload.',
      }

  return (
    <section className="candidate-field candidate-comparison" aria-labelledby="candidate-comparison-title">
      <header className="candidate-field__header candidate-comparison__header">
        <p className="candidate-field__eyebrow">Investigation 02 · comparison harness</p>
        <h2 id="candidate-comparison-title">Candidate Field Comparison</h2>
        <p className="candidate-field__lede">
          Hold the deterministic workload constant while switching between SVG and
          Canvas 2D. The harness measures renderer response, keeps inspection in
          HTML, and stops before an experimental workload can freeze the tab.
        </p>
      </header>

      <div className="candidate-comparison__controls">
        <fieldset className="candidate-comparison__control-group">
          <legend>Renderer</legend>
          <div className="candidate-comparison__renderer-options">
            {(['svg', 'canvas'] as const).map((option) => (
              <label key={option} className="candidate-comparison__renderer-option">
                <input
                  type="radio"
                  name="candidate-comparison-renderer"
                  value={option}
                  checked={renderer === option}
                  onChange={() => setRenderer(option)}
                />
                <span>
                  <strong>{option === 'svg' ? 'SVG' : 'Canvas 2D'}</strong>
                  <small>{option === 'svg' ? 'DOM baseline' : 'bitmap experiment'}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="candidate-field__states candidate-comparison__control-group">
          <legend>Field state</legend>
          <div className="candidate-field__state-options">
            {STATE_OPTIONS.map((option) => (
              <label key={option.value} className="candidate-field__state-option">
                <input
                  type="radio"
                  name="candidate-comparison-state"
                  value={option.value}
                  checked={state === option.value}
                  onChange={() => setState(option.value)}
                />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="candidate-field__volume candidate-comparison__volume">
          <span>Candidate volume</span>
          <select
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value) as CandidateFieldVolume)}
          >
            <optgroup label="Product volumes">
              {CANDIDATE_VOLUMES.map((option) => (
                <option key={option} value={option}>
                  {option.toLocaleString('en-US')} candidates
                </option>
              ))}
            </optgroup>
            <optgroup label="Stress volumes">
              {CANDIDATE_STRESS_VOLUMES.map((option) => (
                <option key={option} value={option}>
                  {option.toLocaleString('en-US')} candidates
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      <div className="candidate-comparison__status-row">
        <p className="candidate-field__summary" aria-live="polite">
          {summary}
          {guard.allowed ? '' : ` ${guard.reason}`}
        </p>
        <button
          className="candidate-comparison__measure"
          type="button"
          onClick={startMeasurement}
          disabled={visibleMeasurement.status === 'measuring'}
        >
          {visibleMeasurement.status === 'measuring' ? 'Measuring…' : 'Measure current workload'}
        </button>
      </div>

      <div className="candidate-comparison__measurement" data-testid="candidate-field-measurement">
        <div>
          <span className="candidate-comparison__label">Measured render response</span>
          <strong>{formatDuration(visibleMeasurement.durationMs)}</strong>
        </div>
        <div>
          <span className="candidate-comparison__label">Rendered marks</span>
          <strong>{visibleMeasurement.renderedCount.toLocaleString('en-US')}</strong>
        </div>
        <p
          aria-live="polite"
          data-status={visibleMeasurement.status}
          data-duration-ms={
            visibleMeasurement.durationMs === null
              ? undefined
              : visibleMeasurement.durationMs.toFixed(1)
          }
        >
          {visibleMeasurement.message} This is a directional browser measurement,
          not a universal benchmark.
        </p>
      </div>

      <div className="candidate-field__layout candidate-comparison__layout">
        <figure className="candidate-field__figure">
          <div className="candidate-field__figure-heading">
            <span>{renderer === 'canvas' ? 'Experimental renderer' : 'Baseline renderer'}</span>
            <strong>{renderer === 'canvas' ? 'Canvas 2D' : 'SVG'}</strong>
          </div>
          {guard.allowed ? (
            <div
              className="candidate-field__canvas candidate-comparison__surface"
              data-testid="candidate-field-comparison-surface"
              data-renderer={renderer}
              data-volume={volume}
              data-state={state}
              data-candidate-count={items.length}
            >
              <RendererSurface
                key={`${workloadKey}:${measurementNonce}`}
                renderer={renderer}
                items={items}
                selectedId={selectedId}
                radius={radius}
                dimensions={dimensions}
                summary={summary}
                onSelect={handleSelect}
              />
            </div>
          ) : (
            <div
              className="candidate-comparison__guard"
              data-testid="candidate-field-comparison-guard"
              role="status"
            >
              <strong>Guarded workload</strong>
              <p>{guard.reason}</p>
              <p>
                Choose a lower volume or the renderer with the higher guard limit
                before measuring. The renderer is not mounted for this workload.
              </p>
            </div>
          )}
          <figcaption>
            {guard.allowed
              ? 'The selected renderer receives the same deterministic items, stable ids, selection, and summary contract as the baseline route.'
              : 'Guarded workloads are reported as evidence boundaries; no renderer work is started beyond the declared limit.'}
          </figcaption>
        </figure>

        <CandidateFieldInspector
          items={items}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <section className="candidate-comparison__profile" aria-labelledby="candidate-profile-title">
        <div>
          <p className="candidate-field__eyebrow">Bounded profile</p>
          <h3 id="candidate-profile-title">What this harness can conclude</h3>
          <p>
            The product range is 50–5,000 candidates. The guarded stress profile
            adds 10,000, 25,000, 50,000, and 100,000 candidates, but each renderer
            has an explicit ceiling before the page mounts it.
          </p>
        </div>
        <dl>
          <div>
            <dt>SVG ceiling</dt>
            <dd>25,000 candidates</dd>
          </div>
          <div>
            <dt>Canvas ceiling</dt>
            <dd>100,000 candidates</dd>
          </div>
          <div>
            <dt>Response budget</dt>
            <dd>{MEASUREMENT_TIME_BUDGET_MS.toLocaleString('en-US')} ms</dd>
          </div>
          <div>
            <dt>Repeatable runner</dt>
            <dd><code>pnpm stress:candidate-field</code></dd>
          </div>
        </dl>
      </section>

      <p className="candidate-field__note">
        The browser runner repeats the same states and workloads outside the app
        and records its environment. The next decision is evidence-based: keep
        SVG, adopt Canvas for a bounded range, or reformulate the experiment.
      </p>
    </section>
  )
}

export default CandidateFieldComparison
