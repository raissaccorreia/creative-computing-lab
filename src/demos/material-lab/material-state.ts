export type MaterialValues = {
  color: string
  roughness: number
  metalness: number
}

export type MaterialPreviewMode = 'pbr' | 'shader'

export const REFERENCE_MATERIAL: MaterialValues = {
  color: '#86aaa5',
  roughness: 0.34,
  metalness: 0.72,
}

export const REFERENCE_PATTERN_SCALE = 6
