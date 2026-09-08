import type { CandidateFieldRendererProps } from './types'

function SvgRenderer({
  items,
  selectedId,
  radius,
  dimensions,
  summary,
  onSelect,
}: CandidateFieldRendererProps) {
  return (
    <svg
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      className="candidate-field__svg"
      role="img"
      aria-labelledby="candidate-field-svg-title candidate-field-svg-description"
    >
      <title id="candidate-field-svg-title">Candidate field rendered with SVG</title>
      <desc id="candidate-field-svg-description">
        {summary} Use the candidate search form to inspect a candidate with the
        keyboard or a screen reader.
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
            onClick={() => onSelect(item.id)}
          >
            <circle cx={item.x} cy={item.y} r={radius} />
            {selectedId === item.id ? (
              <circle
                className="candidate-field__selection-ring"
                cx={item.x}
                cy={item.y}
                r={radius + 4}
              />
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  )
}

export default SvgRenderer
