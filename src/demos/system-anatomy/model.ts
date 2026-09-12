import type {
  SystemAnatomyEdge,
  SystemAnatomyNode,
  SystemAnatomySnapshot,
  SystemAnatomyState,
} from './types'

const NODE_DEFINITIONS: Array<Omit<SystemAnatomyNode, 'status' | 'statusLabel' | 'explanation'>> = [
  {
    id: 'request-in',
    label: 'Request input',
    kind: 'input',
    description: 'A deterministic request enters the system.',
    screenPosition: { x: 100, y: 300 },
    spatialPosition: [-4.8, 0, 0],
  },
  {
    id: 'gateway',
    label: 'Gateway',
    kind: 'process',
    description: 'The gateway validates and accepts the request.',
    screenPosition: { x: 260, y: 190 },
    spatialPosition: [-2.8, 1.7, 0.2],
  },
  {
    id: 'router',
    label: 'Router',
    kind: 'process',
    description: 'The router chooses the next processing path.',
    screenPosition: { x: 260, y: 410 },
    spatialPosition: [-2.8, -1.7, -0.2],
  },
  {
    id: 'queue',
    label: 'Work queue',
    kind: 'process',
    description: 'The queue holds work until a worker can process it.',
    screenPosition: { x: 470, y: 300 },
    spatialPosition: [-0.3, 0, 0],
  },
  {
    id: 'worker-a',
    label: 'Worker A',
    kind: 'process',
    description: 'Worker A transforms the request into a result.',
    screenPosition: { x: 650, y: 190 },
    spatialPosition: [2, 1.7, 0.5],
  },
  {
    id: 'worker-b',
    label: 'Worker B',
    kind: 'process',
    description: 'Worker B provides a second processing path.',
    screenPosition: { x: 650, y: 410 },
    spatialPosition: [2, -1.7, -0.5],
  },
  {
    id: 'result-store',
    label: 'Result store',
    kind: 'store',
    description: 'The result store keeps the transformed result.',
    screenPosition: { x: 820, y: 300 },
    spatialPosition: [4.1, 0, 0],
  },
  {
    id: 'response-out',
    label: 'Response output',
    kind: 'output',
    description: 'The completed result leaves the system.',
    screenPosition: { x: 970, y: 300 },
    spatialPosition: [5.8, 0, 0],
  },
]

const EDGES: SystemAnatomyEdge[] = [
  { id: 'request-to-gateway', from: 'request-in', to: 'gateway', label: 'accepted request' },
  { id: 'gateway-to-router', from: 'gateway', to: 'router', label: 'validated request' },
  { id: 'router-to-queue', from: 'router', to: 'queue', label: 'queued work' },
  { id: 'queue-to-worker-a', from: 'queue', to: 'worker-a', label: 'work path A' },
  { id: 'queue-to-worker-b', from: 'queue', to: 'worker-b', label: 'work path B' },
  { id: 'worker-a-to-store', from: 'worker-a', to: 'result-store', label: 'stored result' },
  { id: 'worker-b-to-store', from: 'worker-b', to: 'result-store', label: 'stored result' },
  { id: 'store-to-response', from: 'result-store', to: 'response-out', label: 'completed result' },
]

const STATE_OPTIONS: Record<
  SystemAnatomyState,
  { label: string; description: string; statuses: Partial<Record<string, SystemAnatomyNode['status']>> }
> = {
  steady: {
    label: 'Steady',
    description: 'All paths are available and the request can complete normally.',
    statuses: {},
  },
  degraded: {
    label: 'Degraded',
    description: 'The secondary worker is blocked and the queue is building attention.',
    statuses: {
      gateway: 'attention',
      queue: 'attention',
      'worker-b': 'blocked',
      'response-out': 'attention',
    },
  },
  recovering: {
    label: 'Recovering',
    description: 'The blocked path is returning while queued work drains.',
    statuses: {
      queue: 'recovering',
      'worker-b': 'recovering',
      'response-out': 'recovering',
    },
  },
}
const STATUS_COPY: Record<
  SystemAnatomyNode['status'],
  { label: string; explanation: string }
> = {
  healthy: { label: 'Healthy', explanation: 'This node is available in the selected system state.' },
  attention: { label: 'Attention', explanation: 'This node is available but contributes to the current degraded path.' },
  blocked: { label: 'Blocked', explanation: 'This node is unavailable, so its path cannot complete normally.' },
  recovering: { label: 'Recovering', explanation: 'This node is returning to service while the system drains pending work.' },
}

function buildNode(
  definition: (typeof NODE_DEFINITIONS)[number],
  state: SystemAnatomyState,
): SystemAnatomyNode {
  const status = STATE_OPTIONS[state].statuses[definition.id] ?? 'healthy'
  const statusCopy = STATUS_COPY[status]

  return {
    ...definition,
    status,
    statusLabel: statusCopy.label,
    explanation: statusCopy.explanation,
  }
}

export const SYSTEM_ANATOMY_STATES = (Object.entries(STATE_OPTIONS) as Array<[
  SystemAnatomyState,
  (typeof STATE_OPTIONS)[SystemAnatomyState],
]>).map(([value, option]) => ({ value, ...option }))

export function getSystemAnatomySnapshot(state: SystemAnatomyState): SystemAnatomySnapshot {
  const option = STATE_OPTIONS[state]

  return {
    id: state,
    label: option.label,
    description: option.description,
    nodes: NODE_DEFINITIONS.map((definition) => buildNode(definition, state)),
    edges: EDGES,
  }
}
