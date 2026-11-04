export const RANKING_VOLUMES = [1_000, 10_000, 50_000, 100_000] as const
export type RankingVolume = (typeof RANKING_VOLUMES)[number]

export const FEATURE_GROUP_COUNT = 4
export const FEATURES_PER_GROUP = 8
export const FEATURE_COUNT = FEATURE_GROUP_COUNT * FEATURES_PER_GROUP
export const TOP_CANDIDATE_COUNT = 50

export const WEIGHT_GROUPS = [
  { id: 'signal-one', label: 'Signal 01', description: 'First feature group' },
  { id: 'signal-two', label: 'Signal 02', description: 'Second feature group' },
  { id: 'signal-three', label: 'Signal 03', description: 'Third feature group' },
  { id: 'signal-four', label: 'Signal 04', description: 'Fourth feature group' },
] as const

export type RankingWeights = readonly [number, number, number, number]
export type FeatureSignals = readonly [number, number, number, number]

export const DEFAULT_WEIGHTS: RankingWeights = [0.4, 0.3, 0.2, 0.1]

export type SyntheticDataset = {
  count: number
  features: Float32Array
}

export type RankedCandidate = {
  id: string
  rank: number
  score: number
  signals: FeatureSignals
}

export type RankingComputation = {
  signalMeans: Float32Array
  rankByIndex: Uint32Array
  topCandidates: RankedCandidate[]
  scoreMs: number
  orderSetupMs: number
  sortMs: number
  rankMapMs: number
  topCandidatesMs: number
}

export function isRankingVolume(value: number): value is RankingVolume {
  return (RANKING_VOLUMES as readonly number[]).includes(value)
}

export function normalizeWeights(weights: readonly number[]): RankingWeights {
  const bounded = DEFAULT_WEIGHTS.map((fallback, index) => {
    const value = weights[index]
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback
  })
  const total = bounded.reduce((sum, value) => sum + value, 0)

  if (total === 0) return [0.25, 0.25, 0.25, 0.25]
  return bounded.map((value) => value / total) as unknown as RankingWeights
}

export function generateSyntheticDataset(count: number): SyntheticDataset {
  const features = new Float32Array(count * FEATURE_COUNT)
  let state = 0x5eed1234

  for (let index = 0; index < features.length; index += 1) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    features[index] = (state >>> 0) / 0x1_0000_0000
  }

  return { count, features }
}

function candidateId(index: number): string {
  return `candidate-${String(index + 1).padStart(6, '0')}`
}

export function calculateRanking(
  dataset: SyntheticDataset,
  weights: readonly number[],
): RankingComputation {
  const normalizedWeights = normalizeWeights(weights)
  const scoreStartedAt = performance.now()
  const scores = new Float32Array(dataset.count)
  const signalMeans = new Float32Array(dataset.count * FEATURE_GROUP_COUNT)

  for (let candidateIndex = 0; candidateIndex < dataset.count; candidateIndex += 1) {
    const featureStart = candidateIndex * FEATURE_COUNT
    const signalStart = candidateIndex * FEATURE_GROUP_COUNT
    let score = 0

    for (let groupIndex = 0; groupIndex < FEATURE_GROUP_COUNT; groupIndex += 1) {
      const groupFeatureStart = featureStart + groupIndex * FEATURES_PER_GROUP
      let groupTotal = 0

      for (let featureIndex = 0; featureIndex < FEATURES_PER_GROUP; featureIndex += 1) {
        groupTotal += dataset.features[groupFeatureStart + featureIndex]
      }

      const groupMean = groupTotal / FEATURES_PER_GROUP
      signalMeans[signalStart + groupIndex] = groupMean
      score += groupMean * normalizedWeights[groupIndex]
    }

    scores[candidateIndex] = score
  }

  const scoreMs = performance.now() - scoreStartedAt
  const orderSetupStartedAt = performance.now()
  const rankedIndices = new Uint32Array(dataset.count)

  for (let index = 0; index < rankedIndices.length; index += 1) {
    rankedIndices[index] = index
  }

  const orderSetupMs = performance.now() - orderSetupStartedAt
  const sortStartedAt = performance.now()
  rankedIndices.sort((left, right) => {
    const scoreDifference = scores[right] - scores[left]
    return scoreDifference === 0 ? left - right : scoreDifference
  })

  const sortMs = performance.now() - sortStartedAt
  const rankMapStartedAt = performance.now()
  const rankByIndex = new Uint32Array(dataset.count)
  for (let rank = 0; rank < rankedIndices.length; rank += 1) {
    rankByIndex[rankedIndices[rank]] = rank
  }

  const rankMapMs = performance.now() - rankMapStartedAt
  const topCandidatesStartedAt = performance.now()
  const topCandidates = Array.from(
    rankedIndices.subarray(0, Math.min(TOP_CANDIDATE_COUNT, dataset.count)),
    (candidateIndex, topIndex) => {
      const signalStart = candidateIndex * FEATURE_GROUP_COUNT
      return {
        id: candidateId(candidateIndex),
        rank: topIndex + 1,
        score: scores[candidateIndex],
        signals: [
          signalMeans[signalStart],
          signalMeans[signalStart + 1],
          signalMeans[signalStart + 2],
          signalMeans[signalStart + 3],
        ] as unknown as FeatureSignals,
      }
    },
  )
  const topCandidatesMs = performance.now() - topCandidatesStartedAt

  return {
    signalMeans,
    rankByIndex,
    topCandidates,
    scoreMs,
    orderSetupMs,
    sortMs,
    rankMapMs,
    topCandidatesMs,
  }
}
