import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useVerifyOtp, useSendOtp } from '../../hooks/useAuth'

interface OtpScreenProps {
  phone: string
  onBack: () => void
}

export function OtpScreen({ phone, onBack }: OtpScreenProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const verifyOtp = useVerifyOtp()
  const resendOtp = useSendOtp()
  const [resendCooldown, setResendCooldown] = useState(30)

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function submitCode(code: string) {
    setError(null)
    try {
      await verifyOtp.mutateAsync({ phone, token: code })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falscher Code'
      setError(msg.includes('invalid') ? 'Ungültiger Code. Bitte erneut versuchen.' : msg)
      setDigits(Array(6).fill(''))
      refs.current[0]?.focus()
    }
  }

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setError(null)

    if (char && index < 5) {
      refs.current[index + 1]?.focus()
    }

    if (char && index === 5) {
      const code = [...next.slice(0, 5), char].join('')
      if (code.length === 6) submitCode(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const code = digits.join('')
      if (code.length === 6) submitCode(code)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    if (pasted.length === 6) submitCode(pasted)
    else refs.current[pasted.length]?.focus()
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    try {
      await resendOtp.mutateAsync(phone)
      setResendCooldown(30)
      setError(null)
    } catch {
      setError('Code konnte nicht erneut gesendet werden.')
    }
  }

  const displayPhone = phone.replace(/(\+49)(\d{3})(\d+)/, '$1 $2 …')

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
            Code eingeben
          </h1>
          <p className="text-[13px] text-text-2">
            Wir haben einen 6-stelligen Code an{' '}
            <span className="font-mono text-text">{displayPhone}</span> gesendet.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-full h-11 bg-surface border border-border-2 rounded-sm text-center text-[18px] font-mono font-bold text-text outline-none focus:border-subtle transition-colors caret-transparent"
              disabled={verifyOtp.isPending}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-red mb-4"
          >
            {error}
          </motion.p>
        )}

        {verifyOtp.isPending && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-subtle border-t-text animate-spin" />
            <span className="text-[12px] text-text-2">Wird überprüft…</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={onBack}
            className="text-[12px] text-text-2 hover:text-text transition-colors"
          >
            ← Zurück
          </button>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendOtp.isPending}
            className="text-[12px] text-text-2 hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Erneut senden (${resendCooldown}s)`
              : 'Code erneut senden'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
