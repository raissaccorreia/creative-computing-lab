import { useEffect, useState } from 'react'

import {
  LabShell,
  type ThemeChoice,
} from '@/components/lab-shell'
import { readLabView, type LabView } from '@/lib/lab-navigation'
import CandidateField from './demos/candidate-field/CandidateField'
import CandidateFieldComparison from './demos/candidate-field/CandidateFieldComparison'
import SearchFlowExplorer from './demos/search-flow/SearchFlowExplorer'
import SystemAnatomy from './demos/system-anatomy/SystemAnatomy'
import './App.css'

type ResolvedTheme = Exclude<ThemeChoice, 'system'>

const THEME_STORAGE_KEY = 'creative-computing-lab-theme'

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
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
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
    <LabShell view={view} theme={theme} onToggleTheme={toggleTheme}>
      {view === 'candidate-field' ? (
        <CandidateField />
      ) : view === 'candidate-field-comparison' ? (
        <CandidateFieldComparison />
      ) : view === 'system-anatomy' ? (
        <SystemAnatomy />
      ) : (
        <SearchFlowExplorer />
      )}
    </LabShell>
  )
}

export default App
