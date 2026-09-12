import { useState, type FormEvent } from 'react'
import { getSystemNode, normalizeSystemQuery } from './model'
import type { SystemNodeId, SystemSnapshot } from './types'

type SystemAnatomyInspectorProps = {
  snapshot: SystemSnapshot
  selectedId: SystemNodeId | null
  onSelect: (id: SystemNodeId) => void
}

function SystemAnatomyInspector({ snapshot, selectedId, onSelect }: SystemAnatomyInspectorProps) {
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('Use a node title or stable id. Example: index.')
  const selected = selectedId ? getSystemNode(snapshot, selectedId) : null

  const inspect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeSystemQuery(query)
    const match = snapshot.nodes.find(
      (node) => normalizeSystemQuery(node.id).includes(normalized) || normalizeSystemQuery(node.title).includes(normalized),
    )
    if (!normalized) {
      setMessage('Enter a node title or stable id to inspect.')
      return
    }
    if (!match) {
      setMessage('No node matched this query in the current snapshot.')
      return
    }
    setQuery(match.title)
    setMessage(`Selected ${match.id}.`)
    onSelect(match.id)
  }

  return (
    <aside className="system-anatomy__inspector" aria-labelledby="system-anatomy-inspector-title">
      <p className="system-anatomy__eyebrow">Semantic inspection path</p>
      <h3 id="system-anatomy-inspector-title">Inspect a system node</h3>
      <p className="system-anatomy__inspector-copy">
        The diagram is a visual overview. Keyboard and assistive-technology users can use this HTML path without targeting visual marks.
      </p>
      <form className="system-anatomy__search" onSubmit={inspect}>
        <label htmlFor="system-anatomy-search">Node title or stable id</label>
        <div className="system-anatomy__search-row">
          <input
            id="system-anatomy-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="index"
          />
          <button type="submit">Inspect</button>
        </div>
      </form>
      <p className="system-anatomy__search-message" aria-live="polite">{message}</p>

      <ul className="system-anatomy__node-list" aria-label="System nodes">
        {snapshot.nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              className="system-anatomy__node-option"
              aria-pressed={selectedId === node.id}
              onClick={() => onSelect(node.id)}
            >
              <span>
                <strong>{node.title}</strong>
                <small>{node.id}</small>
              </span>
              <span className={node.status === 'attention' ? 'system-anatomy__status system-anatomy__status--attention' : 'system-anatomy__status'}>
                {node.status === 'attention' ? 'Attention' : 'Nominal'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <section className="system-anatomy__selected" data-testid="system-anatomy-details" aria-live="polite">
          <p className="system-anatomy__selected-label">Selected node</p>
          <h4>{selected.title}</h4>
          <p>{selected.explanation}</p>
          <dl>
            <div>
              <dt>Stable id</dt>
              <dd>{selected.id}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{selected.role}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{selected.status === 'attention' ? 'needs attention' : 'nominal'}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="system-anatomy__empty" data-testid="system-anatomy-details-empty">
          No node selected. Choose one from the HTML node list or inspect by id.
        </p>
      )}
    </aside>
  )
}

export default SystemAnatomyInspector
