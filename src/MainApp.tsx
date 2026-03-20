import { useEffect } from 'react'
import { Topbar } from './components/layout/Topbar'
import { CityList } from './components/cities/CityList'
import { CityDetail } from './components/cities/CityDetail'
import { StatsPanel } from './components/panels/StatsPanel'
import { LogPanel } from './components/panels/LogPanel'
import { ToastContainer } from './components/ui/Toast'
import { useRealtime } from './hooks/useRealtime'
import { useUIStore } from './store/ui.store'
import type { Profile } from './types'

interface MainAppProps {
  profile: Profile
}

export function MainApp({ profile }: MainAppProps) {
  const { activeTab, sidebarOpen, setSidebarOpen, activeCityId, setActiveCityId } = useUIStore()
  useRealtime(profile.id)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && activeCityId) {
        setActiveCityId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeCityId, setActiveCityId])

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <Topbar />

      <div className="flex flex-1 min-h-0 relative">
        {activeTab === 'staedte' && (
          <>
            <div
              className={`
                ${sidebarOpen ? 'block' : 'hidden'}
                md:block
                absolute md:relative
                z-30 md:z-auto
                w-[280px] h-full
                border-r border-border bg-bg
              `}
            >
              <CityList />
            </div>

            {sidebarOpen && (
              <div
                className="md:hidden fixed inset-0 z-20 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <CityDetail />
          </>
        )}

        {activeTab === 'uebersicht' && <StatsPanel />}
        {activeTab === 'log' && <LogPanel />}
      </div>

      <ToastContainer />
    </div>
  )
}
