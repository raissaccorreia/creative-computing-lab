import { lazy, Suspense, useState } from 'react'
import './material-lab.css'
import {
  REFERENCE_MATERIAL,
  REFERENCE_PATTERN_SCALE,
  type MaterialPreviewMode,
  type MaterialValues,
} from './material-state'

const MaterialStage = lazy(() => import('./MaterialStage'))

function MaterialLab() {
  const [material, setMaterial] = useState<MaterialValues>(REFERENCE_MATERIAL)
  const [previewMode, setPreviewMode] = useState<MaterialPreviewMode>('pbr')
  const [patternScale, setPatternScale] = useState(REFERENCE_PATTERN_SCALE)

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
        <p className="material-lab__header-note">Three.js <span>·</span> PBR + GLSL shader</p>
      </header>

      <div className="material-lab__workspace">
        <figure className="material-lab__stage">
          <figcaption className="material-lab__stage-meta">
            <span>Reference specimen</span>
            <span>{previewMode === 'shader' ? 'ShaderMaterial' : 'MeshStandardMaterial'}</span>
          </figcaption>
          <div className="material-lab__stage-viewport">
            <Suspense fallback={<div className="material-lab__stage-loading" aria-live="polite">Preparing the light studio…</div>}>
              <MaterialStage
                mode={previewMode}
                color={material.color}
                roughness={material.roughness}
                metalness={material.metalness}
                patternScale={patternScale}
              />
            </Suspense>
            <span className="material-lab__stage-index" aria-hidden="true">01</span>
          </div>
          <p className="material-lab__stage-caption">
            {previewMode === 'shader'
              ? 'The shader uses surface coordinates to bend a repeating wave into bands. Pattern scale controls their frequency.'
              : 'A fixed studio environment makes each material change easier to see.'}
          </p>
        </figure>

        <aside className="material-lab__controls" aria-labelledby="material-controls-title">
          <div className="material-lab__controls-heading">
            <p className="material-lab__eyebrow">Choose a render mode</p>
            <h2 id="material-controls-title">Surface controls</h2>
          </div>

          <div className="material-lab__mode-switch" role="group" aria-label="Preview mode">
            <button
              type="button"
              aria-pressed={previewMode === 'pbr'}
              onClick={() => setPreviewMode('pbr')}
            >
              PBR material
            </button>
            <button
              type="button"
              aria-pressed={previewMode === 'shader'}
              onClick={() => setPreviewMode('shader')}
            >
              Wave shader
            </button>
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
              <p id="material-color-help">The starting color for both render modes, before their surface effects are applied.</p>
            </div>

            <RangeControl
              id="material-roughness"
              label="Roughness"
              value={material.roughness}
              help="Lower values create tighter highlights. Higher values spread reflections. Available in PBR material mode."
              disabled={previewMode !== 'pbr'}
              onChange={(value) => update('roughness', value)}
            />

            <RangeControl
              id="material-metalness"
              label="Metalness"
              value={material.metalness}
              help="Controls the metallic response from non-metal at 0 to metal at 1. Available in PBR material mode."
              disabled={previewMode !== 'pbr'}
              onChange={(value) => update('metalness', value)}
            />

            <RangeControl
              id="material-pattern-scale"
              label="Pattern scale"
              value={patternScale}
              min={2}
              max={14}
              step={1}
              help="Controls how often the soft bands repeat across the surface. Available in Wave shader mode."
              disabled={previewMode !== 'shader'}
              onChange={setPatternScale}
            />
          </div>

          <div className="material-lab__readout" aria-label="Current preview values">
            <span>Current sample</span>
            <strong>
              {previewMode === 'shader'
                ? 'Procedural wave pattern'
                : `${material.roughness < 0.25 ? 'Polished' : material.roughness > 0.7 ? 'Diffused' : 'Satin'} surface`}
            </strong>
            <p>
              {previewMode === 'shader'
                ? `Pattern scale ${patternScale} · Color ${material.color.toUpperCase()}`
                : `Roughness ${material.roughness.toFixed(2)} · Metalness ${material.metalness.toFixed(2)}`}
            </p>
          </div>

          <button
            className="material-lab__reset"
            type="button"
            onClick={() => {
              setMaterial(REFERENCE_MATERIAL)
              setPatternScale(REFERENCE_PATTERN_SCALE)
            }}
            disabled={
              material.color === REFERENCE_MATERIAL.color
              && material.roughness === REFERENCE_MATERIAL.roughness
              && material.metalness === REFERENCE_MATERIAL.metalness
              && patternScale === REFERENCE_PATTERN_SCALE
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
        <span>02 / 03</span>
        <p>Next: compose the material and shader in a richer scene.</p>
      </footer>
    </section>
  )
}

function RangeControl({
  id,
  label,
  value,
  help,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
  onChange,
}: {
  id: string
  label: string
  value: number
  help: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const output = step < 1 ? value.toFixed(2) : value.toFixed(0)

  return (
    <div className="material-lab__range-control">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{output}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        aria-describedby={`${id}-help`}
      />
      <p id={`${id}-help`}>{help}</p>
    </div>
  )
}

export default MaterialLab
