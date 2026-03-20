import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { City, CityStatus, CityPriority } from '../types'

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          profiles!cities_assigned_to_fkey(id, name, color),
          listings(count)
        `)
        .order('name', { ascending: true })
      if (error) throw error
      return ((data ?? []) as unknown[]).map((c) => {
        const city = c as Record<string, unknown>
        return {
          ...city,
          assigned_profile: city['profiles'],
          listing_count: ((city['listings'] as Array<{ count: number }>)[0]?.count ?? 0),
        }
      }) as City[]
    },
  })
}

export function useCity(id: string | null) {
  return useQuery({
    queryKey: ['city', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          profiles!cities_assigned_to_fkey(id, name, color)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      const row = data as unknown as Record<string, unknown>
      return { ...row, assigned_profile: row['profiles'] } as unknown as City
    },
    enabled: !!id,
  })
}

interface UpdateCityPayload {
  id: string
  status?: CityStatus
  priority?: CityPriority
  assigned_to?: string | null
  note?: string
  tags?: string[]
  reminder_date?: string | null
  note_history?: string[]
  updated_by?: string
  updated_at?: string
}

export function useUpdateCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateCityPayload) => {
      const { id, ...updates } = payload
      const { data, error } = await supabase
        .from('cities')
        .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as City
    },
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ['cities'] })
      await qc.cancelQueries({ queryKey: ['city', payload.id] })
      const prev = qc.getQueryData<City[]>(['cities'])
      const prevCity = qc.getQueryData<City>(['city', payload.id])
      if (prev) {
        qc.setQueryData<City[]>(['cities'], (old) =>
          (old ?? []).map((c) =>
            c.id === payload.id ? { ...c, ...payload, updated_at: new Date().toISOString() } : c
          )
        )
      }
      if (prevCity) {
        qc.setQueryData<City>(['city', payload.id], (old) =>
          old ? { ...old, ...payload, updated_at: new Date().toISOString() } : old
        )
      }
      return { prev, prevCity }
    },
    onError: (_err, payload, ctx) => {
      if (ctx?.prev) qc.setQueryData(['cities'], ctx.prev)
      if (ctx?.prevCity) qc.setQueryData(['city', payload.id], ctx.prevCity)
    },
    onSettled: (_data, _err, payload) => {
      qc.invalidateQueries({ queryKey: ['cities'] })
      qc.invalidateQueries({ queryKey: ['city', payload.id] })
    },
  })
}

export function useBulkUpdateStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: CityStatus }) => {
      const { error } = await supabase
        .from('cities')
        .update({ status, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .in('id', ids)
      if (error) throw error
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['cities'] })
    },
  })
}
