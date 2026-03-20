import { cn } from '../../lib/utils'

interface PropertyRowProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function PropertyRow({ label, children, className }: PropertyRowProps) {
  return (
    <div className={cn('flex items-start gap-4 py-2 border-b border-border', className)}>
      <span className="w-28 shrink-0 text-[12px] text-text-2 font-medium pt-0.5 select-none">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
