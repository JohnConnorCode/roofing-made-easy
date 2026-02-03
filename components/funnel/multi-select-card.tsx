'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface MultiSelectCardProps {
  icon?: React.ReactNode
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  className?: string
  compact?: boolean
}

export function MultiSelectCard({
  icon,
  title,
  description,
  selected = false,
  onClick,
  className,
  compact = false,
}: MultiSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center rounded-xl border-2 text-left transition-all duration-200',
        'touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-[#c9a25c]/30 focus:ring-offset-2 focus:ring-offset-[#0c0f14]',
        compact ? 'gap-2 p-2.5' : 'gap-3 p-4 min-h-[64px]',
        selected
          ? 'border-[#c9a25c] bg-[#1a1f2e] shadow-lg glow-gold'
          : 'border-slate-700 bg-[#161a23] hover:border-[#9a7432] hover:bg-[#1a1f2e]',
        className
      )}
      aria-pressed={selected}
      aria-label={`${title}${description ? `, ${description}` : ''}`}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border-2 transition-all duration-200',
          compact ? 'h-4 w-4' : 'h-5 w-5',
          selected ? 'border-[#c9a25c] bg-[#c9a25c] scale-110' : 'border-slate-600 bg-[#1a1f2e]'
        )}
      >
        {selected && (
          <Check className={cn('text-[#0c0f14] animate-scale-in', compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center gap-2">
        {icon && (
          <div
            className={cn(
              'flex items-center justify-center rounded-lg transition-colors',
              compact ? 'h-6 w-6' : 'h-8 w-8',
              selected ? 'text-[#c9a25c]' : 'text-slate-400'
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate transition-colors',
              compact ? 'text-sm font-medium' : 'font-medium',
              selected ? 'text-[#c9a25c]' : 'text-slate-100'
            )}
          >
            {title}
          </span>
          {description && !compact && (
            <p className="text-sm text-slate-400 truncate">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}
