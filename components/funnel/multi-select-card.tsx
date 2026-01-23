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
}

export function MultiSelectCard({
  icon,
  title,
  description,
  selected = false,
  onClick,
  className,
}: MultiSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
        'min-h-[64px] touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-slate-950',
        selected
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-slate-700 bg-slate-900 hover:border-amber-500/50 hover:bg-slate-800',
        className
      )}
      aria-pressed={selected}
      aria-label={`${title}${description ? `, ${description}` : ''}`}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
          selected ? 'border-amber-500 bg-amber-500' : 'border-slate-600 bg-slate-800'
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center gap-3">
        {icon && (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded',
              selected ? 'text-amber-500' : 'text-slate-400'
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <span
            className={cn(
              'font-medium',
              selected ? 'text-amber-500' : 'text-white'
            )}
          >
            {title}
          </span>
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}
