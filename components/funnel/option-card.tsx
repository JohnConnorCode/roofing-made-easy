'use client'

import { Card } from '@/components/ui/card'
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
        'touch-manipulation transition-all',
        selected
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-slate-700 bg-slate-900 hover:border-amber-500/50 hover:bg-slate-800',
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
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              selected ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1">
          <h3
            className={cn(
              'font-semibold',
              selected ? 'text-amber-500' : 'text-white'
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
