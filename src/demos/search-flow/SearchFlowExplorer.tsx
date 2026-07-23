import './search-flow.css'

const QUERY =
  'Introductory guide to accessible SVG, published after 2024, under 15 minutes.'

const DIAGRAM_TITLE = 'Search flow from query to recommendations'
const DIAGRAM_DESC =
  'A static diagram of five stages: a query enters the system, candidates are gathered, filters remove mismatches, remaining items are ranked, and a small set of recommendations is shown with explanations.'

function ArrowMarker({ id }: { id: string }) {
  return (
    <marker
      id={id}
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <path d="M0 0 L8 4 L0 8 Z" className="flow-arrow-head" />
    </marker>
  )
}

function RemovedPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width="6"
      height="6"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <line x1="0" y1="0" x2="0" y2="6" className="flow-hatch-line" />
    </pattern>
  )
}

function DesktopDiagram() {
  return (
    <svg
      className="flow-diagram flow-diagram--desktop"
      viewBox="0 0 1040 300"
      role="img"
      aria-labelledby="flow-desktop-title"
      aria-describedby="flow-desktop-desc"
    >
      <title id="flow-desktop-title">{DIAGRAM_TITLE}</title>
      <desc id="flow-desktop-desc">{DIAGRAM_DESC}</desc>
      <defs>
        <ArrowMarker id="flow-arrow-h" />
        <RemovedPattern id="flow-hatch-h" />
      </defs>

      {/* Query */}
      <g className="flow-stage" data-stage="Query">
        <text x="20" y="28" className="flow-stage-label">
          Query
        </text>
        <rect x="20" y="48" width="160" height="88" rx="4" className="flow-panel" />
        <text x="32" y="72" className="flow-query-line">
          Introductory guide to
        </text>
        <text x="32" y="92" className="flow-query-line">
          accessible SVG…
        </text>
        <g className="flow-tokens">
          <rect x="32" y="108" width="44" height="18" rx="2" className="flow-token" />
          <text x="54" y="121" textAnchor="middle" className="flow-token-text">
            topic
          </text>
          <rect x="82" y="108" width="40" height="18" rx="2" className="flow-token" />
          <text x="102" y="121" textAnchor="middle" className="flow-token-text">
            level
          </text>
          <rect x="128" y="108" width="40" height="18" rx="2" className="flow-token" />
          <text x="148" y="121" textAnchor="middle" className="flow-token-text">
            limit
          </text>
        </g>
        <path
          d="M12 92 H20"
          className="flow-connector"
          markerEnd="url(#flow-arrow-h)"
        />
      </g>

      <path
        d="M190 92 H230"
        className="flow-connector"
        markerEnd="url(#flow-arrow-h)"
      />

      {/* Candidates */}
      <g className="flow-stage" data-stage="Candidates">
        <text x="240" y="28" className="flow-stage-label">
          Candidates
        </text>
        <rect x="240" y="48" width="160" height="160" rx="4" className="flow-panel" />
        {[
          [268, 88],
          [308, 78],
          [348, 92],
          [278, 128],
          [328, 138],
          [358, 168],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="10"
            className="flow-node"
          />
        ))}
      </g>

      <path
        d="M410 128 H450"
        className="flow-connector"
        markerEnd="url(#flow-arrow-h)"
      />

      {/* Filters */}
      <g className="flow-stage" data-stage="Filters">
        <text x="460" y="28" className="flow-stage-label">
          Filters
        </text>
        <rect x="460" y="48" width="160" height="160" rx="4" className="flow-panel" />
        <path
          d="M490 70 L530 70 L555 128 L530 186 L490 186 Z"
          className="flow-gate"
        />
        <circle cx="510" cy="110" r="9" className="flow-node" />
        <circle cx="525" cy="145" r="9" className="flow-node" />
        <circle cx="505" cy="165" r="9" className="flow-node" />
        <circle cx="575" cy="95" r="9" className="flow-node flow-node--removed" />
        <circle
          cx="575"
          cy="95"
          r="9"
          fill="url(#flow-hatch-h)"
          className="flow-node-hatch"
        />
        <line x1="566" y1="86" x2="584" y2="104" className="flow-node-strike" />
        <circle cx="590" cy="145" r="9" className="flow-node flow-node--removed" />
        <circle
          cx="590"
          cy="145"
          r="9"
          fill="url(#flow-hatch-h)"
          className="flow-node-hatch"
        />
        <line x1="581" y1="136" x2="599" y2="154" className="flow-node-strike" />
        <circle cx="575" cy="175" r="9" className="flow-node flow-node--removed" />
        <circle
          cx="575"
          cy="175"
          r="9"
          fill="url(#flow-hatch-h)"
          className="flow-node-hatch"
        />
        <line x1="566" y1="166" x2="584" y2="184" className="flow-node-strike" />
      </g>

      <path
        d="M630 128 H670"
        className="flow-connector"
        markerEnd="url(#flow-arrow-h)"
      />

      {/* Ranking */}
      <g className="flow-stage" data-stage="Ranking">
        <text x="680" y="28" className="flow-stage-label">
          Ranking
        </text>
        <rect x="680" y="48" width="150" height="160" rx="4" className="flow-panel" />
        {[
          { y: 72, w: 110, n: '1' },
          { y: 108, w: 88, n: '2' },
          { y: 144, w: 68, n: '3' },
          { y: 180, w: 48, n: '4' },
        ].map((bar) => (
          <g key={bar.n}>
            <text x="696" y={bar.y + 14} className="flow-rank-index">
              {bar.n}
            </text>
            <rect
              x="712"
              y={bar.y}
              width={bar.w}
              height="20"
              rx="2"
              className="flow-rank-bar"
            />
          </g>
        ))}
      </g>

      <path
        d="M840 128 H880"
        className="flow-connector"
        markerEnd="url(#flow-arrow-h)"
      />

      {/* Recommendations */}
      <g className="flow-stage" data-stage="Recommendations">
        <text x="890" y="28" className="flow-stage-label">
          Recommendations
        </text>
        <rect x="890" y="48" width="130" height="160" rx="4" className="flow-panel" />
        <rect
          x="908"
          y="68"
          width="94"
          height="36"
          rx="3"
          className="flow-rec flow-rec--primary"
        />
        <text x="955" y="90" textAnchor="middle" className="flow-rec-label">
          A
        </text>
        <rect x="908" y="116" width="94" height="28" rx="3" className="flow-rec" />
        <text x="955" y="134" textAnchor="middle" className="flow-rec-label">
          B
        </text>
        <rect x="908" y="156" width="94" height="28" rx="3" className="flow-rec" />
        <text x="955" y="174" textAnchor="middle" className="flow-rec-label">
          C
        </text>
      </g>
    </svg>
  )
}

function MobileDiagram() {
  return (
    <svg
      className="flow-diagram flow-diagram--mobile"
      viewBox="0 0 320 980"
      role="img"
      aria-labelledby="flow-mobile-title"
      aria-describedby="flow-mobile-desc"
    >
      <title id="flow-mobile-title">{DIAGRAM_TITLE}</title>
      <desc id="flow-mobile-desc">{DIAGRAM_DESC}</desc>
      <defs>
        <ArrowMarker id="flow-arrow-v" />
        <RemovedPattern id="flow-hatch-v" />
      </defs>

      {/* Query */}
      <g className="flow-stage" data-stage="Query">
        <text x="20" y="28" className="flow-stage-label">
          Query
        </text>
        <rect x="20" y="44" width="280" height="100" rx="4" className="flow-panel" />
        <text x="36" y="72" className="flow-query-line">
          Introductory guide to
        </text>
        <text x="36" y="92" className="flow-query-line">
          accessible SVG…
        </text>
        <rect x="36" y="108" width="52" height="18" rx="2" className="flow-token" />
        <text x="62" y="121" textAnchor="middle" className="flow-token-text">
          topic
        </text>
        <rect x="96" y="108" width="48" height="18" rx="2" className="flow-token" />
        <text x="120" y="121" textAnchor="middle" className="flow-token-text">
          level
        </text>
        <rect x="152" y="108" width="48" height="18" rx="2" className="flow-token" />
        <text x="176" y="121" textAnchor="middle" className="flow-token-text">
          limit
        </text>
      </g>

      <path
        d="M160 154 V178"
        className="flow-connector"
        markerEnd="url(#flow-arrow-v)"
      />

      {/* Candidates */}
      <g className="flow-stage" data-stage="Candidates">
        <text x="20" y="204" className="flow-stage-label">
          Candidates
        </text>
        <rect x="20" y="220" width="280" height="120" rx="4" className="flow-panel" />
        {[
          [60, 260],
          [110, 250],
          [160, 265],
          [210, 255],
          [85, 305],
          [175, 310],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="11" className="flow-node" />
        ))}
      </g>

      <path
        d="M160 350 V374"
        className="flow-connector"
        markerEnd="url(#flow-arrow-v)"
      />

      {/* Filters */}
      <g className="flow-stage" data-stage="Filters">
        <text x="20" y="400" className="flow-stage-label">
          Filters
        </text>
        <rect x="20" y="416" width="280" height="140" rx="4" className="flow-panel" />
        <path
          d="M50 440 L110 440 L140 486 L110 532 L50 532 Z"
          className="flow-gate"
        />
        <circle cx="80" cy="470" r="10" className="flow-node" />
        <circle cx="95" cy="505" r="10" className="flow-node" />
        <circle cx="200" cy="460" r="10" className="flow-node flow-node--removed" />
        <circle
          cx="200"
          cy="460"
          r="10"
          fill="url(#flow-hatch-v)"
          className="flow-node-hatch"
        />
        <line x1="190" y1="450" x2="210" y2="470" className="flow-node-strike" />
        <circle cx="245" cy="490" r="10" className="flow-node flow-node--removed" />
        <circle
          cx="245"
          cy="490"
          r="10"
          fill="url(#flow-hatch-v)"
          className="flow-node-hatch"
        />
        <line x1="235" y1="480" x2="255" y2="500" className="flow-node-strike" />
        <circle cx="200" cy="520" r="10" className="flow-node flow-node--removed" />
        <circle
          cx="200"
          cy="520"
          r="10"
          fill="url(#flow-hatch-v)"
          className="flow-node-hatch"
        />
        <line x1="190" y1="510" x2="210" y2="530" className="flow-node-strike" />
        <circle cx="80" cy="525" r="10" className="flow-node" />
      </g>

      <path
        d="M160 566 V590"
        className="flow-connector"
        markerEnd="url(#flow-arrow-v)"
      />

      {/* Ranking */}
      <g className="flow-stage" data-stage="Ranking">
        <text x="20" y="616" className="flow-stage-label">
          Ranking
        </text>
        <rect x="20" y="632" width="280" height="140" rx="4" className="flow-panel" />
        {[
          { y: 652, w: 220, n: '1' },
          { y: 684, w: 170, n: '2' },
          { y: 716, w: 130, n: '3' },
          { y: 748, w: 90, n: '4' },
        ].map((bar) => (
          <g key={bar.n}>
            <text x="36" y={bar.y + 14} className="flow-rank-index">
              {bar.n}
            </text>
            <rect
              x="56"
              y={bar.y}
              width={bar.w}
              height="20"
              rx="2"
              className="flow-rank-bar"
            />
          </g>
        ))}
      </g>

      <path
        d="M160 782 V806"
        className="flow-connector"
        markerEnd="url(#flow-arrow-v)"
      />

      {/* Recommendations */}
      <g className="flow-stage" data-stage="Recommendations">
        <text x="20" y="832" className="flow-stage-label">
          Recommendations
        </text>
        <rect x="20" y="848" width="280" height="110" rx="4" className="flow-panel" />
        <rect
          x="40"
          y="866"
          width="240"
          height="32"
          rx="3"
          className="flow-rec flow-rec--primary"
        />
        <text x="160" y="887" textAnchor="middle" className="flow-rec-label">
          A
        </text>
        <rect x="40" y="906" width="112" height="28" rx="3" className="flow-rec" />
        <text x="96" y="925" textAnchor="middle" className="flow-rec-label">
          B
        </text>
        <rect x="168" y="906" width="112" height="28" rx="3" className="flow-rec" />
        <text x="224" y="925" textAnchor="middle" className="flow-rec-label">
          C
        </text>
      </g>
    </svg>
  )
}

export function SearchFlowExplorer() {
  return (
    <section className="search-flow" aria-labelledby="search-flow-heading">
      <header className="search-flow__header">
        <h2 id="search-flow-heading">Search Flow Explorer</h2>
        <p className="search-flow__lede">
          A static diagram of how a query becomes a small set of explained
          recommendations. Phase A shows structure only—no live data, controls,
          or motion yet.
        </p>
        <p className="search-flow__query">
          <span className="search-flow__query-label">Example query</span>
          <q>{QUERY}</q>
        </p>
      </header>

      <div className="search-flow__diagram" data-testid="search-flow-diagram">
        <DesktopDiagram />
        <MobileDiagram />
      </div>

      <div className="search-flow__equivalent">
        <h3>Textual equivalent</h3>
        <ol>
          <li>
            <strong>Query.</strong> The query is interpreted as meaning plus
            constraints.
          </li>
          <li>
            <strong>Candidates.</strong> A broader set of possible matches is
            gathered.
          </li>
          <li>
            <strong>Filters.</strong> Hard constraints remove incompatible
            items.
          </li>
          <li>
            <strong>Ranking.</strong> Remaining items are ordered by relevance.
          </li>
          <li>
            <strong>Recommendations.</strong> A few options are presented with
            brief explanations—not a single absolute answer.
          </li>
        </ol>
      </div>
    </section>
  )
}

export default SearchFlowExplorer
