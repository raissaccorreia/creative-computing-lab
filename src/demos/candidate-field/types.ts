export const CANDIDATE_VOLUMES = [50, 250, 1000, 5000] as const
export const CANDIDATE_STRESS_VOLUMES = [10000, 25000, 50000, 100000] as const
export const CANDIDATE_COMPARISON_VOLUMES = [
  ...CANDIDATE_VOLUMES,
  ...CANDIDATE_STRESS_VOLUMES,
] as const

export type CandidateFieldVolume = (typeof CANDIDATE_COMPARISON_VOLUMES)[number]

export type CandidateFieldState = 'initial' | 'filtered' | 'reordered'

export type CandidateFieldRenderer = 'svg' | 'canvas'

export type CandidateRecord = {
  id: string
  title: string
  topics: string[]
  score: number
  durationMinutes: number
  sourceIndex: number
}

export type CandidateFieldItem = CandidateRecord & {
  removed: boolean
  x: number
  y: number
}

export type CandidateFieldDimensions = {
  width: number
  height: number
}

export type CandidateFieldRendererProps = {
  items: CandidateFieldItem[]
  selectedId: string | null
  radius: number
  dimensions: CandidateFieldDimensions
  summary: string
  onSelect: (id: string) => void
}

export function isCandidateFieldVolume(value: number): value is CandidateFieldVolume {
  return (CANDIDATE_COMPARISON_VOLUMES as readonly number[]).includes(value)
}
