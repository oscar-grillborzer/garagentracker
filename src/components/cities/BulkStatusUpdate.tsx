import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBulkUpdateStatus } from '../../hooks/useCities'
import { useLogAction } from '../../hooks/useActivityLog'
import { useProfile } from '../../hooks/useAuth'
import { useUIStore } from '../../store/ui.store'
import { Button } from '../ui/Button'
import { CITY_STATUSES, STATUS_LABELS, STATUS_COLORS } from '../../lib/constants'
import type { CityStatus } from '../../types'

export function BulkStatusUpdate() {
  const { selectedCityIds, clearSelectedCities, addToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const bulkUpdate = useBulkUpdateStatus()
  const { data: profile } = useProfile()
  const logAction = useLogAction()

  async function apply(status: CityStatus) {
    const ids = Array.from(selectedCityIds)
    if (!profile || ids.length === 0) return
    await bulkUpdate.mutateAsync({ ids, status })
    await logAction.mutateAsync({
      user_id: profile.id,
      action: `Bulk: ${ids.length} Städte → ${status}`,
      meta: { ids, status },
    })
    addToast({ type: 'success', message: `${ids.length} Städte → ${STATUS_LABELS[status]}` })
    clearSelectedCities()
    setOpen(false)
  }

  if (selectedCityIds.size === 0) return null

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
        {selectedCityIds.size} ausgewählt · Status setzen
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 mt-1 z-20 bg-surface border border-border-2 rounded-md py-1 min-w-[160px]"
          >
            {CITY_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => apply(s)}
                disabled={bulkUpdate.isPending}
                className="w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 hover:bg-subtle/30 transition-colors disabled:opacity-40"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[s] }}
                />
                <span style={{ color: STATUS_COLORS[s] }}>{STATUS_LABELS[s]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
