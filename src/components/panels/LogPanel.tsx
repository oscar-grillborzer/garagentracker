import { motion, AnimatePresence } from 'framer-motion'
import { useActivityLog } from '../../hooks/useActivityLog'
import { useUIStore } from '../../store/ui.store'
import { formatTimestamp } from '../../lib/utils'
import { USER_COLORS } from '../../lib/constants'
import type { UserName } from '../../types'

export function LogPanel() {
  const { data: logs = [], isLoading } = useActivityLog(200)
  const { setActiveTab, setActiveCityId } = useUIStore()

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[18px] font-bold text-text tracking-tight mb-6">
          Aktivitätslog
        </h1>

        {isLoading ? (
          <div className="flex items-center gap-2 text-text-2 text-[13px]">
            <div className="w-4 h-4 rounded-full border-2 border-border-2 border-t-text animate-spin" />
            Lade…
          </div>
        ) : logs.length === 0 ? (
          <p className="text-[13px] text-muted">Noch keine Aktivitäten.</p>
        ) : (
          <div className="space-y-px">
            <AnimatePresence initial={false} mode="popLayout">
              {logs.map((log, i) => {
                const userColor = log.profiles
                  ? USER_COLORS[log.profiles.name as UserName] ?? '#52525b'
                  : '#52525b'
                const userName = log.profiles?.name ?? 'Unbekannt'

                return (
                  <motion.div
                    key={log.id}
                    initial={i === 0 ? { opacity: 0, y: -8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-start gap-4 py-2.5 border-b border-border group"
                  >
                    <span className="w-28 shrink-0 text-[11px] font-mono text-muted tabular-nums pt-0.5">
                      {formatTimestamp(log.created_at)}
                    </span>

                    <span
                      className="shrink-0 text-[12px] font-medium w-14"
                      style={{ color: userColor }}
                    >
                      {userName}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-text-2">
                        {log.cities && (
                          <button
                            className="text-text font-medium hover:underline mr-1"
                            onClick={() => {
                              setActiveTab('staedte')
                              setActiveCityId(log.city_id!)
                            }}
                          >
                            {log.cities.name}
                          </button>
                        )}
                        {log.action}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
