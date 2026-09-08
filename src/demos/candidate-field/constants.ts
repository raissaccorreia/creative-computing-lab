import type { CandidateFieldState } from './types'

export const STATE_OPTIONS: Array<{
  value: CandidateFieldState
  label: string
  description: string
}> = [
  {
    value: 'initial',
    label: 'Initial',
    description: 'stable input order',
  },
  {
    value: 'filtered',
    label: 'Filtered',
    description: 'marks removed candidates',
  },
  {
    value: 'reordered',
    label: 'Reordered',
    description: 'deterministic score order',
  },
]
