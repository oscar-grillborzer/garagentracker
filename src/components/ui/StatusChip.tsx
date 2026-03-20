import { motion } from 'framer-motion'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import type { CityStatus, CityPriority } from '../../types'

interface StatusChipProps {
  status: CityStatus
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function StatusChip({ status, onClick, size = 'md' }: StatusChipProps) {
  const color = STATUS_COLORS[status]
  return (
    <motion.button
      whileTap={{ scale: onClick ? 0.96 : 1 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm font-medium',
        'border transition-colors select-none',
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
        size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-[12px]'
      )}
      style={{
        color,
        borderColor: `${color}30`,
        backgroundColor: `${color}12`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {STATUS_LABELS[status]}
    </motion.button>
  )
}

interface PriorityBadgeProps {
  priority: CityPriority
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm font-medium border',
        size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-[12px]'
      )}
      style={{
        color,
        borderColor: `${color}30`,
        backgroundColor: `${color}12`,
      }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

interface UserBadgeProps {
  name: string
  color: string
  size?: 'sm' | 'md'
}

export function UserBadge({ name, color, size = 'md' }: UserBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm font-medium border',
        size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-[12px]'
      )}
      style={{
        color,
        borderColor: `${color}30`,
        backgroundColor: `${color}12`,
      }}
    >
      {name}
    </span>
  )
}
