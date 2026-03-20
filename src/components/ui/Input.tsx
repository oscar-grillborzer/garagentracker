import { cn } from '../../lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export function Input({
  label,
  error,
  prefix,
  suffix,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[12px] font-medium text-text-2">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-text-2 text-[13px] pointer-events-none select-none">
            {prefix}
          </div>
        )}
        <input
          className={cn(
            'w-full h-8 bg-surface border border-border-2 rounded-sm text-[13px] text-text',
            'placeholder:text-muted outline-none',
            'focus:border-subtle transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            prefix ? 'pl-10' : 'pl-3',
            suffix ? 'pr-10' : 'pr-3',
            error && 'border-red/50 focus:border-red/70',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-text-2 text-[13px] pointer-events-none select-none">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <span className="text-[12px] text-red">{error}</span>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[12px] font-medium text-text-2">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full bg-surface border border-border-2 rounded-sm text-[13px] text-text',
          'placeholder:text-muted outline-none resize-none',
          'focus:border-subtle transition-colors p-3',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          error && 'border-red/50 focus:border-red/70',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-[12px] text-red">{error}</span>
      )}
    </div>
  )
}
