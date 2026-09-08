import { useEffect, useState } from 'react'
import CandidateField from './demos/candidate-field/CandidateField'
import CandidateFieldComparison from './demos/candidate-field/CandidateFieldComparison'
import SearchFlowExplorer from './demos/search-flow/SearchFlowExplorer'
import './App.css'

type ThemeChoice = 'light' | 'dark' | 'system'
type ResolvedTheme = Exclude<ThemeChoice, 'system'>

const THEME_STORAGE_KEY = 'creative-computing-lab-theme'

type LabView = 'search-flow' | 'candidate-field' | 'candidate-field-comparison'

function readLabView(): LabView {
  if (typeof window === 'undefined') return 'search-flow'
  const demo = new URLSearchParams(window.location.search).get('demo')
  if (demo === 'candidate-field-comparison') return 'candidate-field-comparison'
  if (demo === 'candidate-field') return 'candidate-field'
  return 'search-flow'
}

function readStoredTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // Storage can be unavailable in a restricted browser context.
  }
  return 'system'
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" />
      </svg>
    )
  }

  if (theme === 'light') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a9 9 0 0 0 0 18V3Z" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function ThemeToggle({ theme, onToggle }: { theme: ThemeChoice; onToggle: () => void }) {
  const label = `Theme: ${theme}. Activate to use ${
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  } theme.`

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      data-theme-choice={theme}
      onClick={onToggle}
    >
      <ThemeIcon theme={theme} />
      <span className="theme-toggle__text">{theme}</span>
    </button>
  )
}

function App() {
  const [theme, setTheme] = useState<ThemeChoice>(() =>
    typeof window === 'undefined' ? 'system' : readStoredTheme(),
  )
  const [view, setView] = useState<LabView>(readLabView)

  useEffect(() => {
    const handleNavigation = () => setView(readLabView())
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolvedTheme: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme
      document.documentElement.dataset.theme = resolvedTheme
      document.documentElement.style.colorScheme = resolvedTheme
    }

    applyTheme()
    const handleSystemThemeChange = () => {
      if (theme === 'system') applyTheme()
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage can be unavailable in a restricted browser context.
    }

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) =>
      current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light',
    )
  }

  return (
    <main>
      <div className="lab-topbar">
        <header className="lab-intro">
          <h1>Creative Computing Lab</h1>
          <p>
            A public lab for small experiments in SVG, motion, Canvas, 3D, and
            WebGPU.
          </p>
        </header>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
      <nav className="lab-nav" aria-label="Experiments">
        <a href="/" aria-current={view === 'search-flow' ? 'page' : undefined}>
          Search Flow Explorer
        </a>
        <a
          href="/?demo=candidate-field"
          aria-current={view === 'candidate-field' ? 'page' : undefined}
        >
          Candidate Field
        </a>
        <a
          href="/?demo=candidate-field-comparison"
          aria-current={view === 'candidate-field-comparison' ? 'page' : undefined}
        >
          Candidate Field Comparison
        </a>
      </nav>
      {view === 'candidate-field' ? (
        <CandidateField />
      ) : view === 'candidate-field-comparison' ? (
        <CandidateFieldComparison />
      ) : (
        <SearchFlowExplorer />
      )}
    </main>
  )
}

export default App
