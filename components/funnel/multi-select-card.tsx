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
        'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2',
        selected
          ? 'border-amber-500 bg-amber-50'
          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50',
        className
      )}
      aria-pressed={selected}
      aria-label={`${title}${description ? `, ${description}` : ''}`}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
          selected ? 'border-amber-600 bg-amber-600' : 'border-slate-300 bg-white'
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
              selected ? 'text-amber-600' : 'text-slate-500'
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <span
            className={cn(
              'font-medium',
              selected ? 'text-amber-900' : 'text-slate-900'
            )}
          >
            {title}
          </span>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}
