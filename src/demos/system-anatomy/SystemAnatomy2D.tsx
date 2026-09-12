import type { SystemAnatomyRendererProps, SystemNodeId } from './types'

const NODE_WIDTH = 132
const NODE_HEIGHT = 72

function nodeClass(status: string, selected: boolean): string {
  return [
    'system-anatomy__node',
    status === 'attention' ? 'system-anatomy__node--attention' : '',
    selected ? 'system-anatomy__node--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function SystemAnatomy2D({ snapshot, selectedId, onSelect }: SystemAnatomyRendererProps) {
  const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]))

  const selectNode = (id: SystemNodeId) => onSelect(id)

  return (
    <svg
      className="system-anatomy__svg"
      viewBox="0 0 800 430"
      role="img"
      aria-labelledby="system-anatomy-2d-title system-anatomy-2d-description"
    >
      <title id="system-anatomy-2d-title">System Anatomy 2D screen view</title>
      <desc id="system-anatomy-2d-description">
        {snapshot.stateSummary} Use the HTML node inspector to select a node and read its explanation.
      </desc>
      <defs>
        <marker id="system-anatomy-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" className="system-anatomy__arrow" />
        </marker>
      </defs>
      <rect className="system-anatomy__svg-background" x="0" y="0" width="800" height="430" rx="22" />
      <g className="system-anatomy__edges" aria-hidden="true">
        {snapshot.edges.map((edge) => {
          const from = nodesById.get(edge.from)
          const to = nodesById.get(edge.to)
          if (!from || !to) return null
          return (
            <g key={edge.id} className={edge.status === 'attention' ? 'system-anatomy__edge system-anatomy__edge--attention' : 'system-anatomy__edge'}>
              <line
                x1={from.x + NODE_WIDTH / 2}
                y1={from.y}
                x2={to.x - NODE_WIDTH / 2}
                y2={to.y}
                markerEnd="url(#system-anatomy-arrow)"
              />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} textAnchor="middle">
                {edge.label}
              </text>
            </g>
          )
        })}
      </g>
      <g className="system-anatomy__nodes" aria-hidden="true">
        {snapshot.nodes.map((node) => (
          <g
            key={node.id}
            className={nodeClass(node.status, selectedId === node.id)}
            data-node-id={node.id}
            transform={`translate(${node.x - NODE_WIDTH / 2} ${node.y - NODE_HEIGHT / 2})`}
            onClick={() => selectNode(node.id)}
          >
            <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx="14" />
            <text className="system-anatomy__node-title" x={NODE_WIDTH / 2} y="29" textAnchor="middle">
              {node.title}
            </text>
            <text className="system-anatomy__node-role" x={NODE_WIDTH / 2} y="49" textAnchor="middle">
              {node.status === 'attention' ? 'needs attention' : node.role}
            </text>
            {selectedId === node.id ? (
              <rect className="system-anatomy__selection-ring" x="-5" y="-5" width={NODE_WIDTH + 10} height={NODE_HEIGHT + 10} rx="18" />
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  )
}

export default SystemAnatomy2D
