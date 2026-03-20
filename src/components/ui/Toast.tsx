import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '../../store/ui.store'
import { useEffect } from 'react'
import type { ToastItem } from '../../types'

const TOAST_DURATION = 4000

function ToastEntry({ toast }: { toast: ToastItem }) {
  const removeToast = useUIStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, removeToast])

  const colors = {
    info: { border: '#27272a', icon: '#22d3ee', text: '#fafafa' },
    success: { border: '#4ade8030', icon: '#4ade80', text: '#fafafa' },
    error: { border: '#f8717130', icon: '#f87171', text: '#fafafa' },
  }

  const icons = {
    info: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  }

  const c = colors[toast.type]

  return (
    <motion.div
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 32, opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-2.5 px-3 py-2.5 bg-surface rounded-md cursor-pointer min-w-0 max-w-[320px]"
      style={{ border: `1px solid ${c.border}` }}
      onClick={() => removeToast(toast.id)}
    >
      <span style={{ color: c.icon }} className="mt-0.5 shrink-0">{icons[toast.type]}</span>
      <span className="text-[12px] text-text leading-snug">{toast.message}</span>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastEntry key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
