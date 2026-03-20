import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCity, useUpdateCity } from '../../hooks/useCities'
import { useListings } from '../../hooks/useListings'
import { useProfile } from '../../hooks/useAuth'
import { useLogAction } from '../../hooks/useActivityLog'
import { useUIStore } from '../../store/ui.store'
import { PropertyRow } from '../ui/PropertyRow'
import { StatusChip, PriorityBadge, UserBadge } from '../ui/StatusChip'
import { Button } from '../ui/Button'
import { ListingCard } from '../listings/ListingCard'
import { AddListingForm } from '../listings/AddListingForm'
import { BulkStatusUpdate } from './BulkStatusUpdate'
import {
  CITY_STATUSES,
  CITY_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  USER_COLORS,
} from '../../lib/constants'
import { formatDate, debounce, isPastOrToday } from '../../lib/utils'
import type { CityStatus, CityPriority, UserName } from '../../types'
import { useCities } from '../../hooks/useCities'

interface InlineSelectProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  renderValue?: (v: T) => React.ReactNode
}

function InlineSelect<T extends string>({ value, options, onChange, renderValue }: InlineSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen((o) => !o)} className="outline-none">
        {renderValue ? renderValue(value) : <span className="text-[13px] text-text">{value}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 mt-1 z-20 bg-surface border border-border-2 rounded-md py-1 min-w-[140px] shadow-none"
          >
            {options.map((o) => (
              <button
                key={o.value}
                className="w-full text-left px-3 py-1.5 text-[12px] text-text-2 hover:text-text hover:bg-subtle/30 transition-colors"
                onClick={() => { onChange(o.value); setOpen(false) }}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CityDetail() {
  const { activeCityId, showScraperPanel, setShowScraperPanel, showExpandable, toggleExpandable, selectedCityIds, addToast } = useUIStore()
  const { data: city, isLoading } = useCity(activeCityId)
  const { data: listings = [] } = useListings(activeCityId)
  const { data: profile } = useProfile()
  const { data: allCities } = useCities()
  const updateCity = useUpdateCity()
  const logAction = useLogAction()

  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const [showAddListing, setShowAddListing] = useState(false)
  const [reminderDate, setReminderDate] = useState('')

  useEffect(() => {
    if (city) {
      setNote(city.note ?? '')
      setTagsInput((city.tags ?? []).join(', '))
      setReminderDate(city.reminder_date ?? '')
    }
  }, [city?.id])

  const saveNote = useCallback(
    debounce(async (value: string, cityId: string, userId: string) => {
      const prev = city?.note ?? ''
      const history = city?.note_history ?? []
      const newHistory = prev ? [prev, ...history].slice(0, 5) : history
      await updateCity.mutateAsync({
        id: cityId,
        note: value,
        note_history: newHistory,
        updated_by: userId,
      })
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 2000)
      await logAction.mutateAsync({ city_id: cityId, user_id: userId, action: `Notiz aktualisiert`, meta: {} })
    }, 800),
    [city?.note, city?.note_history]
  )

  function handleNoteChange(value: string) {
    setNote(value)
    setNoteSaved(false)
    if (city && profile) saveNote(value, city.id, profile.id)
  }

  async function handleStatusChange(status: CityStatus) {
    if (!city || !profile) return
    await updateCity.mutateAsync({ id: city.id, status, updated_by: profile.id })
    await logAction.mutateAsync({ city_id: city.id, user_id: profile.id, action: `Status → ${status}`, meta: { from: city.status, to: status } })
    addToast({ type: 'success', message: `${city.name}: Status → ${STATUS_LABELS[status]}` })
  }

  async function handlePriorityChange(priority: CityPriority) {
    if (!city || !profile) return
    await updateCity.mutateAsync({ id: city.id, priority, updated_by: profile.id })
    await logAction.mutateAsync({ city_id: city.id, user_id: profile.id, action: `Priorität → ${priority}`, meta: {} })
  }

  async function handleAssignChange(userId: string) {
    if (!city || !profile) return
    const assignedProfile = allCities?.find((c) => c.assigned_to === userId)?.assigned_profile
    await updateCity.mutateAsync({ id: city.id, assigned_to: userId || null, updated_by: profile.id })
    await logAction.mutateAsync({ city_id: city.id, user_id: profile.id, action: `Zugewiesen → ${assignedProfile?.name ?? 'niemand'}`, meta: {} })
  }

  async function saveTags() {
    if (!city || !profile) return
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    await updateCity.mutateAsync({ id: city.id, tags, updated_by: profile.id })
  }

  async function saveReminder() {
    if (!city || !profile) return
    await updateCity.mutateAsync({ id: city.id, reminder_date: reminderDate || null, updated_by: profile.id })
    addToast({ type: 'success', message: 'Wiedervorlage gespeichert' })
  }

  const uniqueProfiles = allCities
    ? Array.from(new Map(allCities.filter((c) => c.assigned_profile).map((c) => [c.assigned_to, c.assigned_profile])).values())
    : []

  if (!activeCityId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <div className="text-center space-y-2">
          <p className="text-[13px] text-muted">Stadt auswählen</p>
          <p className="text-[12px] text-subtle">oder "/" drücken zum Suchen</p>
          {selectedCityIds.size > 0 && (
            <div className="mt-4">
              <BulkStatusUpdate />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading || !city) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <div className="w-5 h-5 rounded-full border-2 border-border-2 border-t-text animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      key={city.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="flex-1 overflow-y-auto bg-bg"
    >
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-bold text-text tracking-tight">{city.name}</h1>
            <p className="text-[12px] text-muted mt-0.5">
              Erstellt {formatDate(city.created_at)}
            </p>
          </div>
          {selectedCityIds.size > 1 && (
            <BulkStatusUpdate />
          )}
        </div>

        <div className="space-y-0 border border-border rounded-md overflow-hidden mb-6">
          <PropertyRow label="Status">
            <InlineSelect<CityStatus>
              value={city.status}
              options={CITY_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              onChange={handleStatusChange}
              renderValue={(v) => <StatusChip status={v} />}
            />
          </PropertyRow>

          <PropertyRow label="Priorität">
            <InlineSelect<CityPriority>
              value={city.priority}
              options={CITY_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
              onChange={handlePriorityChange}
              renderValue={(v) => <PriorityBadge priority={v} />}
            />
          </PropertyRow>

          <PropertyRow label="Zugewiesen">
            <div className="flex items-center gap-2 flex-wrap">
              {uniqueProfiles.map((p) => {
                if (!p) return null
                const color = USER_COLORS[p.name as UserName] ?? '#52525b'
                const isAssigned = city.assigned_to === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => handleAssignChange(isAssigned ? '' : p.id)}
                    className="transition-opacity"
                    style={{ opacity: isAssigned ? 1 : 0.4 }}
                  >
                    <UserBadge name={p.name} color={color} />
                  </button>
                )
              })}
              {!city.assigned_to && (
                <span className="text-[12px] text-muted">Nicht zugewiesen</span>
              )}
            </div>
          </PropertyRow>

          <PropertyRow label="Geändert">
            <span className="text-[13px] text-text-2">{formatDate(city.updated_at)}</span>
          </PropertyRow>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-2">Notiz</span>
            {noteSaved && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-green"
              >
                Gespeichert
              </motion.span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Notizen hinzufügen…"
            className="w-full min-h-[100px] bg-surface border border-border-2 rounded-md text-[13px] text-text placeholder:text-muted outline-none focus:border-subtle transition-colors p-3 resize-none"
          />

          {showExpandable && city.note_history && city.note_history.length > 0 && (
            <div className="mt-2 space-y-1">
              <span className="text-[11px] text-muted">Verlauf</span>
              {city.note_history.slice(0, 5).map((h, i) => (
                <div key={i} className="p-2 bg-surface rounded-sm border border-border text-[12px] text-text-2 truncate">
                  {h || <span className="text-muted italic">leer</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {showExpandable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 mb-6"
          >
            <div>
              <span className="text-[12px] font-medium text-text-2 block mb-2">Tags</span>
              <div className="flex gap-2">
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onBlur={saveTags}
                  placeholder="tag1, tag2, tag3"
                  className="flex-1 h-8 bg-surface border border-border-2 rounded-sm text-[13px] text-text placeholder:text-muted outline-none focus:border-subtle transition-colors px-3"
                />
              </div>
              {city.tags && city.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {city.tags.map((tag) => (
                    <span key={tag} className="h-5 px-2 bg-subtle/30 rounded-sm text-[11px] text-text-2 border border-border-2">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="text-[12px] font-medium text-text-2 block mb-2">Wiedervorlage</span>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="h-8 bg-surface border border-border-2 rounded-sm text-[13px] text-text outline-none focus:border-subtle transition-colors px-3"
                />
                <Button variant="secondary" size="sm" onClick={saveReminder}>
                  Speichern
                </Button>
              </div>
              {city.reminder_date && isPastOrToday(city.reminder_date) && (
                <span className="text-[12px] text-amber mt-1 block">⚡ Fällig: {city.reminder_date}</span>
              )}
            </div>
          </motion.div>
        )}

        <button
          onClick={toggleExpandable}
          className="flex items-center gap-1.5 text-[12px] text-muted hover:text-text-2 transition-colors mb-6"
        >
          <span>{showExpandable ? '↑ Weniger' : '↓ Mehr anzeigen'}</span>
        </button>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text">Inserate</span>
              {listings.length > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 bg-subtle/40 rounded-sm text-[11px] text-text-2 flex items-center justify-center">
                  {listings.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showScraperPanel && (
                <Button variant="ghost" size="sm" onClick={() => setShowScraperPanel(false)}>
                  Abbrechen
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowScraperPanel(true)
                  setShowAddListing(true)
                }}
              >
                + Inserat
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {(showScraperPanel || showAddListing) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden mb-4"
              >
                <AddListingForm
                  cityId={city.id}
                  onClose={() => { setShowScraperPanel(false); setShowAddListing(false) }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {listings.length === 0 && !showAddListing ? (
              <p className="text-[12px] text-muted py-4 text-center">
                Noch keine Inserate. Klicke "+ Inserat" zum Hinzufügen.
              </p>
            ) : (
              listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} cityId={city.id} />
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
