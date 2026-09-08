import { useState, type FormEvent } from 'react'
import type { CandidateFieldItem } from './types'

type CandidateFieldInspectorProps = {
  items: CandidateFieldItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('en-US')
}

function getSelectedCopy(selectedId: string | null, items: CandidateFieldItem[]): string {
  if (!selectedId) return 'No candidate selected.'
  const selected = items.find((item) => item.id === selectedId)
  if (!selected) return 'The selected candidate is not in this volume.'
  return `${selected.title}, score ${selected.score.toFixed(3)}${selected.removed ? ', marked filtered' : ''}.`
}

function CandidateFieldInspector({
  items,
  selectedId,
  onSelect,
}: CandidateFieldInspectorProps) {
  const [searchValue, setSearchValue] = useState('')
  const [searchMessage, setSearchMessage] = useState('')
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

    setSearchValue(match.title)
    setSearchMessage(`Selected ${match.id}.`)
    onSelect(match.id)
  }

  return (
    <aside className="candidate-field__details" aria-labelledby="candidate-details-title">
      <p className="candidate-field__eyebrow">Accessible companion</p>
      <h3 id="candidate-details-title">Inspect a candidate</h3>
      <p className="candidate-field__details-copy">
        Pointer selection is a convenience. Keyboard and screen-reader users can
        search by stable id or title without tabbing through every mark.
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
  )
}

export default CandidateFieldInspector
