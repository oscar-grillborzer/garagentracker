import { motion } from 'framer-motion'
import { STATUS_COLORS, PRIORITY_COLORS, USER_COLORS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import type { City, UserName } from '../../types'

interface CityRowProps {
  city: City
  isActive: boolean
  isSelected: boolean
  onSelect: () => void
  onToggleSelect: (e: React.MouseEvent) => void
  index: number
}

export function CityRow({
  city,
  isActive,
  isSelected,
  onSelect,
  onToggleSelect,
  index,
}: CityRowProps) {
  const statusColor = STATUS_COLORS[city.status]
  const priorityColor = PRIORITY_COLORS[city.priority]
  const userColor = city.assigned_profile
    ? USER_COLORS[city.assigned_profile.name as UserName] ?? '#52525b'
    : '#3f3f46'
  const userInitial = city.assigned_profile?.name?.[0] ?? '—'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: index * 0.02, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 cursor-pointer select-none',
        'border-b border-border transition-colors',
        isActive ? 'bg-surface' : 'hover:bg-surface/60',
        isSelected && 'bg-subtle/20'
      )}
      onClick={onSelect}
    >
      <div
        onClick={onToggleSelect}
        className="shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors cursor-pointer"
        style={{
          borderColor: isSelected ? statusColor : '#27272a',
          backgroundColor: isSelected ? `${statusColor}20` : 'transparent',
        }}
      >
        {isSelected && (
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
            style={{ color: statusColor }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: statusColor }}
      />

      <span className={cn(
        'flex-1 text-[13px] truncate font-medium',
        isActive ? 'text-text' : 'text-text-2 group-hover:text-text'
      )}>
        {city.name}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        {city.priority !== 'mittel' && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: priorityColor }}
            title={city.priority}
          />
        )}

        {city.listing_count != null && city.listing_count > 0 && (
          <span className="text-[11px] text-muted font-mono tabular-nums">
            {city.listing_count}
          </span>
        )}

        <span
          className="w-5 h-5 rounded-sm text-[10px] font-bold flex items-center justify-center shrink-0 border"
          style={{
            color: userColor,
            borderColor: `${userColor}30`,
            backgroundColor: `${userColor}15`,
          }}
        >
          {userInitial}
        </span>
      </div>
    </motion.div>
  )
}
