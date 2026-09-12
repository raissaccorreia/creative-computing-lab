import { lazy, Suspense, useMemo, useState } from 'react'
import ScreenRenderer from './ScreenRenderer'
import SystemAnatomyInspector from './SystemAnatomyInspector'
import { getSystemAnatomySnapshot, SYSTEM_ANATOMY_STATES } from './model'
import type { SystemAnatomyState } from './types'
import './system-anatomy.css'

type SystemAnatomyMode = 'screen' | 'spatial'

const SpatialRenderer = lazy(() => import('./SpatialRenderer'))

function SystemAnatomy() {
  const [state, setState] = useState<SystemAnatomyState>('steady')
  const [mode, setMode] = useState<SystemAnatomyMode>('screen')
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
          <legend>Presentation</legend>
          <div className="system-anatomy__mode-options">
            <label>
              <input type="radio" name="system-anatomy-mode" value="screen" checked={mode === 'screen'} onChange={() => setMode('screen')} />
              <span><strong>2D Screen</strong><small>screen-oriented baseline</small></span>
            </label>
            <label>
              <input type="radio" name="system-anatomy-mode" value="spatial" checked={mode === 'spatial'} onChange={() => setMode('spatial')} />
              <span><strong>3D Spatial</strong><small>pointer/touch enhancement</small></span>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>System state</legend>
          <div className="system-anatomy__state-options">
            {SYSTEM_ANATOMY_STATES.map((option) => (
              <label key={option.value}>
                <input type="radio" name="system-anatomy-state" value={option.value} checked={state === option.value} onChange={() => setState(option.value)} />
                <span><strong>{option.label}</strong><small>{option.description}</small></span>
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
            <strong data-testid="system-anatomy-mode">{mode === 'screen' ? '2D Screen' : '3D Spatial'}</strong>
          </div>
          <div className="system-anatomy__surface">
            {mode === 'screen' ? (
              <ScreenRenderer snapshot={snapshot} selectedId={selectedId} onSelect={setSelectedId} />
            ) : (
              <Suspense fallback={<p className="system-anatomy__spatial-fallback">Loading the explicit 3D Spatial view…</p>}>
                <SpatialRenderer snapshot={snapshot} selectedId={selectedId} onSelect={setSelectedId} />
              </Suspense>
            )}
          </div>
          <figcaption>
            Lines show deterministic relationships. Status is repeated as text and shape in each node; use the inspector for the complete semantic explanation.
          </figcaption>
        </figure>

        <SystemAnatomyInspector nodes={snapshot.nodes} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <p className="system-anatomy__note">
        The switch is explicit: 2D Screen is the baseline and 3D Spatial is a pointer/touch enhancement. Neither mode replaces the semantic inspection path or implies WebXR/headset support.
      </p>
    </section>
  )
}

export default SystemAnatomy
