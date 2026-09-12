import {
  CircleDot,
  GitBranch,
  Network,
  Search,
  type LucideIcon,
} from 'lucide-react'

export type LabView =
  | 'search-flow'
  | 'candidate-field'
  | 'candidate-field-comparison'
  | 'system-anatomy'

export type LabExperiment = {
  id: LabView
  label: string
  description: string
  href: string
  icon: LucideIcon
}

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'search-flow',
    label: 'Search Flow Explorer',
    description: 'Query to explained recommendations',
    href: '/',
    icon: Search,
  },
  {
    id: 'candidate-field',
    label: 'Candidate Field',
    description: 'SVG baseline for visual candidates',
    href: '/?demo=candidate-field',
    icon: CircleDot,
  },
  {
    id: 'candidate-field-comparison',
    label: 'Candidate Field Comparison',
    description: 'Bounded SVG and Canvas comparison',
    href: '/?demo=candidate-field-comparison',
    icon: GitBranch,
  },
  {
    id: 'system-anatomy',
    label: 'System Anatomy',
    description: '2D screen and 3D spatial modes',
    href: '/?demo=system-anatomy',
    icon: Network,
  },
]

export function readLabView(): LabView {
  if (typeof window === 'undefined') return 'search-flow'
  const demo = new URLSearchParams(window.location.search).get('demo')
  if (demo === 'candidate-field-comparison') return 'candidate-field-comparison'
  if (demo === 'candidate-field') return 'candidate-field'
  if (demo === 'system-anatomy') return 'system-anatomy'
  return 'search-flow'
}

export function getActiveExperiment(view: LabView) {
  return LAB_EXPERIMENTS.find((experiment) => experiment.id === view) ?? LAB_EXPERIMENTS[0]
}
