import {
  calculateRanking,
  generateSyntheticDataset,
  isRankingVolume,
} from './model'
import type { RankingRequest, RankingResponse } from './worker-protocol'

type RankingWorkerScope = {
  onmessage: ((event: MessageEvent<RankingRequest>) => void) | null
  postMessage: (message: RankingResponse, transfer: Transferable[]) => void
}

const workerScope = self as unknown as RankingWorkerScope
let cachedDataset: ReturnType<typeof generateSyntheticDataset> | null = null

workerScope.onmessage = (event) => {
  const { requestId, volume, weights } = event.data

  try {
    if (!isRankingVolume(volume)) throw new Error('Choose one of the supported candidate volumes.')

    let generationMs = 0
    if (!cachedDataset || cachedDataset.count !== volume) {
      const generationStartedAt = performance.now()
      cachedDataset = generateSyntheticDataset(volume)
      generationMs = performance.now() - generationStartedAt
    }

    const computation = calculateRanking(cachedDataset, weights)
    const response: RankingResponse = {
      type: 'ranked',
      requestId,
      volume,
      generationMs,
      signalMeans: computation.signalMeans,
      rankByIndex: computation.rankByIndex,
      topCandidates: computation.topCandidates,
      scoreMs: computation.scoreMs,
      sortMs: computation.sortMs,
    }

    workerScope.postMessage(response, [computation.signalMeans.buffer, computation.rankByIndex.buffer])
  } catch (error) {
    workerScope.postMessage(
      {
        type: 'error',
        requestId,
        message: error instanceof Error ? error.message : 'The ranking update failed.',
      },
      [],
    )
  }
}
