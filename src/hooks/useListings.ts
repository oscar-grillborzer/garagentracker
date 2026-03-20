import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Listing } from '../types'

export function useListings(cityId: string | null) {
  return useQuery({
    queryKey: ['listings', cityId],
    queryFn: async () => {
      if (!cityId) return []
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles!listings_added_by_fkey(id, name, color)')
        .eq('city_id', cityId)
        .order('added_at', { ascending: false })
      if (error) throw error
      return ((data ?? []) as unknown[]).map((l) => {
        const row = l as Record<string, unknown>
        return { ...row, profiles: row['profiles'] }
      }) as Listing[]
    },
    enabled: !!cityId,
  })
}

interface AddListingPayload {
  city_id: string
  url?: string | null
  price?: number | null
  size_sqm?: number | null
  phone?: string | null
  note?: string | null
  source?: string | null
  scraped?: boolean
  added_by: string
}

export function useAddListing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AddListingPayload) => {
      const { data, error } = await supabase
        .from('listings')
        .insert({ ...payload, added_at: new Date().toISOString() } as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Listing
    },
    onSuccess: (_data, payload) => {
      qc.invalidateQueries({ queryKey: ['listings', payload.city_id] })
      qc.invalidateQueries({ queryKey: ['cities'] })
    },
  })
}

export function useDeleteListing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, cityId }: { id: string; cityId: string }) => {
      const { error } = await supabase.from('listings').delete().eq('id', id)
      if (error) throw error
      return cityId
    },
    onSuccess: (cityId) => {
      qc.invalidateQueries({ queryKey: ['listings', cityId] })
      qc.invalidateQueries({ queryKey: ['cities'] })
    },
  })
}

export function useUpdateListing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      cityId,
      ...updates
    }: Partial<Listing> & { id: string; cityId: string }) => {
      const { data, error } = await supabase
        .from('listings')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Listing
    },
    onSuccess: (_data, payload) => {
      qc.invalidateQueries({ queryKey: ['listings', payload.cityId] })
    },
  })
}
