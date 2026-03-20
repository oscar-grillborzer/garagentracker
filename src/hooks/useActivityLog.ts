import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ActivityLog } from '../types'

export function useActivityLog(limit = 100) {
  return useQuery({
    queryKey: ['activity_log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          profiles!activity_log_user_id_fkey(id, name, color),
          cities!activity_log_city_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return ((data ?? []) as unknown[]).map((l) => {
        const row = l as Record<string, unknown>
        return { ...row, profiles: row['profiles'], cities: row['cities'] }
      }) as ActivityLog[]
    },
  })
}

interface LogActionPayload {
  city_id?: string | null
  user_id: string
  action: string
  meta?: Record<string, unknown>
}

export function useLogAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LogActionPayload) => {
      const { error } = await supabase.from('activity_log').insert({
        city_id: payload.city_id ?? null,
        user_id: payload.user_id,
        action: payload.action,
        meta: payload.meta ?? {},
        created_at: new Date().toISOString(),
      } as Record<string, unknown>)
      if (error) throw error
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['activity_log'] })
    },
  })
}
