import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-subtle/40 rounded-sm',
        className
      )}
    />
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Skeleton className="w-2 h-2 rounded-full" />
      <Skeleton className="flex-1 h-3.5" />
      <Skeleton className="w-8 h-4" />
      <Skeleton className="w-12 h-4" />
    </div>
  )
}

export function ScraperSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-subtle border-t-cyan animate-spin" />
        <span className="text-[12px] text-text-2">Seite wird analysiert…</span>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    </div>
  )
}
