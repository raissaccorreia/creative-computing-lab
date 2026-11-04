import type { RankedCandidate, RankingWeights, RankingVolume } from './model'

export type RankingRequest = {
  requestId: number
  volume: number
  weights: RankingWeights
}

export type RankingResponse =
  | {
      type: 'ranked'
      requestId: number
      volume: RankingVolume
      generationMs: number
      signalMeans: Float32Array
      rankByIndex: Uint32Array
      topCandidates: RankedCandidate[]
      scoreMs: number
      orderSetupMs: number
      sortMs: number
      rankMapMs: number
      topCandidatesMs: number
    }
  | { type: 'error'; requestId: number; message: string }
