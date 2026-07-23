import SearchFlowExplorer from './demos/search-flow/SearchFlowExplorer'
import './App.css'

function App() {
  return (
    <main>
      <header className="lab-intro">
        <h1>Creative Computing Lab</h1>
        <p>
          A public lab for small experiments in SVG, motion, Canvas, 3D, and
          WebGPU.
        </p>
      </header>
      <SearchFlowExplorer />
    </main>
  )
}

export default App
