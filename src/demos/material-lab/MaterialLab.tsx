import { lazy, Suspense, useState } from 'react'
import './material-lab.css'
import {
  REFERENCE_MATERIAL,
  REFERENCE_PATTERN_SCALE,
  type MaterialValues,
} from './material-state'

const MaterialStage = lazy(() => import('./MaterialStage'))

function MaterialLab() {
  const [material, setMaterial] = useState<MaterialValues>(REFERENCE_MATERIAL)
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
            <span>Studio composition</span>
            <span>2 PBR meshes · 1 ShaderMaterial</span>
          </figcaption>
          <div className="material-lab__stage-viewport">
            <Suspense fallback={<div className="material-lab__stage-loading" aria-live="polite">Preparing the light studio…</div>}>
              <MaterialStage
                color={material.color}
                roughness={material.roughness}
                metalness={material.metalness}
                patternScale={patternScale}
              />
            </Suspense>
            <span className="material-lab__stage-index" aria-hidden="true">03</span>
          </div>
          <dl className="material-lab__scene-key" aria-label="Specimen key">
            <div>
              <dt><span aria-hidden="true">01</span> PBR material</dt>
              <dd>Two forms · roughness and metalness</dd>
            </div>
            <div>
              <dt><span aria-hidden="true">02</span> Wave shader</dt>
              <dd>One form · pattern scale</dd>
            </div>
          </dl>
          <p className="material-lab__stage-caption">
            The same base color meets studio reflections and a repeating wave pattern in one scene.
          </p>
        </figure>

        <aside className="material-lab__controls" aria-labelledby="material-controls-title">
          <div className="material-lab__controls-heading">
            <p className="material-lab__eyebrow">Adjust the specimens</p>
            <h2 id="material-controls-title">Surface controls</h2>
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
              <p id="material-color-help">Shared by all three forms. Lighting and surface treatment change how it appears.</p>
            </div>

            <RangeControl
              id="material-roughness"
              label="Roughness"
              value={material.roughness}
              help="Changes highlights on both PBR forms. Lower values tighten them; higher values spread them."
              onChange={(value) => update('roughness', value)}
            />

            <RangeControl
              id="material-metalness"
              label="Metalness"
              value={material.metalness}
              help="Changes the metallic response on both PBR forms, from non-metal at 0 to metal at 1."
              onChange={(value) => update('metalness', value)}
            />

            <RangeControl
              id="material-pattern-scale"
              label="Pattern scale"
              value={patternScale}
              min={2}
              max={14}
              step={1}
              help="Controls how often soft bands repeat on the shader form."
              onChange={setPatternScale}
            />
          </div>

          <div className="material-lab__readout" aria-label="Current specimen values">
            <span>Current values</span>
            <p><strong>PBR</strong> Roughness {material.roughness.toFixed(2)} <span>·</span> Metalness {material.metalness.toFixed(2)}</p>
            <p><strong>Shader</strong> Pattern scale {patternScale} <span>·</span> Color {material.color.toUpperCase()}</p>
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
            Color is shared. Roughness and metalness affect the two PBR forms; pattern scale affects the wave form.
          </p>
        </aside>
      </div>

      <footer className="material-lab__footer">
        <span>03 / 03</span>
        <p>Material Lab complete · PBR reflections + procedural wave.</p>
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
  onChange,
}: {
  id: string
  label: string
  value: number
  help: string
  min?: number
  max?: number
  step?: number
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
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        aria-describedby={`${id}-help`}
      />
      <p id={`${id}-help`}>{help}</p>
    </div>
  )
}

export default MaterialLab
