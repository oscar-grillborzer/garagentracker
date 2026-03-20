import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { useSendOtp } from '../../hooks/useAuth'

interface LoginScreenProps {
  onOtpSent: (phone: string) => void
}

export function LoginScreen({ onOtpSent }: LoginScreenProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sendOtp = useSendOtp()

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    const withPrefix = digits.startsWith('49')
      ? `+${digits}`
      : digits.startsWith('0')
      ? `+49${digits.slice(1)}`
      : `+49${digits}`
    return withPrefix
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setError('Bitte gib eine gültige Telefonnummer ein.')
      return
    }
    try {
      const formatted = formatPhone(phone)
      await sendOtp.mutateAsync(formatted)
      onOtpSent(formatted)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setError(msg.includes('not allowed') || msg.includes('whitelist')
        ? 'Diese Nummer ist nicht autorisiert.'
        : 'Code konnte nicht gesendet werden. Bitte erneut versuchen.')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[340px]"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-sm bg-green/20 border border-green/30 flex items-center justify-center">
              <span className="text-green text-[10px] font-bold">G</span>
            </div>
            <span className="text-[13px] font-medium text-text">Garagentracker</span>
          </div>
          <h1 className="text-[22px] font-bold text-text tracking-tight mb-1">
            Anmelden
          </h1>
          <p className="text-[13px] text-text-2">
            Gib deine Telefonnummer ein, um einen Code zu erhalten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-text-2">
              Telefonnummer
            </label>
            <div className="flex">
              <div className="flex items-center justify-center h-8 px-3 bg-subtle/30 border border-border-2 border-r-0 rounded-l-sm text-[13px] text-text-2 select-none shrink-0">
                +49
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setError(null)
                }}
                placeholder="151 12345678"
                className="flex-1 h-8 bg-surface border border-border-2 rounded-r-sm text-[13px] text-text placeholder:text-muted outline-none focus:border-subtle transition-colors px-3"
                autoComplete="tel"
                autoFocus
              />
            </div>
            {error && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] text-red"
              >
                {error}
              </motion.span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={sendOtp.isPending}
            disabled={sendOtp.isPending}
          >
            Code senden
          </Button>
        </form>

        <p className="mt-6 text-[11px] text-muted leading-relaxed">
          Deine Telefonnummer wird zur Authentifizierung gespeichert. Keine Weitergabe an Dritte.
        </p>
      </motion.div>
    </div>
  )
}
