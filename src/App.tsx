import { useState, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { supabase } from './lib/supabase'
import { LoginScreen } from './components/auth/LoginScreen'
import { OtpScreen } from './components/auth/OtpScreen'
import { TermsScreen } from './components/auth/TermsScreen'
import { MainApp } from './MainApp'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from './types'

type AuthStep = 'login' | 'otp' | 'app'

function AppInner() {
  const [step, setStep] = useState<AuthStep>('login')
  const [phone, setPhone] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [needsTerms, setNeedsTerms] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setSession(data.session)
        await loadProfile(data.session.user.id)
        setStep('app')
      }
      setLoadingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      if (s) {
        await loadProfile(s.user.id)
        setStep('app')
      } else {
        setStep('login')
        setProfile(null)
        setNeedsTerms(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      const p = data as unknown as Profile
      setProfile(p)
      if (!p.accepted_terms) setNeedsTerms(true)
    }
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-border-2 border-t-text animate-spin" />
      </div>
    )
  }

  if (step === 'login') {
    return (
      <LoginScreen
        onOtpSent={(p) => {
          setPhone(p)
          setStep('otp')
        }}
      />
    )
  }

  if (step === 'otp') {
    return (
      <OtpScreen
        phone={phone}
        onBack={() => setStep('login')}
      />
    )
  }

  if (needsTerms && profile && !profile.accepted_terms) {
    return (
      <TermsScreen
        userId={profile.id}
      />
    )
  }

  if (step === 'app' && session && profile) {
    return <MainApp profile={profile} />
  }

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
