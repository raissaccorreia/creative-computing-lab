import { useMemo, useState } from 'react'
import CandidateFieldInspector from './CandidateFieldInspector'
import { STATE_OPTIONS } from './constants'
import RendererSurface from './RendererSurface'
import {
  CANDIDATE_VOLUMES,
  type CandidateFieldRenderer,
  type CandidateFieldState,
  type CandidateFieldVolume,
} from './types'
import {
  getFieldDimensions,
  getFieldItems,
  getFieldSummary,
  getMarkRadius,
} from './model'
import './candidate-field.css'

function readRenderer(): CandidateFieldRenderer {
  if (typeof window === 'undefined') return 'svg'
  return new URLSearchParams(window.location.search).get('renderer') === 'canvas'
    ? 'canvas'
    : 'svg'
}

function CandidateField() {
  const [volume, setVolume] = useState<CandidateFieldVolume>(250)
  const [state, setState] = useState<CandidateFieldState>('initial')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const renderer = readRenderer()

  const items = useMemo(() => getFieldItems(volume, state), [volume, state])
  const dimensions = getFieldDimensions()
  const radius = getMarkRadius(volume)
  const removedCount = items.filter((item) => item.removed).length
  const summary = getFieldSummary(items, state)

  const handleSelect = (id: string) => {
    if (items.some((item) => item.id === id)) setSelectedId(id)
  }

  return (
    <section className="candidate-field" aria-labelledby="candidate-field-title">
      <header className="candidate-field__header">
        <p className="candidate-field__eyebrow">
          Investigation 02 · {renderer === 'canvas' ? 'Canvas 2D layer' : 'SVG baseline'}
        </p>
        <h2 id="candidate-field-title">Candidate Field</h2>
        <p className="candidate-field__lede">
          A deterministic collection of visual candidates. Change the volume and
          state to see how the same identity, selection, and explanation contract
          behaves before we compare SVG with Canvas.
        </p>
      </header>

      <div className="candidate-field__controls">
        <fieldset className="candidate-field__states">
          <legend>Field state</legend>
          <div className="candidate-field__state-options">
            {STATE_OPTIONS.map((option) => (
              <label key={option.value} className="candidate-field__state-option">
                <input
                  type="radio"
                  name="candidate-field-state"
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

        <label className="candidate-field__volume">
          <span>Candidate volume</span>
          <select
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value) as CandidateFieldVolume)}
          >
            {CANDIDATE_VOLUMES.map((option) => (
              <option key={option} value={option}>
                {option.toLocaleString('en-US')} candidates
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="candidate-field__summary" aria-live="polite">
        {summary}
        {state === 'filtered' ? ` ${removedCount.toLocaleString('en-US')} are marked.` : ''}
      </p>

      <div className="candidate-field__layout">
        <figure className="candidate-field__figure">
          <div className="candidate-field__figure-heading">
            <span>{renderer === 'canvas' ? 'Experimental renderer' : 'Public renderer'}</span>
            <strong>{renderer === 'canvas' ? 'Canvas 2D' : 'SVG'}</strong>
          </div>
          <div
            className="candidate-field__canvas"
            data-testid={`candidate-field-${renderer}-wrap`}
          >
            <RendererSurface
              renderer={renderer}
              items={items}
              selectedId={selectedId}
              radius={radius}
              dimensions={dimensions}
              summary={summary}
              onSelect={handleSelect}
            />
          </div>
          <figcaption>
            {renderer === 'canvas'
              ? 'Canvas draws the same deterministic marks. Its HTML search and details panel remain the accessible inspection path.'
              : 'Marks are intentionally simple. Their stable ids and the HTML details panel are the contract that the Canvas renderer must preserve.'}
          </figcaption>
        </figure>

        <CandidateFieldInspector
          items={items}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <p className="candidate-field__note">
        {renderer === 'canvas'
          ? 'This is the second layer of the experiment: an equivalent Canvas 2D renderer. The comparison harness and guarded stress profile are available in Candidate Field Comparison.'
          : 'This is the first layer of the experiment: a readable SVG baseline. The Canvas equivalent is available with the experimental renderer query parameter; the comparison harness and guarded stress profile are available in Candidate Field Comparison.'}
      </p>
    </section>
  )
}

export default CandidateField
