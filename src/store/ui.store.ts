import { create } from 'zustand'
import type { Tab, ToastItem } from '../types'

interface UIState {
  activeTab: Tab
  activeCityId: string | null
  showScraperPanel: boolean
  showExpandable: boolean
  searchQuery: string
  filterStatus: string | null
  filterAssignedTo: string | null
  sortBy: 'name' | 'priority' | 'listing_count' | 'updated_at'
  sortDir: 'asc' | 'desc'
  selectedCityIds: Set<string>
  toasts: ToastItem[]
  sidebarOpen: boolean

  setActiveTab: (tab: Tab) => void
  setActiveCityId: (id: string | null) => void
  setShowScraperPanel: (show: boolean) => void
  toggleExpandable: () => void
  setSearchQuery: (q: string) => void
  setFilterStatus: (status: string | null) => void
  setFilterAssignedTo: (userId: string | null) => void
  setSortBy: (sort: UIState['sortBy']) => void
  setSortDir: (dir: UIState['sortDir']) => void
  toggleSelectedCity: (id: string) => void
  clearSelectedCities: () => void
  selectAllCities: (ids: string[]) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'staedte',
  activeCityId: null,
  showScraperPanel: false,
  showExpandable: false,
  searchQuery: '',
  filterStatus: null,
  filterAssignedTo: null,
  sortBy: 'name',
  sortDir: 'asc',
  selectedCityIds: new Set(),
  toasts: [],
  sidebarOpen: true,

  setActiveTab: (tab) => set({ activeTab: tab, activeCityId: null }),
  setActiveCityId: (id) => set({ activeCityId: id, showScraperPanel: false }),
  setShowScraperPanel: (show) => set({ showScraperPanel: show }),
  toggleExpandable: () => set((s) => ({ showExpandable: !s.showExpandable })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterAssignedTo: (userId) => set({ filterAssignedTo: userId }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortDir: (dir) => set({ sortDir: dir }),
  toggleSelectedCity: (id) =>
    set((s) => {
      const next = new Set(s.selectedCityIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedCityIds: next }
    }),
  clearSelectedCities: () => set({ selectedCityIds: new Set() }),
  selectAllCities: (ids) => set({ selectedCityIds: new Set(ids) }),
  addToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: crypto.randomUUID() },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
