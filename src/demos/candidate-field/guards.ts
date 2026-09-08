import type { CandidateFieldRenderer, CandidateFieldVolume } from './types'

export const RENDERER_VOLUME_LIMITS: Record<CandidateFieldRenderer, number> = {
  svg: 25000,
  canvas: 100000,
}

export const MEASUREMENT_TIME_BUDGET_MS = 2500

export type RendererGuard =
  | { allowed: true; limit: number }
  | { allowed: false; limit: number; reason: string }

export function getRendererGuard(
  renderer: CandidateFieldRenderer,
  volume: CandidateFieldVolume,
): RendererGuard {
  const limit = RENDERER_VOLUME_LIMITS[renderer]
  if (volume <= limit) return { allowed: true, limit }

  const rendererName = renderer === 'svg' ? 'SVG' : 'Canvas 2D'
  return {
    allowed: false,
    limit,
    reason: `${rendererName} is guarded above ${limit.toLocaleString('en-US')} candidates to protect the tab from an unresponsive render.`,
  }
}
