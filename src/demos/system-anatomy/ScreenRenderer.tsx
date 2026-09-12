import type { KeyboardEvent } from 'react'
import type { SystemAnatomyRendererProps } from './types'

const VIEWBOX = { width: 1080, height: 600 }

function activateOnKey(event: KeyboardEvent<SVGGElement>, onSelect: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onSelect()
  }
}

function ScreenRenderer({ snapshot, selectedId, onSelect }: SystemAnatomyRendererProps) {
  const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]))

  return (
    <svg
      className="system-anatomy__screen"
      data-testid="system-anatomy-screen"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      role="group"
      aria-labelledby="system-anatomy-screen-title system-anatomy-screen-description"
    >
      <title id="system-anatomy-screen-title">System Anatomy in 2D Screen view</title>
      <desc id="system-anatomy-screen-description">
        {snapshot.description} Select a node here or use the HTML node inspector below.
      </desc>
      <rect className="system-anatomy__screen-background" x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} rx="24" />
      <g className="system-anatomy__edges" aria-hidden="true">
        {snapshot.edges.map((edge) => {
          const from = nodesById.get(edge.from)
          const to = nodesById.get(edge.to)
          if (!from || !to) return null
          return (
            <g key={edge.id}>
              <line x1={from.screenPosition.x} y1={from.screenPosition.y} x2={to.screenPosition.x} y2={to.screenPosition.y} />
              <text x={(from.screenPosition.x + to.screenPosition.x) / 2} y={(from.screenPosition.y + to.screenPosition.y) / 2 - 10}>
                {edge.label}
              </text>
            </g>
          )
        })}
      </g>
      <g className="system-anatomy__nodes">
        {snapshot.nodes.map((node) => {
          const isSelected = selectedId === node.id
          return (
            <g
              key={node.id}
              className={`system-anatomy__node system-anatomy__node--${node.status}${isSelected ? ' system-anatomy__node--selected' : ''}`}
              data-node-id={node.id}
              data-node-status={node.status}
              role="button"
              tabIndex={0}
              aria-label={`Select ${node.label}. Status: ${node.statusLabel}.`}
              aria-pressed={isSelected}
              transform={`translate(${node.screenPosition.x} ${node.screenPosition.y})`}
              onClick={() => onSelect(node.id)}
              onKeyDown={(event) => activateOnKey(event, () => onSelect(node.id))}
            >
              <rect x="-68" y="-38" width="136" height="76" rx="14" />
              <circle className="system-anatomy__node-status" cx="-48" cy="-18" r="7" />
              <text className="system-anatomy__node-label" x="0" y="4" textAnchor="middle">
                {node.label}
              </text>
              <text className="system-anatomy__node-status-label" x="0" y="25" textAnchor="middle">
                {node.statusLabel}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default ScreenRenderer
