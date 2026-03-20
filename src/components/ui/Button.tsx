import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium transition-colors rounded-sm select-none outline-none focus-visible:ring-1 focus-visible:ring-white/30'

  const variants = {
    primary:
      'bg-text text-bg hover:bg-white active:bg-white/80 disabled:opacity-40',
    secondary:
      'bg-surface border border-border-2 text-text hover:bg-subtle/30 active:bg-subtle/50 disabled:opacity-40',
    ghost:
      'text-text-2 hover:text-text hover:bg-subtle/30 active:bg-subtle/50 disabled:opacity-40',
    danger:
      'bg-red/10 border border-red/20 text-red hover:bg-red/20 active:bg-red/30 disabled:opacity-40',
  }

  const sizes = {
    sm: 'h-7 px-2.5 text-[12px]',
    md: 'h-8 px-3 text-[13px]',
    lg: 'h-9 px-4 text-[13px]',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <svg
          className="animate-spin h-3.5 w-3.5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </motion.button>
  )
}
