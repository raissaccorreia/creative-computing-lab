export const EXAMPLE_QUERY =
  'Introductory guide to accessible SVG, published after 2024, under 15 minutes.'

export const QUERY_TOKENS = [
  { id: 'topic', label: 'topic' },
  { id: 'level', label: 'level' },
  { id: 'recency', label: 'after 2024' },
  { id: 'limit', label: '≤15 min' },
] as const

export type ResourceLevel = 'beginner' | 'intermediate' | 'advanced'

export type Resource = {
  id: string
  title: string
  topics: string[]
  level: ResourceLevel
  publishedAt: string
  durationMinutes: number
  scores: {
    queryMatch: number
    beginnerFit: number
    recency: number
    dataQuality: number
  }
}

/** Synthetic educational resources. Not real documents or products. */
export const RESOURCES: Resource[] = [
  {
    id: 'svg-a11y-starter',
    title: 'SVG Accessibility Starter Guide',
    topics: ['svg', 'accessibility'],
    level: 'beginner',
    publishedAt: '2025-03-12',
    durationMinutes: 12,
    scores: { queryMatch: 0.96, beginnerFit: 0.95, recency: 0.9, dataQuality: 0.88 },
  },
  {
    id: 'title-desc-patterns',
    title: 'Title and Desc Patterns for Charts',
    topics: ['svg', 'accessibility', 'charts'],
    level: 'beginner',
    publishedAt: '2024-11-02',
    durationMinutes: 10,
    scores: { queryMatch: 0.9, beginnerFit: 0.92, recency: 0.82, dataQuality: 0.9 },
  },
  {
    id: 'keyboard-svg-paths',
    title: 'Keyboard Focus Around SVG Paths',
    topics: ['svg', 'accessibility', 'keyboard'],
    level: 'beginner',
    publishedAt: '2025-01-20',
    durationMinutes: 14,
    scores: { queryMatch: 0.88, beginnerFit: 0.9, recency: 0.88, dataQuality: 0.85 },
  },
  {
    id: 'reduced-motion-svg',
    title: 'Reduced Motion with SVG Interfaces',
    topics: ['svg', 'accessibility', 'motion'],
    level: 'beginner',
    publishedAt: '2024-08-18',
    durationMinutes: 11,
    scores: { queryMatch: 0.84, beginnerFit: 0.88, recency: 0.75, dataQuality: 0.86 },
  },
  {
    id: 'svg-semantics-lab',
    title: 'Semantic Roles for Decorative SVG',
    topics: ['svg', 'accessibility'],
    level: 'beginner',
    publishedAt: '2025-06-01',
    durationMinutes: 9,
    scores: { queryMatch: 0.86, beginnerFit: 0.93, recency: 0.95, dataQuality: 0.8 },
  },
  {
    id: 'contrast-vector-ui',
    title: 'Contrast Checks for Vector UI Marks',
    topics: ['svg', 'accessibility', 'contrast'],
    level: 'beginner',
    publishedAt: '2024-05-09',
    durationMinutes: 13,
    scores: { queryMatch: 0.8, beginnerFit: 0.85, recency: 0.7, dataQuality: 0.87 },
  },
  {
    id: 'old-svg-primer',
    title: 'An Older SVG Primer for Authors',
    topics: ['svg', 'accessibility'],
    level: 'beginner',
    publishedAt: '2021-04-14',
    durationMinutes: 12,
    scores: { queryMatch: 0.7, beginnerFit: 0.8, recency: 0.2, dataQuality: 0.7 },
  },
  {
    id: 'deep-svg-shaders',
    title: 'Deep Dive: SVG Filters and Shaders',
    topics: ['svg', 'graphics'],
    level: 'advanced',
    publishedAt: '2025-02-11',
    durationMinutes: 45,
    scores: { queryMatch: 0.45, beginnerFit: 0.2, recency: 0.85, dataQuality: 0.9 },
  },
  {
    id: 'canvas-hit-testing',
    title: 'Canvas Hit Testing Workshop',
    topics: ['canvas', 'interaction'],
    level: 'intermediate',
    publishedAt: '2024-09-30',
    durationMinutes: 20,
    scores: { queryMatch: 0.25, beginnerFit: 0.4, recency: 0.78, dataQuality: 0.84 },
  },
  {
    id: 'webgpu-overview',
    title: 'WebGPU Overview for Visual Labs',
    topics: ['webgpu', 'graphics'],
    level: 'advanced',
    publishedAt: '2025-04-22',
    durationMinutes: 30,
    scores: { queryMatch: 0.15, beginnerFit: 0.15, recency: 0.92, dataQuality: 0.88 },
  },
  {
    id: 'long-a11y-course',
    title: 'Full Accessibility Course for Diagrams',
    topics: ['svg', 'accessibility'],
    level: 'beginner',
    publishedAt: '2025-01-05',
    durationMinutes: 90,
    scores: { queryMatch: 0.82, beginnerFit: 0.9, recency: 0.86, dataQuality: 0.91 },
  },
  {
    id: 'icon-sprite-tips',
    title: 'Icon Sprite Tips Without Semantics',
    topics: ['svg', 'icons'],
    level: 'intermediate',
    publishedAt: '2023-12-01',
    durationMinutes: 8,
    scores: { queryMatch: 0.35, beginnerFit: 0.5, recency: 0.35, dataQuality: 0.6 },
  },
]

export const RESOURCE_BY_ID: Record<string, Resource> = Object.fromEntries(
  RESOURCES.map((resource) => [resource.id, resource]),
)
