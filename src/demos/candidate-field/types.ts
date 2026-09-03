export const CANDIDATE_VOLUMES = [50, 250, 1000, 5000] as const

export type CandidateFieldVolume = (typeof CANDIDATE_VOLUMES)[number]

export type CandidateFieldState = 'initial' | 'filtered' | 'reordered'

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
