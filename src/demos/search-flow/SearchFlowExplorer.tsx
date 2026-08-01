import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { EXAMPLE_QUERY, QUERY_TOKENS, RESOURCES } from './data'
import {
  FLOW_STAGES,
  STAGE_LABELS,
  getResource,
  getScoreBreakdown,
  getSelectableIds,
  getSnapshot,
  type FlowStage,
  type StageSnapshot,
} from './model'
import './search-flow.css'

type DiagramProps = {
  snapshot: StageSnapshot
  stepIndex: number
  titleId: string
  descId: string
  selectedId: string | null
  onSelect: (id: string) => void
}

const CANDIDATE_LAYOUT_DESKTOP: Record<string, { x: number; y: number }> = {
  'svg-a11y-starter': { x: 268, y: 78 },
  'title-desc-patterns': { x: 308, y: 78 },
  'keyboard-svg-paths': { x: 348, y: 78 },
  'reduced-motion-svg': { x: 268, y: 118 },
  'svg-semantics-lab': { x: 308, y: 118 },
  'contrast-vector-ui': { x: 348, y: 118 },
  'old-svg-primer': { x: 268, y: 158 },
  'deep-svg-shaders': { x: 308, y: 158 },
  'canvas-hit-testing': { x: 348, y: 158 },
  'webgpu-overview': { x: 278, y: 188 },
  'long-a11y-course': { x: 318, y: 188 },
  'icon-sprite-tips': { x: 358, y: 188 },
}

const CANDIDATE_LAYOUT_MOBILE: Record<string, { x: number; y: number }> = {
  'svg-a11y-starter': { x: 55, y: 250 },
  'title-desc-patterns': { x: 100, y: 250 },
  'keyboard-svg-paths': { x: 145, y: 250 },
  'reduced-motion-svg': { x: 190, y: 250 },
  'svg-semantics-lab': { x: 235, y: 250 },
  'contrast-vector-ui': { x: 280, y: 250 },
  'old-svg-primer': { x: 55, y: 295 },
  'deep-svg-shaders': { x: 100, y: 295 },
  'canvas-hit-testing': { x: 145, y: 295 },
  'webgpu-overview': { x: 190, y: 295 },
  'long-a11y-course': { x: 235, y: 295 },
  'icon-sprite-tips': { x: 280, y: 295 },
}

function ArrowMarker({ id }: { id: string }) {
  return (
    <marker
      id={id}
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <path d="M0 0 L8 4 L0 8 Z" className="flow-arrow-head" />
    </marker>
  )
}

function RemovedPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width="6"
      height="6"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <line x1="0" y1="0" x2="0" y2="6" className="flow-hatch-line" />
    </pattern>
  )
}

function stageClass(stage: FlowStage, current: FlowStage): string {
  return stage === current ? 'flow-stage flow-stage--current' : 'flow-stage'
}

type ResourceFocusShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx: number }

function ResourceInteraction({
  id,
  interactive,
  selected,
  onSelect,
  focusShape,
  children,
}: {
  id: string
  interactive: boolean
  selected: boolean
  onSelect: (id: string) => void
  focusShape: ResourceFocusShape
  children: ReactNode
}) {
  if (!interactive) {
    return <>{children}</>
  }

  const resource = getResource(id)
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(id)
  }

  const rings =
    focusShape.type === 'circle' ? (
      <>
        <circle
          cx={focusShape.cx}
          cy={focusShape.cy}
          r={focusShape.r + 4}
          className="flow-resource-selection-ring"
        />
        <circle
          cx={focusShape.cx}
          cy={focusShape.cy}
          r={focusShape.r + 6}
          className="flow-resource-focus-ring"
        />
      </>
    ) : (
      <>
        <rect
          x={focusShape.x - 3}
          y={focusShape.y - 3}
          width={focusShape.width + 6}
          height={focusShape.height + 6}
          rx={focusShape.rx + 1}
          className="flow-resource-selection-ring"
        />
        <rect
          x={focusShape.x - 5}
          y={focusShape.y - 5}
          width={focusShape.width + 10}
          height={focusShape.height + 10}
          rx={focusShape.rx + 2}
          className="flow-resource-focus-ring"
        />
      </>
    )

  return (
    <g
      className={`flow-resource-mark${selected ? ' flow-resource-mark--selected' : ''}`}
      data-resource-id={id}
      role="button"
      tabIndex={0}
      aria-label={`Select ${resource.title}`}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
    >
      {children}
      {rings}
    </g>
  )
}

function NodeMark({
  cx,
  cy,
  r,
  removed,
  hatchId,
}: {
  cx: number
  cy: number
  r: number
  removed: boolean
  hatchId: string
}) {
  if (!removed) {
    return <circle cx={cx} cy={cy} r={r} className="flow-node" />
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className="flow-node flow-node--removed" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${hatchId})`} className="flow-node-hatch" />
      <line
        x1={cx - r * 0.7}
        y1={cy - r * 0.7}
        x2={cx + r * 0.7}
        y2={cy + r * 0.7}
        className="flow-node-strike"
      />
    </g>
  )
}

function diagramTitle(snapshot: StageSnapshot, stepIndex: number): string {
  return `Search flow diagram, step ${stepIndex + 1} of 5: ${snapshot.label}`
}

function diagramDesc(snapshot: StageSnapshot): string {
  return snapshot.summary
}

function DesktopDiagram({
  snapshot,
  stepIndex,
  titleId,
  descId,
  selectedId,
  onSelect,
}: DiagramProps) {
  const current = snapshot.stage
  const showCandidates =
    current === 'candidates' ||
    current === 'filters' ||
    current === 'ranking' ||
    current === 'recommendations'
  const showFilters = current === 'filters'
  const showRanking = current === 'ranking' || current === 'recommendations'
  const showRecommendations = current === 'recommendations'

  const nodesForCandidates =
    current === 'candidates' || current === 'filters'
      ? snapshot.visibleIds
      : showCandidates
        ? snapshot.orderedIds
        : []

  return (
    <svg
      className="flow-diagram flow-diagram--desktop"
      viewBox="0 0 1040 300"
      role="group"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>{diagramTitle(snapshot, stepIndex)}</title>
      <desc id={descId}>{diagramDesc(snapshot)}</desc>
      <defs>
        <ArrowMarker id="flow-arrow-h" />
        <RemovedPattern id="flow-hatch-h" />
      </defs>

      <g className={stageClass('query', current)} data-stage="Query">
        <text x="20" y="28" className="flow-stage-label">
          Query
        </text>
        <rect x="20" y="48" width="160" height="100" rx="4" className="flow-panel" />
        <text x="32" y="72" className="flow-query-line">
          Introductory guide to
        </text>
        <text x="32" y="92" className="flow-query-line">
          accessible SVG…
        </text>
        {QUERY_TOKENS.slice(0, 3).map((token, index) => (
          <g key={token.id}>
            <rect
              x={32 + index * 48}
              y={108}
              width={44}
              height={18}
              rx={2}
              className="flow-token"
            />
            <text
              x={54 + index * 48}
              y={121}
              textAnchor="middle"
              className="flow-token-text"
            >
              {token.id === 'recency' ? 'recency' : token.label}
            </text>
          </g>
        ))}
      </g>

      <path d="M190 98 H230" className="flow-connector" markerEnd="url(#flow-arrow-h)" />

      <g className={stageClass('candidates', current)} data-stage="Candidates">
        <text x="240" y="28" className="flow-stage-label">
          Candidates
        </text>
        <rect x="240" y="48" width="160" height="200" rx="4" className="flow-panel" />
        {showCandidates
          ? nodesForCandidates.map((id) => {
              const pos = CANDIDATE_LAYOUT_DESKTOP[id]
              if (!pos) return null
              const removed =
                current === 'filters' && Boolean(snapshot.removedReasons[id])
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'candidates'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{ type: 'circle', cx: pos.x, cy: pos.y, r: 9 }}
                >
                  <NodeMark
                    cx={pos.x}
                    cy={pos.y}
                    r={9}
                    removed={removed}
                    hatchId="flow-hatch-h"
                  />
                </ResourceInteraction>
              )
            })
          : (
            <text x="320" y="140" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>

      <path d="M410 148 H450" className="flow-connector" markerEnd="url(#flow-arrow-h)" />

      <g className={stageClass('filters', current)} data-stage="Filters">
        <text x="460" y="28" className="flow-stage-label">
          Filters
        </text>
        <rect x="460" y="48" width="160" height="200" rx="4" className="flow-panel" />
        <path
          d="M490 70 L530 70 L555 148 L530 226 L490 226 Z"
          className="flow-gate"
        />
        {showFilters
          ? snapshot.visibleIds.map((id, index) => {
              const removed = Boolean(snapshot.removedReasons[id])
              const col = index % 3
              const row = Math.floor(index / 3)
              const cx = removed ? 560 + col * 18 : 500 + (col % 2) * 18
              const cy = 88 + row * 28
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'filters'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{ type: 'circle', cx, cy, r: 8 }}
                >
                  <NodeMark
                    cx={cx}
                    cy={cy}
                    r={8}
                    removed={removed}
                    hatchId="flow-hatch-h"
                  />
                </ResourceInteraction>
              )
            })
          : (
            <text x="540" y="148" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>

      <path d="M630 148 H670" className="flow-connector" markerEnd="url(#flow-arrow-h)" />

      <g className={stageClass('ranking', current)} data-stage="Ranking">
        <text x="680" y="28" className="flow-stage-label">
          Ranking
        </text>
        <rect x="680" y="48" width="150" height="200" rx="4" className="flow-panel" />
        {showRanking
          ? snapshot.orderedIds.map((id, index) => {
              const y = 68 + index * 30
              const width = 110 - index * 14
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'ranking'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{
                    type: 'rect',
                    x: 712,
                    y,
                    width: Math.max(36, width),
                    height: 20,
                    rx: 2,
                  }}
                >
                  <text x="696" y={y + 14} className="flow-rank-index">
                    {index + 1}
                  </text>
                  <rect
                    x="712"
                    y={y}
                    width={Math.max(36, width)}
                    height="20"
                    rx="2"
                    className="flow-rank-bar"
                  />
                </ResourceInteraction>
              )
            })
          : (
            <text x="755" y="148" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>

      <path d="M840 148 H880" className="flow-connector" markerEnd="url(#flow-arrow-h)" />

      <g
        className={stageClass('recommendations', current)}
        data-stage="Recommendations"
      >
        <text x="890" y="28" className="flow-stage-label">
          Recommendations
        </text>
        <rect x="890" y="48" width="130" height="200" rx="4" className="flow-panel" />
        {showRecommendations
          ? snapshot.highlightedIds.map((id, index) => {
              const resource = getResource(id)
              const y = 68 + index * 44
              const primary = index === 0
              const short = resource.title.split(' ').slice(0, 2).join(' ')
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'recommendations'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{
                    type: 'rect',
                    x: 908,
                    y,
                    width: 94,
                    height: primary ? 36 : 28,
                    rx: 3,
                  }}
                >
                  <rect
                    x="908"
                    y={y}
                    width="94"
                    height={primary ? 36 : 28}
                    rx="3"
                    className={primary ? 'flow-rec flow-rec--primary' : 'flow-rec'}
                  />
                  <text
                    x="955"
                    y={y + (primary ? 22 : 18)}
                    textAnchor="middle"
                    className="flow-rec-label"
                  >
                    {short.length > 12 ? `${short.slice(0, 11)}…` : short}
                  </text>
                </ResourceInteraction>
              )
            })
          : (
            <text x="955" y="148" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>
    </svg>
  )
}

function MobileDiagram({
  snapshot,
  stepIndex,
  titleId,
  descId,
  selectedId,
  onSelect,
}: DiagramProps) {
  const current = snapshot.stage
  const showCandidates =
    current === 'candidates' ||
    current === 'filters' ||
    current === 'ranking' ||
    current === 'recommendations'
  const showFilters = current === 'filters'
  const showRanking = current === 'ranking' || current === 'recommendations'
  const showRecommendations = current === 'recommendations'

  const nodesForCandidates =
    current === 'candidates' || current === 'filters'
      ? snapshot.visibleIds
      : showCandidates
        ? snapshot.orderedIds
        : []

  return (
    <svg
      className="flow-diagram flow-diagram--mobile"
      viewBox="0 0 320 1040"
      role="group"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>{diagramTitle(snapshot, stepIndex)}</title>
      <desc id={descId}>{diagramDesc(snapshot)}</desc>
      <defs>
        <ArrowMarker id="flow-arrow-v" />
        <RemovedPattern id="flow-hatch-v" />
      </defs>

      <g className={stageClass('query', current)} data-stage="Query">
        <text x="20" y="28" className="flow-stage-label">
          Query
        </text>
        <rect x="20" y="44" width="280" height="100" rx="4" className="flow-panel" />
        <text x="36" y="72" className="flow-query-line">
          Introductory guide to
        </text>
        <text x="36" y="92" className="flow-query-line">
          accessible SVG…
        </text>
        {QUERY_TOKENS.slice(0, 3).map((token, index) => (
          <g key={token.id}>
            <rect
              x={36 + index * 56}
              y={108}
              width={52}
              height={18}
              rx={2}
              className="flow-token"
            />
            <text
              x={62 + index * 56}
              y={121}
              textAnchor="middle"
              className="flow-token-text"
            >
              {token.label.length > 9 ? token.label.slice(0, 8) : token.label}
            </text>
          </g>
        ))}
      </g>

      <path d="M160 154 V178" className="flow-connector" markerEnd="url(#flow-arrow-v)" />

      <g className={stageClass('candidates', current)} data-stage="Candidates">
        <text x="20" y="204" className="flow-stage-label">
          Candidates
        </text>
        <rect x="20" y="220" width="280" height="120" rx="4" className="flow-panel" />
        {showCandidates
          ? nodesForCandidates.map((id) => {
              const pos = CANDIDATE_LAYOUT_MOBILE[id]
              if (!pos) return null
              const removed =
                current === 'filters' && Boolean(snapshot.removedReasons[id])
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'candidates'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{ type: 'circle', cx: pos.x, cy: pos.y, r: 9 }}
                >
                  <NodeMark
                    cx={pos.x}
                    cy={pos.y}
                    r={9}
                    removed={removed}
                    hatchId="flow-hatch-v"
                  />
                </ResourceInteraction>
              )
            })
          : (
            <text x="160" y="285" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>

      <path d="M160 350 V374" className="flow-connector" markerEnd="url(#flow-arrow-v)" />

      <g className={stageClass('filters', current)} data-stage="Filters">
        <text x="20" y="400" className="flow-stage-label">
          Filters
        </text>
        <rect x="20" y="416" width="280" height="140" rx="4" className="flow-panel" />
        <path
          d="M50 440 L110 440 L140 486 L110 532 L50 532 Z"
          className="flow-gate"
        />
        {showFilters
          ? snapshot.visibleIds.map((id, index) => {
              const removed = Boolean(snapshot.removedReasons[id])
              const col = index % 4
              const row = Math.floor(index / 4)
              const cx = removed ? 180 + col * 30 : 70 + (col % 2) * 28
              const cy = 455 + row * 28
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'filters'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{ type: 'circle', cx, cy, r: 8 }}
                >
                  <NodeMark
                    cx={cx}
                    cy={cy}
                    r={8}
                    removed={removed}
                    hatchId="flow-hatch-v"
                  />
                </ResourceInteraction>
              )
            })
          : (
            <text x="160" y="490" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>

      <path d="M160 566 V590" className="flow-connector" markerEnd="url(#flow-arrow-v)" />

      <g className={stageClass('ranking', current)} data-stage="Ranking">
        <text x="20" y="616" className="flow-stage-label">
          Ranking
        </text>
        <rect x="20" y="632" width="280" height="196" rx="4" className="flow-panel" />
        {showRanking
          ? snapshot.orderedIds.map((id, index) => {
              const y = 648 + index * 28
              const width = 220 - index * 28
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'ranking'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{
                    type: 'rect',
                    x: 56,
                    y,
                    width: Math.max(48, width),
                    height: 20,
                    rx: 2,
                  }}
                >
                  <text x="36" y={y + 14} className="flow-rank-index">
                    {index + 1}
                  </text>
                  <rect
                    x="56"
                    y={y}
                    width={Math.max(48, width)}
                    height="20"
                    rx="2"
                    className="flow-rank-bar"
                  />
                </ResourceInteraction>
              )
            })
          : (
            <text x="160" y="705" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>

      <path d="M160 830 V854" className="flow-connector" markerEnd="url(#flow-arrow-v)" />

      <g
        className={stageClass('recommendations', current)}
        data-stage="Recommendations"
      >
        <text x="20" y="880" className="flow-stage-label">
          Recommendations
        </text>
        <rect x="20" y="896" width="280" height="110" rx="4" className="flow-panel" />
        {showRecommendations
          ? snapshot.highlightedIds.map((id, index) => {
              const resource = getResource(id)
              const primary = index === 0
              if (primary) {
                return (
                  <ResourceInteraction
                    key={id}
                    id={id}
                    interactive={current === 'recommendations'}
                    selected={selectedId === id}
                    onSelect={onSelect}
                    focusShape={{
                      type: 'rect',
                      x: 40,
                      y: 914,
                      width: 240,
                      height: 32,
                      rx: 3,
                    }}
                  >
                    <rect
                      x="40"
                      y="914"
                      width="240"
                      height="32"
                      rx="3"
                      className="flow-rec flow-rec--primary"
                    />
                    <text x="160" y="935" textAnchor="middle" className="flow-rec-label">
                      {resource.title.length > 34
                        ? `${resource.title.slice(0, 33)}…`
                        : resource.title}
                    </text>
                  </ResourceInteraction>
                )
              }
              const x = index === 1 ? 40 : 168
              return (
                <ResourceInteraction
                  key={id}
                  id={id}
                  interactive={current === 'recommendations'}
                  selected={selectedId === id}
                  onSelect={onSelect}
                  focusShape={{
                    type: 'rect',
                    x,
                    y: 954,
                    width: 112,
                    height: 28,
                    rx: 3,
                  }}
                >
                  <rect x={x} y="954" width="112" height="28" rx="3" className="flow-rec" />
                  <text
                    x={x + 56}
                    y="973"
                    textAnchor="middle"
                    className="flow-rec-label"
                  >
                    {resource.title.split(' ').slice(0, 2).join(' ')}
                  </text>
                </ResourceInteraction>
              )
            })
          : (
            <text x="160" y="953" textAnchor="middle" className="flow-empty-hint">
              waiting
            </text>
          )}
      </g>
    </svg>
  )
}

const PUBLISHED_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

function formatPublishedDate(publishedAt: string): string {
  return PUBLISHED_DATE_FORMATTER.format(new Date(`${publishedAt}T00:00:00Z`))
}

function formatScore(value: number): string {
  return `${Math.round(value * 100)}%`
}

function ResourceDetails({
  stage,
  snapshot,
  selectedId,
}: {
  stage: FlowStage
  snapshot: StageSnapshot
  selectedId: string | null
}) {
  const resource = selectedId ? getResource(selectedId) : null
  const rankingSnapshot = getSnapshot('ranking')
  const rankPosition = resource
    ? rankingSnapshot.orderedIds.indexOf(resource.id) + 1
    : 0
  const score = resource ? getScoreBreakdown(resource) : null
  const removalReason = resource ? snapshot.removedReasons[resource.id] : undefined

  return (
    <aside className="search-flow__details" aria-labelledby="resource-details-heading">
      <h3 id="resource-details-heading">Resource details</h3>
      {!resource ? (
        <p className="search-flow__details-empty" data-testid="resource-details-empty">
          Select a resource in the active stage to inspect its data and explanation.
        </p>
      ) : (
        <div data-testid="resource-details-content">
          <p className="search-flow__details-stage">{STAGE_LABELS[stage]}</p>
          <h4 data-testid="selected-resource-title">{resource.title}</h4>
          <dl className="search-flow__metadata">
            <div>
              <dt>Topics</dt>
              <dd>{resource.topics.join(', ')}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{resource.level}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{formatPublishedDate(resource.publishedAt)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{resource.durationMinutes} minutes</dd>
            </div>
          </dl>

          <p className="search-flow__details-label">Stage explanation</p>
          <p data-testid="resource-explanation">
            {stage === 'candidates'
              ? 'This resource is included in the broad initial synthetic pool before hard constraints are applied.'
              : stage === 'filters'
                ? removalReason
                  ? `Removed: ${removalReason}.`
                  : 'Kept: this resource meets the topic, publication date, duration, and level constraints.'
                : stage === 'ranking'
                  ? `Position ${rankPosition} of ${rankingSnapshot.orderedIds.length} in a simulated deterministic ranking.`
                  : stage === 'recommendations'
                    ? `${snapshot.recommendationNotes[resource.id]} This is one explained option, not an absolute answer.`
                    : 'The query stage has no selectable resources.'}
          </p>

          {stage === 'ranking' || stage === 'recommendations' ? (
            <div className="search-flow__score" data-testid="resource-score">
              <p className="search-flow__details-label">Simulated score</p>
              <p>
                Total: <strong>{score ? score.total.toFixed(3) : '—'}</strong>
              </p>
              <ul>
                <li>Query match × 0.40: {score ? formatScore(score.queryMatch) : '—'}</li>
                <li>Beginner fit × 0.25: {score ? formatScore(score.beginnerFit) : '—'}</li>
                <li>Recency × 0.20: {score ? formatScore(score.recency) : '—'}</li>
                <li>Data quality × 0.15: {score ? formatScore(score.dataQuality) : '—'}</li>
              </ul>
              <p className="search-flow__details-note">
                The score is deterministic simulation data, not a live ranking engine.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  )
}

export function SearchFlowExplorer() {
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stage = FLOW_STAGES[stepIndex]!
  const snapshot = getSnapshot(stage)
  const selectableIds = getSelectableIds(stage)
  const effectiveSelectedId = selectedId && selectableIds.includes(selectedId) ? selectedId : null
  const stepNumber = stepIndex + 1
  const totalSteps = FLOW_STAGES.length
  const liveMessage = `Step ${stepNumber} of ${totalSteps}: ${snapshot.label}. ${snapshot.summary}`
  const selectionMessage = effectiveSelectedId
    ? `${getResource(effectiveSelectedId).title} selected.`
    : 'No resource selected in the active stage.'

  const goToStep = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(totalSteps - 1, nextIndex))
    const nextStage = FLOW_STAGES[boundedIndex]!
    setStepIndex(boundedIndex)
    setSelectedId((currentId) =>
      currentId && getSelectableIds(nextStage).includes(currentId) ? currentId : null,
    )
  }

  const handleSelect = (id: string) => {
    if (!selectableIds.includes(id)) return
    setSelectedId(id)
  }

  return (
    <section className="search-flow" aria-labelledby="search-flow-heading">
      <header className="search-flow__header">
        <h2 id="search-flow-heading">Search Flow Explorer</h2>
        <p className="search-flow__lede">
          A data-driven diagram of how a query becomes a small set of explained
          recommendations. Phase C uses synthetic resources and deterministic
          snapshots with accessible resource inspection—still without motion.
        </p>
        <p className="search-flow__query">
          <span className="search-flow__query-label">Example query</span>
          <q>{EXAMPLE_QUERY}</q>
        </p>
      </header>

      <div className="search-flow__controls" role="group" aria-label="Stage navigation">
        <button
          type="button"
          className="search-flow__nav-button"
          onClick={() => goToStep(stepIndex - 1)}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <p className="search-flow__step">
          <span className="search-flow__step-count">
            {stepNumber} of {totalSteps}
          </span>
          <span className="search-flow__step-name">{snapshot.label}</span>
        </p>
        <button
          type="button"
          className="search-flow__nav-button"
          onClick={() => goToStep(stepIndex + 1)}
          disabled={stepIndex === totalSteps - 1}
        >
          Next
        </button>
      </div>

      <p className="search-flow__live" aria-live="polite">
        {liveMessage}
      </p>
      <p className="search-flow__selection-live" aria-live="polite">
        {selectionMessage}
      </p>

      <div className="search-flow__visual-layout">
        <div className="search-flow__diagram" data-testid="search-flow-diagram">
          <DesktopDiagram
            snapshot={snapshot}
            stepIndex={stepIndex}
            titleId="flow-desktop-title"
            descId="flow-desktop-desc"
            selectedId={effectiveSelectedId}
            onSelect={handleSelect}
          />
          <MobileDiagram
            snapshot={snapshot}
            stepIndex={stepIndex}
            titleId="flow-mobile-title"
            descId="flow-mobile-desc"
            selectedId={effectiveSelectedId}
            onSelect={handleSelect}
          />
        </div>
        <ResourceDetails
          stage={stage}
          snapshot={snapshot}
          selectedId={effectiveSelectedId}
        />
      </div>

      <div className="search-flow__equivalent">
        <h3>Textual equivalent</h3>
        <p className="search-flow__equivalent-current">{snapshot.equivalent}</p>
        {snapshot.stage === 'filters' ? (
          <ul className="search-flow__reasons" data-testid="filter-reasons">
            {Object.entries(snapshot.removedReasons).map(([id, reason]) => (
              <li key={id}>
                <strong>{getResource(id).title}:</strong> {reason}
              </li>
            ))}
          </ul>
        ) : null}
        {snapshot.stage === 'recommendations' ? (
          <ul className="search-flow__reasons" data-testid="recommendation-notes">
            {snapshot.highlightedIds.map((id) => (
              <li key={id}>
                <strong>{getResource(id).title}:</strong>{' '}
                {snapshot.recommendationNotes[id]}
              </li>
            ))}
          </ul>
        ) : null}
        {snapshot.stage === 'candidates' ? (
          <p data-testid="candidate-count">
            Showing {RESOURCES.length} synthetic candidates.
          </p>
        ) : null}
        {snapshot.stage === 'ranking' ? (
          <ol className="search-flow__reasons" data-testid="ranking-order">
            {snapshot.orderedIds.map((id) => (
              <li key={id}>{getResource(id).title}</li>
            ))}
          </ol>
        ) : null}
        <ol className="search-flow__pipeline">
          {FLOW_STAGES.map((flowStage) => (
            <li
              key={flowStage}
              aria-current={flowStage === stage ? 'step' : undefined}
            >
              <strong>{STAGE_LABELS[flowStage]}.</strong>{' '}
              {getSnapshot(flowStage).equivalent}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default SearchFlowExplorer
