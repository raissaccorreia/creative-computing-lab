export type SystemState = 'nominal' | 'degraded'

export type SystemNodeId =
  | 'intake'
  | 'parser'
  | 'index'
  | 'coordinator'
  | 'output'

export type SystemNodeStatus = 'nominal' | 'attention'

export type SystemNode = {
  id: SystemNodeId
  title: string
  role: string
  summary: string
  explanation: string
  status: SystemNodeStatus
  x: number
  y: number
}

export type SystemEdge = {
  id: string
  from: SystemNodeId
  to: SystemNodeId
  label: string
  status: SystemNodeStatus
}

export type SystemSnapshot = {
  state: SystemState
  stateLabel: string
  stateSummary: string
  nodes: SystemNode[]
  edges: SystemEdge[]
}

export type SystemAnatomyRendererProps = {
  snapshot: SystemSnapshot
  selectedId: SystemNodeId | null
  onSelect: (id: SystemNodeId) => void
}
