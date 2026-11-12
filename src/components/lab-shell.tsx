import type { CSSProperties, ReactNode } from 'react'
import {
  Monitor,
  Moon,
  Sun,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  getActiveExperiment,
  LAB_EXPERIMENTS,
  type LabExperiment,
  type LabView,
} from '@/lib/lab-navigation'

export type ThemeChoice = 'light' | 'dark' | 'system'

const SIDEBAR_SIZES = {
  '--sidebar-width': '17rem',
  '--sidebar-width-icon': '3.5rem',
} as CSSProperties

// The sidebar primitive writes this cookie whenever the desktop state changes.
function readSidebarOpen() {
  if (typeof document === 'undefined') return true
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/)
  return match ? match[1] === 'true' : true
}

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: ThemeChoice
  onToggle: () => void
}) {
  const label = `Theme: ${theme}. Activate to use ${
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  } theme.`
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="theme-toggle"
      aria-label={label}
      title={label}
      data-theme-choice={theme}
      onClick={onToggle}
    >
      <Icon aria-hidden="true" />
      <span className="theme-toggle__text">{theme}</span>
    </Button>
  )
}

function SidebarCloseButton() {
  const { isMobile, setOpenMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="lab-sidebar__close"
      aria-label="Close experiments menu"
      onClick={() => setOpenMobile(false)}
    >
      <X aria-hidden="true" />
    </Button>
  )
}

function LabNavigation({ view }: { view: LabView }) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarMenu>
      {LAB_EXPERIMENTS.map((experiment) => {
        const Icon = experiment.icon
        const isActive = experiment.id === view

        return (
          <SidebarMenuItem key={experiment.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={experiment.label}
              className="lab-sidebar__link"
            >
              <a
                href={experiment.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <Icon aria-hidden="true" />
                <span>{experiment.label}</span>
              </a>
            </SidebarMenuButton>
            <p className="lab-sidebar__description">{experiment.description}</p>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function LabMainbar({
  activeExperiment,
  theme,
  onToggleTheme,
}: {
  activeExperiment: LabExperiment
  theme: ThemeChoice
  onToggleTheme: () => void
}) {
  const { isMobile, open, openMobile } = useSidebar()
  const triggerLabel = isMobile
    ? openMobile
      ? 'Close experiments menu'
      : 'Open experiments menu'
    : open
      ? 'Collapse experiments menu'
      : 'Expand experiments menu'

  return (
    <header className="lab-mainbar">
      <div className="lab-mainbar__leading">
        <SidebarTrigger
          className="lab-mainbar__trigger"
          aria-label={triggerLabel}
          aria-expanded={isMobile ? openMobile : open}
          aria-keyshortcuts="Control+B Meta+B"
          title={`${triggerLabel} (Ctrl/⌘ B)`}
        />
        <div className="lab-mainbar__context">
          <h1>Creative Computing Lab</h1>
          <div className="lab-mainbar__active">
            <strong>{activeExperiment.label}</strong>
          </div>
        </div>
      </div>
      <div className="lab-mainbar__actions">
        <span className="lab-mainbar__status">LOCAL / SYNTHETIC DATA</span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

export function LabShell({
  view,
  theme,
  onToggleTheme,
  children,
}: {
  view: LabView
  theme: ThemeChoice
  onToggleTheme: () => void
  children: ReactNode
}) {
  const activeExperiment = getActiveExperiment(view)

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        defaultOpen={readSidebarOpen()}
        className="lab-sidebar-provider"
        style={SIDEBAR_SIZES}
      >
        <Sidebar
          collapsible="icon"
          className="lab-sidebar"
          role="complementary"
          aria-label="Creative Computing Lab navigation"
        >
          <SidebarHeader className="lab-sidebar__header">
            <div className="lab-sidebar__brand-row">
              <a href="/" className="lab-sidebar__brand">
                <span className="lab-sidebar__mark" aria-hidden="true">
                  CC
                </span>
                <span className="lab-sidebar__brand-copy">
                  <strong>Creative Computing</strong>
                  <span>Lab</span>
                </span>
              </a>
              <SidebarCloseButton />
            </div>
            <p>Small, bounded experiments in visual computing and interface design.</p>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent className="lab-sidebar__content">
            <nav aria-label="Experiments">
              <SidebarGroup className="lab-sidebar__group">
                <SidebarGroupLabel>Experiments</SidebarGroupLabel>
                <SidebarGroupContent>
                  <LabNavigation view={view} />
                </SidebarGroupContent>
              </SidebarGroup>
            </nav>
          </SidebarContent>
          <SidebarFooter className="lab-sidebar__footer">
            <SidebarSeparator />
            <div className="lab-sidebar__note">
              <span className="lab-sidebar__note-dot" aria-hidden="true" />
              <p>
                {LAB_EXPERIMENTS.length} public experiments. Synthetic data only.
              </p>
            </div>
            <p className="lab-sidebar__workspace">Creative Computing Lab · local workspace</p>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="lab-shell">
          <LabMainbar
            activeExperiment={activeExperiment}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
          <div className="lab-content">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
