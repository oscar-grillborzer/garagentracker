import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      return data.session
    },
    staleTime: Infinity,
  })
}

export function useProfile() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (error) throw error
      return data as unknown as Profile
    },
    enabled: !!session?.user?.id,
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
    },
  })
}

export function useVerifyOtp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ phone, token }: { phone: string; token: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useAcceptTerms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ accepted_terms: true } as Record<string, unknown>)
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}

export function useSignOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      qc.clear()
    },
  })
}
