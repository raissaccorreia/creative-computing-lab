import { RESOURCES } from '../search-flow/data'
import type { CandidateFieldItem, CandidateFieldState, CandidateFieldVolume, CandidateRecord } from './types'

const FIELD_WIDTH = 1000
const FIELD_HEIGHT = 620
const FIELD_PADDING_X = 28
const FIELD_PADDING_Y = 30

const candidateCache = new Map<CandidateFieldVolume, CandidateRecord[]>()

function sourceScore(sourceIndex: number): number {
  const resource = RESOURCES[sourceIndex % RESOURCES.length]
  const { queryMatch, beginnerFit, recency, dataQuality } = resource.scores
  return queryMatch * 0.4 + beginnerFit * 0.25 + recency * 0.2 + dataQuality * 0.15
}

function sourceIndexFor(candidateIndex: number): number {
  return candidateIndex % RESOURCES.length
}

function buildCandidates(volume: CandidateFieldVolume): CandidateRecord[] {
  const candidates: CandidateRecord[] = []

  for (let index = 0; index < volume; index += 1) {
    const sourceIndex = sourceIndexFor(index)
    const source = RESOURCES[sourceIndex]
    const variant = Math.floor(index / RESOURCES.length)
    const variantLabel = variant === 0 ? '' : ` — variant ${variant + 1}`

    candidates.push({
      id: `candidate-${String(index + 1).padStart(5, '0')}`,
      title: `${source.title}${variantLabel}`,
      topics: source.topics,
      score: Number(sourceScore(sourceIndex).toFixed(3)),
      durationMinutes: source.durationMinutes,
      sourceIndex,
    })
  }

  return candidates
}

export function getCandidates(volume: CandidateFieldVolume): CandidateRecord[] {
  const cached = candidateCache.get(volume)
  if (cached) return cached

  const candidates = buildCandidates(volume)
  candidateCache.set(volume, candidates)
  return candidates
}

function isRemoved(candidate: CandidateRecord, index: number): boolean {
  // A stable, deliberately simple rule makes filtering repeatable without a live data source.
  return candidate.score < 0.52 || index % 7 === 0
}

function getColumns(volume: CandidateFieldVolume): number {
  if (volume <= 50) return 10
  if (volume <= 250) return 20
  return 100
}

export function getPoint(index: number, volume: CandidateFieldVolume) {
  const columns = getColumns(volume)
  const rows = Math.ceil(volume / columns)
  const usableWidth = FIELD_WIDTH - FIELD_PADDING_X * 2
  const usableHeight = FIELD_HEIGHT - FIELD_PADDING_Y * 2
  const gapX = columns > 1 ? usableWidth / (columns - 1) : usableWidth
  const gapY = rows > 1 ? usableHeight / (rows - 1) : usableHeight

  return {
    x: FIELD_PADDING_X + (index % columns) * gapX,
    y: FIELD_PADDING_Y + Math.floor(index / columns) * gapY,
  }
}

export function getMarkRadius(volume: CandidateFieldVolume): number {
  if (volume <= 50) return 8
  if (volume <= 250) return 5
  if (volume <= 1000) return 3.4
  return 2.2
}

export function getFieldItems(
  volume: CandidateFieldVolume,
  state: CandidateFieldState,
): CandidateFieldItem[] {
  const candidates = getCandidates(volume)
  const ordered =
    state === 'reordered'
      ? [...candidates].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      : candidates

  return ordered.map((candidate, index) => {
    const originalIndex = Number(candidate.id.slice(-5)) - 1
    const point = getPoint(index, volume)

    return {
      ...candidate,
      removed: state === 'filtered' && isRemoved(candidate, originalIndex),
      ...point,
    }
  })
}

export function getFieldSummary(items: CandidateFieldItem[], state: CandidateFieldState): string {
  const removedCount = items.filter((item) => item.removed).length
  const stateCopy =
    state === 'initial'
      ? 'all candidates are shown in their stable input order'
      : state === 'filtered'
        ? `${removedCount} candidates are marked as filtered while their identity stays visible`
        : 'the same stable ids are shown in deterministic score order'

  return `${items.length.toLocaleString('en-US')} candidates; ${stateCopy}.`
}

export function getFieldDimensions() {
  return { width: FIELD_WIDTH, height: FIELD_HEIGHT }
}
