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
        'relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200',
        'min-h-[64px] touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-[#c9a25c]/30 focus:ring-offset-2 focus:ring-offset-[#0c0f14]',
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
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200',
          selected ? 'border-[#c9a25c] bg-[#c9a25c] scale-110' : 'border-slate-600 bg-[#1a1f2e]'
        )}
      >
        {selected && <Check className="h-3 w-3 text-[#0c0f14] animate-scale-in" />}
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center gap-3">
        {icon && (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              selected ? 'text-[#c9a25c]' : 'text-slate-400'
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <span
            className={cn(
              'font-medium transition-colors',
              selected ? 'text-[#c9a25c]' : 'text-slate-100'
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
