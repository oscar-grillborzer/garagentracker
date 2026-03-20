import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { useAcceptTerms } from '../../hooks/useAuth'

interface TermsScreenProps {
  userId: string
}

export function TermsScreen({ userId }: TermsScreenProps) {
  const acceptTerms = useAcceptTerms()

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[340px]"
      >
        <div className="w-8 h-8 rounded-md bg-green/10 border border-green/20 flex items-center justify-center mb-6">
          <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-[20px] font-bold text-text tracking-tight mb-2">
          Datenschutzhinweis
        </h1>
        <p className="text-[13px] text-text-2 leading-relaxed mb-6">
          Deine Telefonnummer wird zur Authentifizierung gespeichert. Keine Weitergabe an Dritte.
          Alle Daten werden in der EU (Frankfurt) gespeichert.
        </p>

        <div className="space-y-2 text-[12px] text-muted mb-8">
          <div className="flex items-start gap-2">
            <span className="text-green mt-0.5">✓</span>
            <span>Speicherung nur für Login-Zwecke</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green mt-0.5">✓</span>
            <span>EU-Server (Frankfurt / Supabase)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green mt-0.5">✓</span>
            <span>Automatisches Logout nach 30 Tagen</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green mt-0.5">✓</span>
            <span>Session gespeichert im Browser-LocalStorage</span>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full"
          loading={acceptTerms.isPending}
          onClick={() => acceptTerms.mutate(userId)}
        >
          Verstanden
        </Button>
      </motion.div>
    </div>
  )
}
