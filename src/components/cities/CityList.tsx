import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCities } from '../../hooks/useCities'
import { useUIStore } from '../../store/ui.store'
import { CityRow } from './CityRow'
import { SkeletonRow } from '../ui/Skeleton'
import { CITY_STATUSES, STATUS_LABELS, STATUS_COLORS, USER_COLORS } from '../../lib/constants'
import type { City, CityStatus, UserName } from '../../types'

function sortCities(cities: City[], sortBy: string, sortDir: string): City[] {
  return [...cities].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name, 'de')
    else if (sortBy === 'priority') {
      const order = { hoch: 0, mittel: 1, niedrig: 2 }
      cmp = (order[a.priority] ?? 1) - (order[b.priority] ?? 1)
    } else if (sortBy === 'listing_count') {
      cmp = (b.listing_count ?? 0) - (a.listing_count ?? 0)
    } else if (sortBy === 'updated_at') {
      cmp = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
    return sortDir === 'desc' ? -cmp : cmp
  })
}

export function CityList() {
  const { data: cities, isLoading } = useCities()
  const {
    activeCityId,
    setActiveCityId,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterAssignedTo,
    setFilterAssignedTo,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    selectedCityIds,
    toggleSelectedCity,
    clearSelectedCities,
    selectAllCities,
  } = useUIStore()

  const searchRef = useRef<HTMLInputElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchQuery('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchQuery])

  const filtered = useMemo(() => {
    if (!cities) return []
    let list = cities
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    if (filterStatus) {
      list = list.filter((c) => c.status === filterStatus)
    }
    if (filterAssignedTo) {
      list = list.filter((c) => c.assigned_to === filterAssignedTo)
    }
    return sortCities(list, sortBy, sortDir)
  }, [cities, searchQuery, filterStatus, filterAssignedTo, sortBy, sortDir])

  const processedCount = useMemo(
    () => (cities ?? []).filter((c) => c.status !== 'offen').length,
    [cities]
  )
  const total = cities?.length ?? 0
  const pct = total > 0 ? Math.round((processedCount / total) * 100) : 0

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 37,
    overscan: 8,
  })

  const uniqueUsers = useMemo(() => {
    if (!cities) return []
    const seen = new Set<string>()
    return cities
      .filter((c) => c.assigned_profile && !seen.has(c.assigned_to!) && seen.add(c.assigned_to!))
      .map((c) => c.assigned_profile!)
  }, [cities])

  const handleToggleSelect = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    toggleSelectedCity(id)
  }, [toggleSelectedCity])

  const handleSelectAll = useCallback(() => {
    if (selectedCityIds.size === filtered.length && filtered.length > 0) {
      clearSelectedCities()
    } else {
      selectAllCities(filtered.map((c) => c.id))
    }
  }, [selectedCityIds.size, filtered, clearSelectedCities, selectAllCities])

  return (
    <div className="w-[280px] shrink-0 border-r border-border flex flex-col h-full bg-bg">
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Suchen  "/"'
            className="w-full h-7 bg-surface border border-border-2 rounded-sm pl-8 pr-3 text-[12px] text-text placeholder:text-muted outline-none focus:border-subtle transition-colors"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterStatus(null)}
            className="h-5 px-2 rounded-sm text-[11px] font-medium transition-colors border"
            style={{
              color: filterStatus === null ? '#fafafa' : '#52525b',
              borderColor: filterStatus === null ? '#27272a' : '#1c1c1f',
              backgroundColor: filterStatus === null ? '#27272a' : 'transparent',
            }}
          >
            Alle
          </button>
          {CITY_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
              className="h-5 px-2 rounded-sm text-[11px] font-medium transition-colors border"
              style={{
                color: filterStatus === s ? STATUS_COLORS[s] : '#52525b',
                borderColor: filterStatus === s ? `${STATUS_COLORS[s]}40` : '#1c1c1f',
                backgroundColor: filterStatus === s ? `${STATUS_COLORS[s]}15` : 'transparent',
              }}
            >
              {STATUS_LABELS[s as CityStatus]}
            </button>
          ))}
        </div>

        {uniqueUsers.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterAssignedTo(null)}
              className="h-5 px-2 rounded-sm text-[11px] font-medium border transition-colors"
              style={{
                color: filterAssignedTo === null ? '#fafafa' : '#52525b',
                borderColor: filterAssignedTo === null ? '#27272a' : '#1c1c1f',
                backgroundColor: filterAssignedTo === null ? '#27272a' : 'transparent',
              }}
            >
              Alle
            </button>
            {uniqueUsers.map((u) => {
              const color = USER_COLORS[u.name as UserName] ?? '#52525b'
              return (
                <button
                  key={u.id}
                  onClick={() => setFilterAssignedTo(filterAssignedTo === u.id ? null : u.id)}
                  className="h-5 px-2 rounded-sm text-[11px] font-medium border transition-colors"
                  style={{
                    color: filterAssignedTo === u.id ? color : '#52525b',
                    borderColor: filterAssignedTo === u.id ? `${color}40` : '#1c1c1f',
                    backgroundColor: filterAssignedTo === u.id ? `${color}15` : 'transparent',
                  }}
                >
                  {u.name}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-6 bg-transparent border border-border-2 rounded-sm text-[11px] text-text-2 outline-none px-1.5 cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="priority">Priorität</option>
              <option value="listing_count">Inserate</option>
              <option value="updated_at">Geändert</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="h-6 w-6 border border-border-2 rounded-sm flex items-center justify-center text-text-2 hover:text-text transition-colors"
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <span className="text-[11px] text-muted">
            {filtered.length}/{total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-border-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-green transition-all duration-700 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-text-2 shrink-0">{pct}%</span>
        </div>
      </div>

      {selectedCityIds.size > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-subtle/20 border-b border-border">
          <span className="text-[12px] text-text-2">{selectedCityIds.size} ausgewählt</span>
          <button
            onClick={clearSelectedCities}
            className="text-[11px] text-muted hover:text-text-2 transition-colors"
          >
            Abwählen
          </button>
        </div>
      )}

      <div
        className="flex items-center gap-2 px-3 py-1 border-b border-border cursor-pointer hover:bg-surface/60 transition-colors"
        onClick={handleSelectAll}
      >
        <div
          className="shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors"
          style={{
            borderColor: selectedCityIds.size === filtered.length && filtered.length > 0 ? '#4ade80' : '#27272a',
            backgroundColor: selectedCityIds.size === filtered.length && filtered.length > 0 ? '#4ade8020' : 'transparent',
          }}
        >
          {selectedCityIds.size === filtered.length && filtered.length > 0 && (
            <svg className="w-2.5 h-2.5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-[11px] text-muted">Alle auswählen</span>
      </div>

      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[12px] text-muted">
            Keine Städte gefunden
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const city = filtered[vi.index]
              return (
                <div
                  key={vi.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  <CityRow
                    city={city}
                    isActive={activeCityId === city.id}
                    isSelected={selectedCityIds.has(city.id)}
                    onSelect={() => {
                      setActiveCityId(city.id)
                    }}
                    onToggleSelect={(e) => handleToggleSelect(e, city.id)}
                    index={vi.index}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
