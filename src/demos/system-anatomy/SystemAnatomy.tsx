import { useMemo, useState } from 'react'
import ScreenRenderer from './ScreenRenderer'
import SystemAnatomyInspector from './SystemAnatomyInspector'
import { getSystemAnatomySnapshot, SYSTEM_ANATOMY_STATES } from './model'
import type { SystemAnatomyState } from './types'
import './system-anatomy.css'

function SystemAnatomy() {
  const [state, setState] = useState<SystemAnatomyState>('steady')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const snapshot = useMemo(() => getSystemAnatomySnapshot(state), [state])

  return (
    <section className="system-anatomy" aria-labelledby="system-anatomy-title">
      <header className="system-anatomy__header">
        <p className="system-anatomy__eyebrow">Investigation 03 · 2D baseline</p>
        <h2 id="system-anatomy-title">System Anatomy</h2>
        <p className="system-anatomy__lede">
          Inspect one deterministic system in a screen-oriented presentation. The later spatial mode must preserve this identity, state, selection, and explanation contract.
        </p>
      </header>

      <div className="system-anatomy__controls">
        <fieldset>
          <legend>System state</legend>
          <div className="system-anatomy__state-options">
            {SYSTEM_ANATOMY_STATES.map((option) => (
              <label key={option.value}>
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
        {snapshot.label} state: {snapshot.description}
      </p>

      <div className="system-anatomy__layout">
        <figure className="system-anatomy__figure">
          <div className="system-anatomy__figure-heading">
            <span>Current presentation</span>
            <strong>2D Screen</strong>
          </div>
          <div className="system-anatomy__surface">
            <ScreenRenderer snapshot={snapshot} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <figcaption>
            Lines show deterministic relationships. Status is repeated as text and shape in each node; use the inspector for the complete semantic explanation.
          </figcaption>
        </figure>

        <SystemAnatomyInspector nodes={snapshot.nodes} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <p className="system-anatomy__note">
        2D Screen is the default baseline. The 3D Spatial view will be an explicit enhancement; it must not replace this semantic inspection path or imply WebXR/headset support.
      </p>
    </section>
  )
}

export default SystemAnatomy
