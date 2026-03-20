import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../store/ui.store'
import type { Profile } from '../types'

export function useRealtime(currentUserId: string | null) {
  const qc = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel('realtime-all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cities' },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['cities'] })
          const newCity = payload.new as Record<string, unknown>
          const oldCity = payload.old as Record<string, unknown>
          const updatedBy = newCity['updated_by'] as string | undefined

          if (
            payload.eventType === 'UPDATE' &&
            updatedBy &&
            updatedBy !== currentUserId
          ) {
            const cityId = newCity['id'] as string
            qc.invalidateQueries({ queryKey: ['city', cityId] })

            qc.fetchQuery<Profile | null>({
              queryKey: ['profile', updatedBy],
              queryFn: async () => {
                const { data } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', updatedBy)
                  .single()
                return data as unknown as Profile | null
              },
            }).then((profile) => {
              const userName = profile?.name ?? 'Jemand'
              const oldStatus = oldCity['status'] as string | undefined
              const newStatus = newCity['status'] as string | undefined
              const cityName = newCity['name'] as string | undefined
              if (oldStatus !== newStatus && newStatus) {
                addToast({
                  type: 'info',
                  message: `${userName} hat ${cityName ?? 'Stadt'} → ${newStatus} gesetzt`,
                })
              }
            }).catch(() => null)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          const row = (payload.new ?? payload.old) as Record<string, unknown>
          const cityId = row['city_id'] as string | undefined
          if (cityId) {
            qc.invalidateQueries({ queryKey: ['listings', cityId] })
          }
          qc.invalidateQueries({ queryKey: ['cities'] })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log' },
        () => {
          qc.invalidateQueries({ queryKey: ['activity_log'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, qc, addToast])
}
