import { useMemo, useState } from 'react'
import SystemAnatomy2D from './SystemAnatomy2D'
import SystemAnatomyInspector from './SystemAnatomyInspector'
import { getSystemSnapshot, SYSTEM_STATES } from './model'
import type { SystemNodeId, SystemState } from './types'
import './system-anatomy.css'

function SystemAnatomy() {
  const [state, setState] = useState<SystemState>('nominal')
  const [selectedId, setSelectedId] = useState<SystemNodeId | null>(null)
  const snapshot = useMemo(() => getSystemSnapshot(state), [state])

  return (
    <section className="system-anatomy" aria-labelledby="system-anatomy-title">
      <header className="system-anatomy__header">
        <p className="system-anatomy__eyebrow">Investigation 03 · 2D baseline</p>
        <h2 id="system-anatomy-title">System Anatomy</h2>
        <p className="system-anatomy__lede">
          Inspect one deterministic system in a screen-oriented view. The later spatial view will consume this same identity, state, selection, and explanation contract.
        </p>
      </header>

      <div className="system-anatomy__controls">
        <fieldset>
          <legend>System state</legend>
          <div className="system-anatomy__state-options">
            {SYSTEM_STATES.map((option) => (
              <label key={option.value} className="system-anatomy__state-option">
                <input
                  type="radio"
                  name="system-anatomy-state"
                  value={option.value}
                  checked={state === option.value}
                  onChange={() => setState(option.value)}
                />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="system-anatomy__summary" aria-live="polite" data-testid="system-anatomy-summary">
        {snapshot.stateSummary}
      </p>

      <div className="system-anatomy__layout">
        <figure className="system-anatomy__figure">
          <div className="system-anatomy__figure-heading">
            <span>Presentation</span>
            <strong>2D Screen</strong>
          </div>
          <div className="system-anatomy__surface" data-testid="system-anatomy-2d-surface">
            <SystemAnatomy2D snapshot={snapshot} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <figcaption>
            Lines show deterministic relationships; selection highlights a node. The HTML inspector beside it is the semantic path.
          </figcaption>
        </figure>
        <SystemAnatomyInspector snapshot={snapshot} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <p className="system-anatomy__note">
        The 3D Spatial presentation is intentionally not part of this baseline. This experiment does not claim WebXR or headset support.
      </p>
    </section>
  )
}

export default SystemAnatomy
