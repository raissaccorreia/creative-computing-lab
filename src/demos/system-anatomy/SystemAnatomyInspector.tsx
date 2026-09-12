import type { SystemAnatomyNode } from './types'

type SystemAnatomyInspectorProps = {
  nodes: SystemAnatomyNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function SystemAnatomyInspector({ nodes, selectedId, onSelect }: SystemAnatomyInspectorProps) {
  const selected = nodes.find((node) => node.id === selectedId) ?? null

  return (
    <aside className="system-anatomy__inspector" aria-labelledby="system-anatomy-inspector-title">
      <p className="system-anatomy__eyebrow">Accessible companion</p>
      <h3 id="system-anatomy-inspector-title">Inspect a system node</h3>
      <p className="system-anatomy__inspector-copy">
        The list is the semantic path for keyboard and assistive technology users. It carries the same ids, states, and explanations as the visual presentation.
      </p>
      <div className="system-anatomy__node-list">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`system-anatomy__node-option${selectedId === node.id ? ' system-anatomy__node-option--selected' : ''}`}
            aria-pressed={selectedId === node.id}
            onClick={() => onSelect(node.id)}
          >
            <span>
              <strong>{node.label}</strong>
              <small>{node.id}</small>
            </span>
            <span className={`system-anatomy__status system-anatomy__status--${node.status}`}>
              {node.statusLabel}
            </span>
          </button>
        ))}
      </div>
      {selected ? (
        <div className="system-anatomy__details" data-testid="system-anatomy-details" aria-live="polite">
          <p className="system-anatomy__selected-label">Selected node</p>
          <h4>{selected.label}</h4>
          <p>{selected.description}</p>
          <dl>
            <div>
              <dt>Stable id</dt>
              <dd>{selected.id}</dd>
            </div>
            <div>
              <dt>Kind</dt>
              <dd>{selected.kind}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{selected.statusLabel}</dd>
            </div>
          </dl>
          <p className="system-anatomy__explanation">{selected.explanation}</p>
        </div>
      ) : (
        <p className="system-anatomy__empty" data-testid="system-anatomy-empty">
          Select a node in the active presentation or from this list to inspect its identity and explanation.
        </p>
      )}
    </aside>
  )
}

export default SystemAnatomyInspector
