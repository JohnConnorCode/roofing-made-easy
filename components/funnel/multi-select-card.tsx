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
        'min-h-[64px] touch-manipulation', // 48px+ tap target with better touch handling
        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50',
        className
      )}
      aria-pressed={selected}
      aria-label={`${title}${description ? `, ${description}` : ''}`}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
          selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
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
              selected ? 'text-blue-600' : 'text-gray-500'
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <span
            className={cn(
              'font-medium',
              selected ? 'text-blue-900' : 'text-gray-900'
            )}
          >
            {title}
          </span>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}
