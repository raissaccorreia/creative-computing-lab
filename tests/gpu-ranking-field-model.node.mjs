import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FEATURE_COUNT,
  FEATURE_GROUP_COUNT,
  FEATURES_PER_GROUP,
  RANKING_VOLUMES,
  calculateRanking,
  generateSyntheticDataset,
  normalizeWeights,
} from '../src/demos/gpu-ranking-field/model.ts'

const featureCount = FEATURE_COUNT

test('synthetic data is repeatable and larger volumes preserve the same prefix', () => {
  const first = generateSyntheticDataset(3)
  const repeat = generateSyntheticDataset(3)
  const larger = generateSyntheticDataset(5)

  assert.deepEqual(first.features, repeat.features)
  assert.deepEqual(first.features, larger.features.subarray(0, first.features.length))
})

test('weights normalize to one and all-zero input uses equal weights', () => {
  assert.deepEqual(normalizeWeights([2, 1, 1, 0]), [1 / 3, 1 / 3, 1 / 3, 0])
  assert.deepEqual(normalizeWeights([0, 0, 0, 0]), [0.25, 0.25, 0.25, 0.25])
})

test('ranking follows weighted group means and uses id order to break ties', () => {
  const features = new Float32Array(3 * featureCount)
  for (let feature = 0; feature < 8; feature += 1) {
    features[feature] = 1
    features[featureCount + feature] = 0.5
    features[2 * featureCount + feature] = 0.5
  }

  const result = calculateRanking({ count: 3, features }, [1, 0, 0, 0])

  assert.deepEqual(Array.from(result.rankByIndex), [0, 1, 2])
  assert.deepEqual(result.topCandidates.map((candidate) => candidate.id), [
    'candidate-000001',
    'candidate-000002',
    'candidate-000003',
  ])
  assert.equal(result.topCandidates[0].score, 1)
  assert.equal(result.topCandidates[1].score, 0.5)
  assert.equal(result.topCandidates[2].score, 0.5)
})

test('changing group weights can change the ranked order', () => {
  const features = new Float32Array(2 * featureCount)
  for (let feature = 0; feature < 8; feature += 1) {
    features[feature] = 1
    features[featureCount + 8 + feature] = 1
  }

  const firstSignal = calculateRanking({ count: 2, features }, [1, 0, 0, 0])
  const secondSignal = calculateRanking({ count: 2, features }, [0, 1, 0, 0])

  assert.equal(firstSignal.topCandidates[0].id, 'candidate-000001')
  assert.equal(secondSignal.topCandidates[0].id, 'candidate-000002')
})

test('scores and stable order match a reference calculation at every supported volume', () => {
  for (const volume of RANKING_VOLUMES) {
    const dataset = generateSyntheticDataset(volume)
    const inputWeights = [0.4, 0.3, 0.2, 0.1]
    const weights = normalizeWeights(inputWeights)
    const scores = new Float32Array(volume)

    for (let candidateIndex = 0; candidateIndex < volume; candidateIndex += 1) {
      let score = 0
      for (let groupIndex = 0; groupIndex < FEATURE_GROUP_COUNT; groupIndex += 1) {
        const groupStart = candidateIndex * FEATURE_COUNT + groupIndex * FEATURES_PER_GROUP
        let groupTotal = 0
        for (let featureIndex = 0; featureIndex < FEATURES_PER_GROUP; featureIndex += 1) {
          groupTotal += dataset.features[groupStart + featureIndex]
        }
        score += (groupTotal / FEATURES_PER_GROUP) * weights[groupIndex]
      }
      scores[candidateIndex] = score
    }

    const expectedOrder = Array.from({ length: volume }, (_, index) => index)
      .sort((left, right) => scores[right] - scores[left] || left - right)
    const expectedRanks = new Uint32Array(volume)
    expectedOrder.forEach((candidateIndex, rank) => {
      expectedRanks[candidateIndex] = rank
    })
    const result = calculateRanking(dataset, inputWeights)

    assert.deepEqual(result.rankByIndex, expectedRanks, `${volume} records`)
    assert.deepEqual(
      result.topCandidates.map((candidate) => candidate.id),
      expectedOrder.slice(0, 50).map((index) => `candidate-${String(index + 1).padStart(6, '0')}`),
      `${volume} top ids`,
    )
    for (let rank = 0; rank < result.topCandidates.length; rank += 1) {
      assert.equal(result.topCandidates[rank].score, scores[expectedOrder[rank]])
    }
  }
})
