import { RESOURCE_BY_ID, RESOURCES, type Resource } from './data'

export type FlowStage =
  | 'query'
  | 'candidates'
  | 'filters'
  | 'ranking'
  | 'recommendations'

export type StageSnapshot = {
  stage: FlowStage
  label: string
  summary: string
  visibleIds: string[]
  orderedIds: string[]
  removedReasons: Record<string, string>
  highlightedIds: string[]
  recommendationNotes: Record<string, string>
  equivalent: string
}

export const FLOW_STAGES: FlowStage[] = [
  'query',
  'candidates',
  'filters',
  'ranking',
  'recommendations',
]

export const STAGE_LABELS: Record<FlowStage, string> = {
  query: 'Query',
  candidates: 'Candidates',
  filters: 'Filters',
  ranking: 'Ranking',
  recommendations: 'Recommendations',
}

export type ScoreBreakdown = {
  queryMatch: number
  beginnerFit: number
  recency: number
  dataQuality: number
  total: number
}

export function getScoreBreakdown(resource: Resource): ScoreBreakdown {
  const { queryMatch, beginnerFit, recency, dataQuality } = resource.scores
  return {
    queryMatch,
    beginnerFit,
    recency,
    dataQuality,
    total: queryMatch * 0.4 + beginnerFit * 0.25 + recency * 0.2 + dataQuality * 0.15,
  }
}

function totalScore(resource: Resource): number {
  return getScoreBreakdown(resource).total
}

const ALL_IDS = RESOURCES.map((resource) => resource.id)

const REMOVED_REASONS: Record<string, string> = {
  'old-svg-primer': 'Published before 2024',
  'deep-svg-shaders': 'Duration exceeds 15 minutes',
  'canvas-hit-testing': 'Topic is Canvas, not SVG accessibility',
  'webgpu-overview': 'Topic is WebGPU, not SVG accessibility',
  'long-a11y-course': 'Duration exceeds 15 minutes',
  'icon-sprite-tips': 'Level and focus are not introductory SVG accessibility',
}

const KEPT_IDS = ALL_IDS.filter((id) => !(id in REMOVED_REASONS))

const RANKED_IDS = [...KEPT_IDS].sort(
  (a, b) => totalScore(RESOURCE_BY_ID[b]!) - totalScore(RESOURCE_BY_ID[a]!),
)

const RECOMMENDED_IDS = RANKED_IDS.slice(0, 3)

const RECOMMENDATION_NOTES: Record<string, string> = {
  'svg-a11y-starter':
    'Best balance of topic match, beginner fit, and short duration',
  'title-desc-patterns': 'Strong practical patterns for accessible SVG text',
  'svg-semantics-lab': 'Most recent short guide on semantic SVG roles',
}

export const STAGE_SNAPSHOTS: Record<FlowStage, StageSnapshot> = {
  query: {
    stage: 'query',
    label: 'Query',
    summary:
      'The query is interpreted as topic, level, recency, and duration constraints.',
    visibleIds: [],
    orderedIds: [],
    removedReasons: {},
    highlightedIds: [],
    recommendationNotes: {},
    equivalent:
      'The query is interpreted as meaning plus constraints: an introductory SVG accessibility guide, published after 2024, under 15 minutes.',
  },
  candidates: {
    stage: 'candidates',
    label: 'Candidates',
    summary: `Twelve synthetic educational resources are gathered as candidates (${ALL_IDS.length} items).`,
    visibleIds: ALL_IDS,
    orderedIds: ALL_IDS,
    removedReasons: {},
    highlightedIds: [],
    recommendationNotes: {},
    equivalent:
      'A broader set of twelve synthetic educational resources is gathered before hard constraints are applied.',
  },
  filters: {
    stage: 'filters',
    label: 'Filters',
    summary: `${Object.keys(REMOVED_REASONS).length} resources are removed by hard constraints; ${KEPT_IDS.length} remain.`,
    visibleIds: ALL_IDS,
    orderedIds: KEPT_IDS,
    removedReasons: REMOVED_REASONS,
    highlightedIds: [],
    recommendationNotes: {},
    equivalent:
      'Hard constraints remove incompatible items (wrong topic, pre-2024 publication, duration over 15 minutes, or unsuitable level). Removed items stay visible with reasons.',
  },
  ranking: {
    stage: 'ranking',
    label: 'Ranking',
    summary: `The ${KEPT_IDS.length} remaining resources are ordered by a deterministic relevance score.`,
    visibleIds: KEPT_IDS,
    orderedIds: RANKED_IDS,
    removedReasons: {},
    highlightedIds: [],
    recommendationNotes: {},
    equivalent:
      'Remaining items are ordered by a deterministic score combining query match, beginner fit, recency, and data quality. No live ranking engine is used.',
  },
  recommendations: {
    stage: 'recommendations',
    label: 'Recommendations',
    summary:
      'Three options are highlighted with short explanations—not a single absolute answer.',
    visibleIds: KEPT_IDS,
    orderedIds: RANKED_IDS,
    removedReasons: {},
    highlightedIds: RECOMMENDED_IDS,
    recommendationNotes: RECOMMENDATION_NOTES,
    equivalent:
      'A few recommendations are presented with brief explanations. The top option is emphasized moderately; alternatives remain visible.',
  },
}

export function getSnapshot(stage: FlowStage): StageSnapshot {
  return STAGE_SNAPSHOTS[stage]
}

export function getSelectableIds(stage: FlowStage): string[] {
  switch (stage) {
    case 'query':
      return []
    case 'candidates':
      return STAGE_SNAPSHOTS.candidates.visibleIds
    case 'filters':
      return STAGE_SNAPSHOTS.filters.visibleIds
    case 'ranking':
      return STAGE_SNAPSHOTS.ranking.orderedIds
    case 'recommendations':
      return STAGE_SNAPSHOTS.recommendations.highlightedIds
  }
}

export function getResource(id: string): Resource {
  const resource = RESOURCE_BY_ID[id]
  if (!resource) {
    throw new Error(`Unknown resource id: ${id}`)
  }
  return resource
}
