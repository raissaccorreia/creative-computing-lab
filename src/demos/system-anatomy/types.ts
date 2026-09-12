export type SystemAnatomyState = 'steady' | 'degraded' | 'recovering'

export type SystemAnatomyNodeKind = 'input' | 'process' | 'store' | 'output'

export type SystemAnatomyStatus = 'healthy' | 'attention' | 'blocked' | 'recovering'

export type SystemAnatomyNode = {
  id: string
  label: string
  kind: SystemAnatomyNodeKind
  description: string
  screenPosition: { x: number; y: number }
  spatialPosition: [number, number, number]
  status: SystemAnatomyStatus
  statusLabel: string
  explanation: string
}
export type SystemAnatomyEdge = {
  id: string
  from: string
  to: string
  label: string
}

export type SystemAnatomySnapshot = {
  id: SystemAnatomyState
  label: string
  description: string
  nodes: SystemAnatomyNode[]
  edges: SystemAnatomyEdge[]
}

export type SystemAnatomyRendererProps = {
  snapshot: SystemAnatomySnapshot
  selectedId: string | null
  onSelect: (id: string) => void
}
