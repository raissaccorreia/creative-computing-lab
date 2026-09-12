import type {
  SystemEdge,
  SystemNode,
  SystemNodeId,
  SystemSnapshot,
  SystemState,
} from './types'

const NODE_POSITIONS: Record<SystemNodeId, { x: number; y: number }> = {
  intake: { x: 92, y: 215 },
  parser: { x: 286, y: 105 },
  index: { x: 286, y: 325 },
  coordinator: { x: 512, y: 215 },
  output: { x: 710, y: 215 },
}

const NODE_DEFINITIONS: Record<
  SystemNodeId,
  Pick<SystemNode, 'title' | 'role' | 'summary' | 'explanation'>
> = {
  intake: {
    title: 'Intake',
    role: 'Accepts a request',
    summary: 'A request enters the system.',
    explanation:
      'Intake is the stable boundary where a request becomes an inspectable system event.',
  },
  parser: {
    title: 'Parser',
    role: 'Normalizes structure',
    summary: 'Input is made consistent.',
    explanation:
      'Parser turns the incoming shape into a predictable structure that downstream nodes can read.',
  },
  index: {
    title: 'Index',
    role: 'Stores relationships',
    summary: 'Known relationships are retrieved.',
    explanation:
      'Index provides the relationship context needed to coordinate a response without changing the source event.',
  },
  coordinator: {
    title: 'Coordinator',
    role: 'Combines signals',
    summary: 'Normalized input meets relationship context.',
    explanation:
      'Coordinator combines the parser and index signals into one deterministic handoff for the output node.',
  },
  output: {
    title: 'Output',
    role: 'Returns a result',
    summary: 'A result leaves the system.',
    explanation:
      'Output is the final boundary. It exposes the coordinated result without hiding which nodes contributed.',
  },
}

const EDGES: Array<Pick<SystemEdge, 'id' | 'from' | 'to' | 'label'>> = [
  { id: 'intake-to-parser', from: 'intake', to: 'parser', label: 'structured input' },
  { id: 'intake-to-index', from: 'intake', to: 'index', label: 'lookup key' },
  { id: 'parser-to-coordinator', from: 'parser', to: 'coordinator', label: 'normalized signal' },
  { id: 'index-to-coordinator', from: 'index', to: 'coordinator', label: 'relationship context' },
  { id: 'coordinator-to-output', from: 'coordinator', to: 'output', label: 'coordinated result' },
]

const STATE_COPY: Record<SystemState, { label: string; summary: string }> = {
  nominal: {
    label: 'Nominal',
    summary: 'All five nodes are available and signals move through both branches.',
  },
  degraded: {
    label: 'Degraded',
    summary: 'The Index needs attention; its context arrives late, but identity and topology stay stable.',
  },
}

export const SYSTEM_STATES: Array<{ value: SystemState; label: string; description: string }> = [
  { value: 'nominal', label: 'Nominal', description: 'all signals available' },
  { value: 'degraded', label: 'Degraded', description: 'index needs attention' },
]

export const SYSTEM_NODE_IDS: SystemNodeId[] = ['intake', 'parser', 'index', 'coordinator', 'output']

export function getSystemSnapshot(state: SystemState): SystemSnapshot {
  const copy = STATE_COPY[state]
  const nodes: SystemNode[] = SYSTEM_NODE_IDS.map((id) => ({
    id,
    ...NODE_DEFINITIONS[id],
    status: state === 'degraded' && id === 'index' ? 'attention' : 'nominal',
    ...NODE_POSITIONS[id],
  }))
  const edges: SystemEdge[] = EDGES.map((edge) => ({
    ...edge,
    status: state === 'degraded' && edge.id === 'index-to-coordinator' ? 'attention' : 'nominal',
  }))

  return {
    state,
    stateLabel: copy.label,
    stateSummary: copy.summary,
    nodes,
    edges,
  }
}

export function getSystemNode(snapshot: SystemSnapshot, id: SystemNodeId): SystemNode {
  const node = snapshot.nodes.find((candidate) => candidate.id === id)
  if (!node) throw new Error(`Unknown system node id: ${id}`)
  return node
}

export function normalizeSystemQuery(value: string): string {
  return value.trim().toLocaleLowerCase('en-US')
}
