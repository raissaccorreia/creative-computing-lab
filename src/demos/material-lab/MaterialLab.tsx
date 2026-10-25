import { lazy, Suspense, useState } from 'react'
import './material-lab.css'
import { REFERENCE_MATERIAL, type MaterialValues } from './material-state'

const MaterialStage = lazy(() => import('./MaterialStage'))

function MaterialLab() {
  const [material, setMaterial] = useState<MaterialValues>(REFERENCE_MATERIAL)

  const update = <K extends keyof MaterialValues>(key: K, value: MaterialValues[K]) => {
    setMaterial((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="material-lab" aria-labelledby="material-lab-title">
      <header className="material-lab__header">
        <div>
          <p className="material-lab__eyebrow">Investigation 04 <span>·</span> Surface study 001</p>
          <h1 id="material-lab-title">Material Lab</h1>
          <p className="material-lab__lede">
            Shape the way light moves across a surface.
          </p>
        </div>
        <p className="material-lab__header-note">Three.js <span>·</span> Metallic-roughness PBR</p>
      </header>

      <div className="material-lab__workspace">
        <figure className="material-lab__stage">
          <figcaption className="material-lab__stage-meta">
            <span>Reference specimen</span>
            <span>MeshStandardMaterial</span>
          </figcaption>
          <div className="material-lab__stage-viewport">
            <Suspense fallback={<div className="material-lab__stage-loading" aria-live="polite">Preparing the light studio…</div>}>
              <MaterialStage
                color={material.color}
                roughness={material.roughness}
                metalness={material.metalness}
              />
            </Suspense>
            <span className="material-lab__stage-index" aria-hidden="true">01</span>
          </div>
          <p className="material-lab__stage-caption">
            A fixed studio environment makes each material change easier to see.
          </p>
        </figure>

        <aside className="material-lab__controls" aria-labelledby="material-controls-title">
          <div className="material-lab__controls-heading">
            <p className="material-lab__eyebrow">Adjust the surface</p>
            <h2 id="material-controls-title">Material properties</h2>
          </div>

          <div className="material-lab__control-list">
            <div className="material-lab__color-control">
              <label htmlFor="material-color">
                <span>Base color</span>
                <output htmlFor="material-color">{material.color.toUpperCase()}</output>
              </label>
              <input
                id="material-color"
                type="color"
                value={material.color}
                onChange={(event) => update('color', event.currentTarget.value)}
                aria-describedby="material-color-help"
              />
              <p id="material-color-help">The surface color before light and reflections change its appearance.</p>
            </div>

            <RangeControl
              id="material-roughness"
              label="Roughness"
              value={material.roughness}
              help="Lower values create tighter highlights. Higher values spread reflections across the surface."
              onChange={(value) => update('roughness', value)}
            />

            <RangeControl
              id="material-metalness"
              label="Metalness"
              value={material.metalness}
              help="Controls how the surface responds as a metal, from non-metal at 0 to metal at 1."
              onChange={(value) => update('metalness', value)}
            />
          </div>

          <div className="material-lab__readout" aria-label="Current material values">
            <span>Current sample</span>
            <strong>{material.roughness < 0.25 ? 'Polished' : material.roughness > 0.7 ? 'Diffused' : 'Satin'} surface</strong>
            <p>Roughness {material.roughness.toFixed(2)} <span>·</span> Metalness {material.metalness.toFixed(2)}</p>
          </div>

          <button
            className="material-lab__reset"
            type="button"
            onClick={() => setMaterial(REFERENCE_MATERIAL)}
            disabled={
              material.color === REFERENCE_MATERIAL.color
              && material.roughness === REFERENCE_MATERIAL.roughness
              && material.metalness === REFERENCE_MATERIAL.metalness
            }
          >
            Reset to reference <span aria-hidden="true">↺</span>
          </button>

          <p className="material-lab__model-note">
            The model keeps the object, camera, and studio lighting fixed. Only the material values change.
          </p>
        </aside>
      </div>

      <footer className="material-lab__footer">
        <span>01 / 03</span>
        <p>Next: a procedural shader, then a richer composed scene.</p>
      </footer>
    </section>
  )
}

function RangeControl({
  id,
  label,
  value,
  help,
  onChange,
}: {
  id: string
  label: string
  value: number
  help: string
  onChange: (value: number) => void
}) {
  const output = value.toFixed(2)

  return (
    <div className="material-lab__range-control">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{output}</output>
      </label>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        aria-describedby={`${id}-help`}
      />
      <p id={`${id}-help`}>{help}</p>
    </div>
  )
}

export default MaterialLab
