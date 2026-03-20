import { motion } from 'framer-motion'
import { useUIStore } from '../../store/ui.store'
import { useProfile, useSignOut } from '../../hooks/useAuth'
import { USER_COLORS } from '../../lib/constants'
import type { Tab, UserName } from '../../types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'staedte', label: 'Städte' },
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'log', label: 'Log' },
]

export function Topbar() {
  const { activeTab, setActiveTab, setSidebarOpen, sidebarOpen } = useUIStore()
  const { data: profile } = useProfile()
  const signOut = useSignOut()

  return (
    <header className="h-11 border-b border-border flex items-center px-4 gap-4 shrink-0 bg-bg">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden text-text-2 hover:text-text transition-colors mr-1"
        aria-label="Sidebar umschalten"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-5 h-5 rounded-sm bg-green/20 border border-green/30 flex items-center justify-center">
          <span className="text-green text-[9px] font-bold">G</span>
        </div>
        <span className="text-[13px] font-semibold text-text hidden sm:block tracking-tight">
          Garagentracker
        </span>
      </div>

      <nav className="flex items-center gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-3 h-8 text-[13px] font-medium transition-colors rounded-sm"
            style={{ color: activeTab === tab.id ? '#fafafa' : '#a1a1aa' }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-1 left-3 right-3 h-px bg-text"
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
          </span>
          <span className="text-[12px] text-text-2 hidden sm:block">Live</span>
        </div>

        {profile && (
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] font-medium px-2 h-6 rounded-sm border flex items-center"
              style={{
                color: USER_COLORS[profile.name as UserName] ?? '#fafafa',
                borderColor: `${USER_COLORS[profile.name as UserName] ?? '#fafafa'}30`,
                backgroundColor: `${USER_COLORS[profile.name as UserName] ?? '#fafafa'}12`,
              }}
            >
              {profile.name}
            </span>
            <button
              onClick={() => signOut.mutate()}
              className="text-[12px] text-muted hover:text-text-2 transition-colors"
              title="Abmelden"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
