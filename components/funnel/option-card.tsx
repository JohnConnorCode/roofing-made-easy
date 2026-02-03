'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface OptionCardProps {
  icon?: React.ReactNode
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  className?: string
  compact?: boolean
}

export function OptionCard({
  icon,
  title,
  description,
  selected = false,
  onClick,
  className,
  compact = false,
}: OptionCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-xl border-2',
        'touch-manipulation transition-all duration-200',
        'card-hover',
        compact ? 'p-3' : 'min-h-[80px] p-4 md:min-h-[100px] md:p-6',
        selected
          ? 'border-[#c9a25c] bg-[#1a1f2e] shadow-lg glow-gold'
          : 'border-slate-700 bg-[#161a23] hover:border-[#9a7432] hover:bg-[#1a1f2e]',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-pressed={selected}
      aria-label={`${title}${description ? `, ${description}` : ''}`}
    >
      {/* Selection indicator */}
      {selected && (
        <div
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-[#c9a25c] shadow-sm animate-scale-in',
            compact ? 'right-2 top-2 h-5 w-5' : 'right-3 top-3 h-6 w-6'
          )}
        >
          <Check className={cn(compact ? 'h-3 w-3' : 'h-4 w-4', 'text-[#0c0f14]')} />
        </div>
      )}

      {compact ? (
        // Compact layout: stacked, centered
        <div className="flex flex-col items-center text-center gap-2">
          {icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                selected
                  ? 'bg-gradient-to-br from-[#c9a25c] to-[#9a7432] text-[#0c0f14]'
                  : 'bg-slate-800 text-slate-400'
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h3
              className={cn(
                'text-sm font-medium transition-colors leading-tight',
                selected ? 'text-[#c9a25c]' : 'text-slate-100'
              )}
            >
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 leading-tight">{description}</p>
            )}
          </div>
        </div>
      ) : (
        // Default layout: horizontal
        <div className="flex items-start gap-4">
          {icon && (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                selected
                  ? 'bg-gradient-to-br from-[#c9a25c] to-[#9a7432] text-[#0c0f14]'
                  : 'bg-slate-800 text-slate-400'
              )}
            >
              {icon}
            </div>
          )}

          <div className="flex-1">
            <h3
              className={cn(
                'font-semibold transition-colors',
                selected ? 'text-[#c9a25c]' : 'text-slate-100'
              )}
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
