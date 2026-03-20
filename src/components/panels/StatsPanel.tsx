import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCities } from '../../hooks/useCities'
import { useProfile } from '../../hooks/useAuth'
import { useUIStore } from '../../store/ui.store'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CITY_STATUSES,
} from '../../lib/constants'
import type { CityStatus } from '../../types'
import * as XLSX from 'xlsx'
import { Button } from '../ui/Button'

interface KpiCardProps {
  label: string
  value: number | string
  color?: string
  subtext?: string
}

function KpiCard({ label, value, color, subtext }: KpiCardProps) {
  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <div className="text-[12px] text-text-2 mb-1">{label}</div>
      <div
        className="text-[24px] font-bold font-mono"
        style={{ color: color ?? '#fafafa' }}
      >
        {value}
      </div>
      {subtext && <div className="text-[11px] text-muted mt-0.5">{subtext}</div>}
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  total: number
  color: string
  index: number
}

function ProgressBar({ label, value, total, color, index }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[12px] text-text-2">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-text">{value}</span>
          <span className="text-[11px] text-muted">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-border-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

function ReminderSection() {
  const { data: cities = [] } = useCities()
  const { setActiveTab, setActiveCityId } = useUIStore()
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const due = cities.filter(
    (c) => c.reminder_date && new Date(c.reminder_date) <= today
  )

  if (due.length === 0) return null

  return (
    <div className="bg-amber/5 border border-amber/20 rounded-md p-4">
      <h2 className="text-[13px] font-semibold text-amber mb-3">⚡ Fällig heute</h2>
      <div className="space-y-2">
        {due.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveTab('staedte'); setActiveCityId(c.id) }}
            className="w-full text-left flex items-center justify-between py-1.5 text-[12px] text-text-2 hover:text-text transition-colors"
          >
            <span>{c.name}</span>
            <span className="text-amber font-mono">{c.reminder_date}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function StatsPanel() {
  const { data: cities = [] } = useCities()
  const { data: profile } = useProfile()
  const { addToast } = useUIStore()

  const stats = useMemo(() => {
    const total = cities.length
    const byStatus: Record<CityStatus, number> = {
      offen: 0,
      kontaktiert: 0,
      interessant: 0,
      verhandlung: 0,
      gekauft: 0,
      abgesagt: 0,
    }
    let totalListings = 0
    for (const c of cities) {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1
      totalListings += c.listing_count ?? 0
    }
    const processed = total - byStatus.offen
    const pct = total > 0 ? Math.round((processed / total) * 100) : 0
    return { total, byStatus, pct, totalListings, processed }
  }, [cities])

  const topCities = useMemo(
    () =>
      [...cities]
        .filter((c) => (c.listing_count ?? 0) > 0)
        .sort((a, b) => (b.listing_count ?? 0) - (a.listing_count ?? 0))
        .slice(0, 10),
    [cities]
  )

  function handleExport() {
    const rows = cities.map((c) => ({
      Stadt: c.name,
      Status: STATUS_LABELS[c.status],
      Priorität: c.priority,
      Zugewiesen: c.assigned_profile?.name ?? '',
      Inserate: c.listing_count ?? 0,
      Notiz: c.note ?? '',
      Geändert: c.updated_at,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Städte')
    XLSX.writeFile(wb, `garagentracker-${new Date().toISOString().split('T')[0]}.xlsx`)
    addToast({ type: 'success', message: 'Export erfolgreich' })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-text tracking-tight">Übersicht</h1>
          {profile && (
            <Button variant="secondary" size="sm" onClick={handleExport}>
              ↓ Excel Export
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard label="Gesamt" value={stats.total} />
          <KpiCard label="Abgearbeitet" value={`${stats.pct}%`} color="#4ade80" subtext={`${stats.processed} von ${stats.total}`} />
          <KpiCard label="Kontaktiert" value={stats.byStatus.kontaktiert} color="#22d3ee" />
          <KpiCard label="Interessant" value={stats.byStatus.interessant} color="#a78bfa" />
          <KpiCard label="Verhandlung" value={stats.byStatus.verhandlung} color="#f59e0b" />
          <KpiCard label="Gekauft" value={stats.byStatus.gekauft} color="#4ade80" />
          <KpiCard label="Abgesagt" value={stats.byStatus.abgesagt} color="#f87171" />
          <KpiCard label="Inserate gesamt" value={stats.totalListings} color="#fafafa" />
        </div>

        <div className="bg-surface border border-border rounded-md p-5">
          <h2 className="text-[13px] font-semibold text-text mb-5">Status-Verteilung</h2>
          <div className="space-y-4">
            {CITY_STATUSES.map((s, i) => (
              <ProgressBar
                key={s}
                label={STATUS_LABELS[s]}
                value={stats.byStatus[s]}
                total={stats.total}
                color={STATUS_COLORS[s]}
                index={i}
              />
            ))}
          </div>
        </div>

        {topCities.length > 0 && (
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-[13px] font-semibold text-text">Top Städte nach Inseraten</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2 text-[11px] font-medium text-muted">#</th>
                  <th className="text-left px-5 py-2 text-[11px] font-medium text-muted">Stadt</th>
                  <th className="text-left px-5 py-2 text-[11px] font-medium text-muted">Status</th>
                  <th className="text-right px-5 py-2 text-[11px] font-medium text-muted">Inserate</th>
                </tr>
              </thead>
              <tbody>
                {topCities.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-surface/80 transition-colors"
                  >
                    <td className="px-5 py-2.5 text-[12px] text-muted font-mono">{i + 1}</td>
                    <td className="px-5 py-2.5 text-[13px] text-text font-medium">{c.name}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: STATUS_COLORS[c.status] }}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right text-[13px] font-mono font-bold text-text">
                      {c.listing_count}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ReminderSection />
      </div>
    </div>
  )
}
