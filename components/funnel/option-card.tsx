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
}

export function OptionCard({
  icon,
  title,
  description,
  selected = false,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <div
      className={cn(
        'relative min-h-[80px] cursor-pointer rounded-xl border-2 p-4 md:min-h-[100px] md:p-6',
        'touch-manipulation transition-all duration-200',
        'card-hover',
        selected
          ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10'
          : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md',
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
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-sm animate-scale-in">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
              selected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1">
          <h3
            className={cn(
              'font-semibold transition-colors',
              selected ? 'text-amber-700' : 'text-slate-900'
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
