import { useMemo, useState, type FormEvent } from 'react'
import {
  CANDIDATE_VOLUMES,
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

const STATE_OPTIONS: Array<{
  value: CandidateFieldState
  label: string
  description: string
}> = [
  {
    value: 'initial',
    label: 'Initial',
    description: 'stable input order',
  },
  {
    value: 'filtered',
    label: 'Filtered',
    description: 'marks removed candidates',
  },
  {
    value: 'reordered',
    label: 'Reordered',
    description: 'deterministic score order',
  },
]

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('en-US')
}

function getSelectedCopy(
  selectedId: string | null,
  items: ReturnType<typeof getFieldItems>,
): string {
  if (!selectedId) return 'No candidate selected.'
  const selected = items.find((item) => item.id === selectedId)
  if (!selected) return 'The selected candidate is not in this volume.'
  return `${selected.title}, score ${selected.score.toFixed(3)}${selected.removed ? ', marked filtered' : ''}.`
}

function CandidateField() {
  const [volume, setVolume] = useState<CandidateFieldVolume>(250)
  const [state, setState] = useState<CandidateFieldState>('initial')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [searchMessage, setSearchMessage] = useState('')

  const items = useMemo(() => getFieldItems(volume, state), [volume, state])
  const dimensions = getFieldDimensions()
  const radius = getMarkRadius(volume)
  const removedCount = items.filter((item) => item.removed).length
  const selected = items.find((item) => item.id === selectedId) ?? null

  const handleInspect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = normalize(searchValue)
    if (!query) {
      setSearchMessage('Enter a candidate title or id to inspect.')
      return
    }

    const match = items.find(
      (item) => normalize(item.id).includes(query) || normalize(item.title).includes(query),
    )
    if (!match) {
      setSearchMessage('No candidate matched this query in the selected volume.')
      return
    }

    setSelectedId(match.id)
    setSearchValue(match.title)
    setSearchMessage(`Selected ${match.id}.`)
  }

  const handleSelect = (id: string) => {
    const candidate = items.find((item) => item.id === id)
    if (!candidate) return
    setSelectedId(id)
    setSearchValue(candidate.title)
    setSearchMessage(`Selected ${candidate.id}.`)
  }

  return (
    <section className="candidate-field" aria-labelledby="candidate-field-title">
      <header className="candidate-field__header">
        <p className="candidate-field__eyebrow">Investigation 02 · SVG baseline</p>
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
        {getFieldSummary(items, state)}
        {state === 'filtered' ? ` ${removedCount.toLocaleString('en-US')} are marked.` : ''}
      </p>

      <div className="candidate-field__layout">
        <figure className="candidate-field__figure">
          <div className="candidate-field__figure-heading">
            <span>Public renderer</span>
            <strong>SVG</strong>
          </div>
          <div className="candidate-field__canvas" data-testid="candidate-field-svg-wrap">
            <svg
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="candidate-field__svg"
              role="img"
              aria-labelledby="candidate-field-svg-title candidate-field-svg-description"
            >
              <title id="candidate-field-svg-title">Candidate field rendered with SVG</title>
              <desc id="candidate-field-svg-description">
                {getFieldSummary(items, state)} Use the candidate search form to
                inspect a candidate with the keyboard or a screen reader.
              </desc>
              <rect
                className="candidate-field__svg-background"
                x="0"
                y="0"
                width={dimensions.width}
                height={dimensions.height}
                rx="18"
              />
              <g className="candidate-field__marks" aria-hidden="true">
                {items.map((item) => (
                  <g
                    key={item.id}
                    className={`candidate-field__mark${item.removed ? ' candidate-field__mark--removed' : ''}${selectedId === item.id ? ' candidate-field__mark--selected' : ''}`}
                    data-candidate-id={item.id}
                    onClick={() => handleSelect(item.id)}
                  >
                    <circle cx={item.x} cy={item.y} r={radius} />
                    {selectedId === item.id ? (
                      <circle className="candidate-field__selection-ring" cx={item.x} cy={item.y} r={radius + 4} />
                    ) : null}
                  </g>
                ))}
              </g>
            </svg>
          </div>
          <figcaption>
            Marks are intentionally simple. Their stable ids and the HTML details
            panel are the contract that the later Canvas renderer must preserve.
          </figcaption>
        </figure>

        <aside className="candidate-field__details" aria-labelledby="candidate-details-title">
          <p className="candidate-field__eyebrow">Accessible companion</p>
          <h3 id="candidate-details-title">Inspect a candidate</h3>
          <p className="candidate-field__details-copy">
            Pointer selection is a convenience. Keyboard and screen-reader users
            can search by stable id or title without tabbing through every mark.
          </p>
          <form className="candidate-field__search" onSubmit={handleInspect}>
            <label htmlFor="candidate-search">Candidate title or id</label>
            <div className="candidate-field__search-row">
              <input
                id="candidate-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="candidate-00001"
              />
              <button type="submit">Inspect</button>
            </div>
          </form>
          <p className="candidate-field__search-message" aria-live="polite">
            {searchMessage || 'Try a title or id. Example: candidate-00001.'}
          </p>

          {selected ? (
            <div className="candidate-field__selected" data-testid="candidate-field-details">
              <p className="candidate-field__selected-label">Selected candidate</p>
              <h4>{selected.title}</h4>
              <dl>
                <div>
                  <dt>Stable id</dt>
                  <dd>{selected.id}</dd>
                </div>
                <div>
                  <dt>Score</dt>
                  <dd>{selected.score.toFixed(3)}</dd>
                </div>
                <div>
                  <dt>Topics</dt>
                  <dd>{selected.topics.join(', ')}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selected.removed ? 'marked filtered' : 'active'}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="candidate-field__empty" data-testid="candidate-field-empty">
              {getSelectedCopy(selectedId, items)}
            </p>
          )}
        </aside>
      </div>

      <p className="candidate-field__note">
        This is the first layer of the experiment: a readable SVG baseline. The
        next layer will render the same model with Canvas and measure the trade-off
        at controlled volumes in a separate comparison harness.
      </p>
    </section>
  )
}

export default CandidateField
