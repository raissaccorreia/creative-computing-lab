import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { RotateCcw } from 'lucide-react'

import {
  DEFAULT_WEIGHTS,
  RANKING_VOLUMES,
  WEIGHT_GROUPS,
  isRankingVolume,
  normalizeWeights,
  type RankedCandidate,
  type RankingVolume,
  type RankingWeights,
} from './model'
import type { RankingRequest, RankingResponse } from './worker-protocol'
import './gpu-ranking-field.css'

type RankedResponse = Extract<RankingResponse, { type: 'ranked' }>
type UpdateSample = {
  totalMs: number
  scoreMs: number
  sortMs: number
  paintMs: number
  generationMs: number
}
type PendingUpdate = {
  startedAt: number
  response?: RankedResponse
  resolve: (sample: UpdateSample | null) => void
}
type ProfileSummary = {
  volume: RankingVolume
  sampleCount: number
  p50: number
  p95: number
  maximum: number
  averageScoreMs: number
  averageSortMs: number
  averagePaintMs: number
  stoppedAtBudget: boolean
}

const DEFAULT_VOLUME: RankingVolume = 10_000
const PROFILE_SAMPLE_COUNT = 20
const PROFILE_BUDGET_MS = 2_500
const NUMBER_FORMAT = new Intl.NumberFormat('en-US')
const WEIGHT_PROFILE: readonly RankingWeights[] = [
  [0.55, 0.2, 0.15, 0.1],
  [0.15, 0.55, 0.2, 0.1],
  [0.1, 0.2, 0.55, 0.15],
  [0.15, 0.1, 0.2, 0.55],
]

function readClock(): number {
  return performance.now()
}

function formatMs(value: number | null | undefined): string {
  return value === null || value === undefined ? 'Waiting' : `${value.toFixed(1)} ms`
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)]
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

function getDecisionCopy(profile: ProfileSummary): string {
  if (profile.volume !== 100_000) {
    return 'The 100,000-record profile is the decision gate for this investigation.'
  }
  if (profile.p95 <= 50) {
    return 'The CPU baseline stays within the 50 ms target at 100,000 records. The measured workload does not call for GPU scoring.'
  }

  const largestPhase = Math.max(profile.averageScoreMs, profile.averageSortMs, profile.averagePaintMs)
  if (largestPhase === profile.averageScoreMs) {
    return 'Scoring is the largest measured phase and the visible update exceeds 50 ms. A GPU scoring comparison could answer the remaining question.'
  }
  if (largestPhase === profile.averageSortMs) {
    return 'Sorting is the largest measured phase. GPU scoring would leave the measured bottleneck in place.'
  }
  return 'Canvas painting is the largest measured phase. A GPU scoring comparison would not address the current bottleneck.'
}

function ScoreField({
  response,
  onPainted,
}: {
  response: RankedResponse
  onPainted: (requestId: number, paintMs: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPaintedRequestRef = useRef<number | null>(null)
  const onPaintedRef = useRef(onPainted)

  useEffect(() => {
    onPaintedRef.current = onPainted
  }, [onPainted])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const context = canvas.getContext('2d')
      const bounds = canvas.getBoundingClientRect()
      if (!context || bounds.width === 0 || bounds.height === 0) return

      const drawStartedAt = readClock()
      const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
      const width = bounds.width
      const height = bounds.height
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const plot = { left: 40, right: 16, top: 18, bottom: 32 }
      const plotWidth = width - plot.left - plot.right
      const plotHeight = height - plot.top - plot.bottom
      context.fillStyle = '#10191b'
      context.fillRect(0, 0, width, height)

      context.strokeStyle = 'rgba(167, 199, 193, 0.14)'
      context.lineWidth = 1
      context.beginPath()
      for (let step = 0; step <= 4; step += 1) {
        const x = plot.left + (plotWidth * step) / 4
        const y = plot.top + (plotHeight * step) / 4
        context.moveTo(x, plot.top)
        context.lineTo(x, height - plot.bottom)
        context.moveTo(plot.left, y)
        context.lineTo(width - plot.right, y)
      }
      context.stroke()

      const total = response.rankByIndex.length
      const topBand = Math.ceil(total * 0.1)
      const nextBand = Math.ceil(total * 0.3)
      const dimPath = new Path2D()
      const middlePath = new Path2D()
      const topPath = new Path2D()
      const radius = total >= 50_000 ? 1.25 : total >= 10_000 ? 1.7 : 2.5

      for (let candidateIndex = 0; candidateIndex < total; candidateIndex += 1) {
        const signalOffset = candidateIndex * 4
        const x = plot.left + response.signalMeans[signalOffset] * plotWidth
        const y = plot.top + (1 - response.signalMeans[signalOffset + 1]) * plotHeight
        const rank = response.rankByIndex[candidateIndex]
        const path = rank < topBand ? topPath : rank < nextBand ? middlePath : dimPath
        path.moveTo(x + radius, y)
        path.arc(x, y, radius, 0, Math.PI * 2)
      }

      context.fillStyle = '#52706e'
      context.globalAlpha = 0.58
      context.fill(dimPath)
      context.fillStyle = '#a5c2bc'
      context.globalAlpha = 0.86
      context.fill(middlePath)
      context.fillStyle = '#65ded2'
      context.globalAlpha = 1
      context.fill(topPath)
      context.globalAlpha = 1

      context.strokeStyle = '#9db5b2'
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(plot.left, plot.top)
      context.lineTo(plot.left, height - plot.bottom)
      context.lineTo(width - plot.right, height - plot.bottom)
      context.stroke()

      const paintMs = readClock() - drawStartedAt
      if (lastPaintedRequestRef.current !== response.requestId) {
        lastPaintedRequestRef.current = response.requestId
        requestAnimationFrame(() => onPaintedRef.current(response.requestId, paintMs))
      }
    }

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(draw)
    if (canvas.parentElement) observer?.observe(canvas.parentElement)
    window.addEventListener('resize', draw)
    draw()

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [response])

  return (
    <canvas
      ref={canvasRef}
      className="gpu-ranking__canvas"
      role="img"
      aria-label={`Synthetic candidate field with ${NUMBER_FORMAT.format(response.volume)} points. Horizontal position shows Signal 01, vertical position shows Signal 02, and brightness marks ranking bands. The top 50 ranked records are available in the HTML selector.`}
      data-testid="gpu-ranking-field-canvas"
      data-volume={response.volume}
    />
  )
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="gpu-ranking__metric">
      <dt>{label}</dt>
      <dd>
        {value}
        {note ? <span>{note}</span> : null}
      </dd>
    </div>
  )
}

function GpuRankingField() {
  const [volume, setVolume] = useState<RankingVolume>(DEFAULT_VOLUME)
  const [weights, setWeights] = useState<RankingWeights>(DEFAULT_WEIGHTS)
  const [response, setResponse] = useState<RankedResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'updating' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [latestSample, setLatestSample] = useState<UpdateSample | null>(null)
  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const latestRequestIdRef = useRef(0)
  const pendingUpdatesRef = useRef(new Map<number, PendingUpdate>())
  const updateTimerRef = useRef<number | null>(null)
  const weightsRef = useRef<RankingWeights>(DEFAULT_WEIGHTS)
  const volumeRef = useRef<RankingVolume>(DEFAULT_VOLUME)

  const requestRanking = useCallback((nextWeights: RankingWeights, nextVolume: RankingVolume) => {
    const worker = workerRef.current
    if (!worker) return Promise.resolve(null)

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    latestRequestIdRef.current = requestId
    setStatus('updating')

    const promise = new Promise<UpdateSample | null>((resolve) => {
      pendingUpdatesRef.current.set(requestId, {
        startedAt: readClock(),
        resolve,
      })
    })

    const request: RankingRequest = { requestId, volume: nextVolume, weights: nextWeights }
    worker.postMessage(request)
    return promise
  }, [])

  useEffect(() => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./ranking.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      window.setTimeout(() => {
        setStatus('error')
        setErrorMessage('This browser could not start the CPU worker. The ranking was not moved onto the main thread.')
      }, 0)
      return
    }

    workerRef.current = worker
    const pendingUpdates = pendingUpdatesRef.current
    worker.onmessage = (event: MessageEvent<RankingResponse>) => {
      const message = event.data
      const pending = pendingUpdatesRef.current.get(message.requestId)
      if (!pending) return

      if (message.type === 'error') {
        if (message.requestId === latestRequestIdRef.current) {
          setStatus('error')
          setErrorMessage(message.message)
        }
        pendingUpdatesRef.current.delete(message.requestId)
        pending.resolve(null)
        return
      }

      pending.response = message
      if (message.requestId !== latestRequestIdRef.current) {
        pendingUpdatesRef.current.delete(message.requestId)
        pending.resolve(null)
        return
      }

      setResponse(message)
      setStatus('ready')
      setErrorMessage(null)
      setSelectedId((current) =>
        current && message.topCandidates.some((candidate) => candidate.id === current)
          ? current
          : message.topCandidates[0]?.id ?? null,
      )
    }
    worker.onerror = () => {
      setStatus('error')
      setErrorMessage('The CPU worker stopped before it could return a ranking.')
      worker.terminate()
      if (workerRef.current === worker) workerRef.current = null
      pendingUpdates.forEach((pending) => pending.resolve(null))
      pendingUpdates.clear()
    }

    void requestRanking(DEFAULT_WEIGHTS, DEFAULT_VOLUME)

    return () => {
      if (updateTimerRef.current !== null) window.clearTimeout(updateTimerRef.current)
      worker.terminate()
      workerRef.current = null
      pendingUpdates.forEach((pending) => pending.resolve(null))
      pendingUpdates.clear()
    }
  }, [requestRanking])

  const handlePainted = useCallback((requestId: number, paintMs: number) => {
    const pending = pendingUpdatesRef.current.get(requestId)
    if (!pending?.response) return

    const sample: UpdateSample = {
      totalMs: readClock() - pending.startedAt,
      scoreMs: pending.response.scoreMs,
      sortMs: pending.response.sortMs,
      paintMs,
      generationMs: pending.response.generationMs,
    }
    pendingUpdatesRef.current.delete(requestId)
    pending.resolve(sample)
    if (requestId === latestRequestIdRef.current) setLatestSample(sample)
  }, [])

  const handleWeightChange = (index: number, value: number) => {
    const nextWeights = [...weightsRef.current] as [number, number, number, number]
    nextWeights[index] = value
    weightsRef.current = nextWeights
    setWeights(nextWeights)
    setProfile(null)

    if (updateTimerRef.current !== null) window.clearTimeout(updateTimerRef.current)
    updateTimerRef.current = window.setTimeout(() => {
      void requestRanking(weightsRef.current, volumeRef.current)
    }, 100)
  }

  const handleVolumeChange = (value: number) => {
    if (!isRankingVolume(value)) return
    if (updateTimerRef.current !== null) window.clearTimeout(updateTimerRef.current)
    volumeRef.current = value
    setVolume(value)
    setProfile(null)
    setLatestSample(null)
    void requestRanking(weightsRef.current, value)
  }

  const handleReset = () => {
    if (updateTimerRef.current !== null) window.clearTimeout(updateTimerRef.current)
    weightsRef.current = DEFAULT_WEIGHTS
    setWeights(DEFAULT_WEIGHTS)
    setProfile(null)
    void requestRanking(DEFAULT_WEIGHTS, volumeRef.current)
  }

  const runProfile = async () => {
    if (isMeasuring || status !== 'ready') return
    setIsMeasuring(true)
    setProfile(null)
    const savedWeights: RankingWeights = [...weightsRef.current]
    const profileVolume = volumeRef.current
    const startedAt = readClock()
    const samples: UpdateSample[] = []

    for (let index = 0; index < PROFILE_SAMPLE_COUNT; index += 1) {
      if (readClock() - startedAt >= PROFILE_BUDGET_MS) break
      const nextWeights = WEIGHT_PROFILE[index % WEIGHT_PROFILE.length]
      weightsRef.current = nextWeights
      setWeights(nextWeights)
      const sample = await requestRanking(nextWeights, profileVolume)
      if (!sample) break
      samples.push(sample)
    }

    weightsRef.current = savedWeights
    setWeights(savedWeights)
    await requestRanking(savedWeights, profileVolume)

    if (samples.length > 0) {
      setProfile({
        volume: profileVolume,
        sampleCount: samples.length,
        p50: percentile(samples.map((sample) => sample.totalMs), 0.5),
        p95: percentile(samples.map((sample) => sample.totalMs), 0.95),
        maximum: Math.max(...samples.map((sample) => sample.totalMs)),
        averageScoreMs: average(samples.map((sample) => sample.scoreMs)),
        averageSortMs: average(samples.map((sample) => sample.sortMs)),
        averagePaintMs: average(samples.map((sample) => sample.paintMs)),
        stoppedAtBudget: samples.length < PROFILE_SAMPLE_COUNT,
      })
    }
    setIsMeasuring(false)
  }

  const selectedCandidate = useMemo<RankedCandidate | null>(
    () => response?.topCandidates.find((candidate) => candidate.id === selectedId) ?? null,
    [response, selectedId],
  )
  const normalizedWeights = useMemo(() => normalizeWeights(weights), [weights])
  const isReady = status === 'ready' && response !== null

  return (
    <section className="gpu-ranking" aria-labelledby="gpu-ranking-title">
      <header className="gpu-ranking__header">
        <div>
          <p className="gpu-ranking__eyebrow">Investigation 05 <span>/</span> CPU baseline</p>
          <h2 id="gpu-ranking-title">GPU Ranking Field</h2>
          <p className="gpu-ranking__lede">
            Change four score weights. Watch the same synthetic candidates move through the ranking.
          </p>
        </div>
        <div className="gpu-ranking__runtime" data-state={status}>
          <span className="gpu-ranking__runtime-dot" aria-hidden="true" />
          <span>{status === 'error' ? 'CPU worker unavailable' : 'CPU worker baseline'}</span>
          <code>GPU off</code>
        </div>
      </header>

      <section className="gpu-ranking__workspace" aria-label="Interactive CPU ranking demonstration">
        <div className="gpu-ranking__field-column">
          <figure className="gpu-ranking__figure">
            <figcaption className="gpu-ranking__figure-heading">
              <span>Rank field <span aria-hidden="true">/</span> {NUMBER_FORMAT.format(volume)} candidates</span>
              <span>Seed 05EED1234</span>
            </figcaption>
            <div className="gpu-ranking__plot-wrap">
              {response ? <ScoreField response={response} onPainted={handlePainted} /> : (
                <div className="gpu-ranking__loading" role="status">
                  <span className="gpu-ranking__loading-mark" aria-hidden="true" />
                  <span>{status === 'error' ? 'Ranking worker is unavailable' : 'Generating the fixed-seed field'}</span>
                </div>
              )}
              <div className="gpu-ranking__plot-legend" aria-hidden="true">
                <span><i className="gpu-ranking__legend-dot gpu-ranking__legend-dot--top" />Top 10%</span>
                <span><i className="gpu-ranking__legend-dot gpu-ranking__legend-dot--middle" />Next 20%</span>
                <span><i className="gpu-ranking__legend-dot gpu-ranking__legend-dot--rest" />Remaining candidates</span>
              </div>
            </div>
            <div className="gpu-ranking__axis-labels" aria-hidden="true">
              <span>Signal 01 mean</span>
              <span>Signal 02 mean</span>
            </div>
            <p className="gpu-ranking__figure-note">
              Each mark is one candidate. Position shows two feature groups; brightness shows its rank band.
            </p>
          </figure>

          <dl className="gpu-ranking__metrics" aria-label="Latest ranking update timings">
            <Metric label="Score" value={formatMs(latestSample?.scoreMs)} note="32 values per record" />
            <Metric label="Sort" value={formatMs(latestSample?.sortMs)} note="Stable id tie-break" />
            <Metric label="Paint" value={formatMs(latestSample?.paintMs)} note="Canvas draw" />
            <Metric label="Input to paint" value={formatMs(latestSample?.totalMs)} note="Worker through next frame" />
          </dl>
          {latestSample && latestSample.generationMs > 0 ? (
            <p className="gpu-ranking__setup-note" role="status">
              One-time setup for this volume: {formatMs(latestSample.generationMs)}. Setup is excluded from weight-update profiles.
            </p>
          ) : null}
        </div>

        <aside className="gpu-ranking__controls" aria-labelledby="gpu-ranking-controls-title">
          <div className="gpu-ranking__section-heading">
            <p className="gpu-ranking__eyebrow">Adjust the model</p>
            <h3 id="gpu-ranking-controls-title">Ranking controls</h3>
          </div>

          <label className="gpu-ranking__volume-control" htmlFor="gpu-ranking-volume">
            <span>Candidate volume</span>
            <select
              id="gpu-ranking-volume"
              value={volume}
              disabled={!isReady || isMeasuring}
              onChange={(event) => handleVolumeChange(Number(event.currentTarget.value))}
            >
              {RANKING_VOLUMES.map((option) => (
                <option key={option} value={option}>{NUMBER_FORMAT.format(option)}</option>
              ))}
            </select>
          </label>

          <fieldset className="gpu-ranking__weights" disabled={!isReady || isMeasuring}>
            <legend>Feature group weights</legend>
            {WEIGHT_GROUPS.map((group, index) => (
              <div className="gpu-ranking__weight" key={group.id}>
                <label htmlFor={`weight-${group.id}`}>
                  <span>{group.label}</span>
                  <output htmlFor={`weight-${group.id}`}>{Math.round(normalizedWeights[index] * 100)}%</output>
                </label>
                <input
                  id={`weight-${group.id}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={weights[index]}
                  onChange={(event) => handleWeightChange(index, Number(event.currentTarget.value))}
                  aria-describedby={`weight-help-${group.id}`}
                />
                <p id={`weight-help-${group.id}`}>{group.description}; scores use the normalized weight.</p>
              </div>
            ))}
          </fieldset>

          <div className="gpu-ranking__actions">
            <button
              className="gpu-ranking__measure"
              type="button"
              onClick={() => void runProfile()}
              disabled={!isReady || isMeasuring}
            >
              {isMeasuring ? 'Measuring updates…' : `Measure ${PROFILE_SAMPLE_COUNT} updates`}
            </button>
            <button
              className="gpu-ranking__reset"
              type="button"
              onClick={handleReset}
              disabled={!isReady || isMeasuring || weights.every((weight, index) => weight === DEFAULT_WEIGHTS[index])}
            >
              <RotateCcw aria-hidden="true" />
              <span>Reset weights</span>
            </button>
          </div>

          <p className="gpu-ranking__model-note" role="status" aria-live="polite">
            {errorMessage ?? (status === 'loading' ? 'Generating a deterministic 32-feature data set.' : status === 'updating' ? 'Recomputing the ranking in the CPU worker.' : `Ready. ${NUMBER_FORMAT.format(response?.volume ?? volume)} candidate records are ranked.`)}
          </p>

          <div className="gpu-ranking__top-inspector">
            <label htmlFor="gpu-ranking-top-candidates">Top 50 ranked candidates</label>
            <select
              id="gpu-ranking-top-candidates"
              size={7}
              value={selectedId ?? ''}
              disabled={!response || isMeasuring}
              onChange={(event) => setSelectedId(event.currentTarget.value)}
              data-testid="gpu-ranking-top-list"
            >
              {response?.topCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {String(candidate.rank).padStart(2, '0')}  {candidate.id}  ·  {candidate.score.toFixed(3)}
                </option>
              ))}
            </select>
            {selectedCandidate ? (
              <dl className="gpu-ranking__selected" aria-label="Selected candidate details">
                <div><dt>Rank</dt><dd>#{String(selectedCandidate.rank).padStart(2, '0')}</dd></div>
                <div><dt>Id</dt><dd>{selectedCandidate.id}</dd></div>
                <div><dt>Score</dt><dd>{selectedCandidate.score.toFixed(3)}</dd></div>
                <div className="gpu-ranking__selected-signals">
                  <dt>Group means</dt>
                  <dd>{selectedCandidate.signals.map((signal) => signal.toFixed(2)).join(' / ')}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </aside>
      </section>

      {profile ? (
        <section className="gpu-ranking__profile" aria-labelledby="gpu-ranking-profile-title" data-testid="gpu-ranking-profile">
          <div className="gpu-ranking__profile-heading">
            <p className="gpu-ranking__eyebrow">Measured in this browser</p>
            <h3 id="gpu-ranking-profile-title">{NUMBER_FORMAT.format(profile.volume)}-record profile</h3>
            <p>{profile.sampleCount} completed updates{profile.stoppedAtBudget ? ` before the ${PROFILE_BUDGET_MS} ms run guard` : ''}.</p>
          </div>
          <dl className="gpu-ranking__profile-metrics">
            <Metric label="p50" value={formatMs(profile.p50)} />
            <Metric label="p95" value={formatMs(profile.p95)} />
            <Metric label="Maximum" value={formatMs(profile.maximum)} />
            <Metric label="Average phases" value={`${profile.averageScoreMs.toFixed(1)} / ${profile.averageSortMs.toFixed(1)} / ${profile.averagePaintMs.toFixed(1)} ms`} note="Score / sort / paint" />
          </dl>
          <p className="gpu-ranking__decision" data-decision={profile.volume === 100_000 && profile.p95 > 50 ? 'over-target' : 'within-target'}>
            <strong>Decision rule</strong>
            <span>{getDecisionCopy(profile)}</span>
          </p>
        </section>
      ) : null}

      <section className="gpu-ranking__evidence" aria-labelledby="gpu-ranking-evidence-title">
        <div className="gpu-ranking__evidence-intro">
          <p className="gpu-ranking__eyebrow">Previous investigation</p>
          <h3 id="gpu-ranking-evidence-title">Rendering has a boundary. Ranking needs its own profile.</h3>
          <p>
            Candidate Field compared SVG and Canvas drawing. These numbers explain why the new page keeps rendering fixed while measuring ranking work.
          </p>
        </div>
        <div
          className="gpu-ranking__evidence-table-wrap"
          role="region"
          aria-label="Candidate Field renderer comparison"
          tabIndex={0}
        >
          <table className="gpu-ranking__evidence-table">
            <caption>Candidate Field repeated renderer-response runs, median / maximum</caption>
            <thead>
              <tr><th scope="col">Marks</th><th scope="col">SVG</th><th scope="col">Canvas 2D</th><th scope="col">Observation</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">10,000</th><td>47.0 / 47.3 ms</td><td>25.1 / 30.8 ms</td><td>Both completed</td></tr>
              <tr><th scope="row">25,000</th><td>116.6 / 117.0 ms</td><td>30.8 / 31.1 ms</td><td>SVG long tasks; max 101 ms</td></tr>
              <tr><th scope="row">100,000</th><td>Guarded above 25,000</td><td>30.9 / 31.9 ms</td><td>Canvas profile completed</td></tr>
            </tbody>
          </table>
          <p className="gpu-ranking__evidence-note">
            Three repeated runs in Chrome 152 on macOS, 1,440 × 1,000 viewport, DPR 1. Response includes a fresh mount and two animation frames, so readings near 30 ms are a timing floor. This profile did not score or sort candidates.
          </p>
        </div>
      </section>

      <section className="gpu-ranking__profile gpu-ranking__profile--recorded" aria-labelledby="gpu-ranking-recorded-profile-title">
        <div className="gpu-ranking__profile-heading">
          <p className="gpu-ranking__eyebrow">Recorded local observation</p>
          <h3 id="gpu-ranking-recorded-profile-title">The response crosses 50 ms at 50,000 records</h3>
          <p>Each profile contains 20 weight updates in the Codex in-app browser on macOS, at a 1,280 × 720 viewport. The 100,000-record profile was repeated twice. Device pixel ratio was not captured.</p>
        </div>
        <div
          className="gpu-ranking__recorded-table-wrap"
          role="region"
          aria-label="Recorded local CPU profile comparison"
          tabIndex={0}
        >
          <table className="gpu-ranking__evidence-table">
            <caption>Weight change through next painted frame; one-time setup excluded</caption>
            <thead>
              <tr><th scope="col">Records</th><th scope="col">p50</th><th scope="col">p95</th><th scope="col">Max</th><th scope="col">Avg score / sort / paint</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">1,000</th><td>11.4 ms</td><td>17.9 ms</td><td>18.2 ms</td><td>0.0 / 0.1 / 0.1 ms</td></tr>
              <tr><th scope="row">10,000</th><td>14.9 ms</td><td>23.4 ms</td><td>24.7 ms</td><td>0.3 / 1.8 / 0.9 ms</td></tr>
              <tr><th scope="row">50,000</th><td>21.9 ms</td><td>102.4 ms</td><td>106.6 ms</td><td>1.2 / 8.7 / 4.4 ms</td></tr>
              <tr><th scope="row">100,000</th><td>41.7–44.7 ms</td><td>209.3–209.8 ms</td><td>210.4–222.5 ms</td><td>2.1–4.0 / 17.1–17.4 / 9.1–9.2 ms</td></tr>
            </tbody>
          </table>
        </div>
        <p className="gpu-ranking__decision">
          <strong>Current finding</strong>
          <span>The p95 crossed 50 ms at 50,000 records, and sorting was the largest average phase. At 100,000 records, phase averages do not account for the full response tail. Profile CPU sorting and the end-to-frame delay before considering GPU scoring. These readings describe one browser session, not performance across devices.</span>
        </p>
      </section>

      <section className="gpu-ranking__decision-rule" aria-labelledby="gpu-ranking-rule-title">
        <div>
          <p className="gpu-ranking__eyebrow">What the measurements can decide</p>
          <h3 id="gpu-ranking-rule-title">GPU compute stays conditional</h3>
        </div>
        <ol>
          <li><strong>CPU p95 ≤ 50 ms at 100k</strong><span>Keep the CPU path. The measured workload does not call for GPU scoring.</span></li>
          <li><strong>Scoring dominates above 50 ms</strong><span>Compare one GPU scoring path, including transfer and readback.</span></li>
          <li><strong>Sort or paint dominates</strong><span>Improve that phase first. GPU scoring would leave it untouched.</span></li>
        </ol>
      </section>

      <footer className="gpu-ranking__footer">
        <span>CPU baseline <i aria-hidden="true" /> Synthetic seed 05EED1234</span>
        <p>The 50 ms threshold belongs to this experiment. It is not a cross-device performance guarantee.</p>
      </footer>
    </section>
  )
}

export default GpuRankingField
