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
    <Card
      variant={selected ? 'selected' : 'selectable'}
      className={cn(
        'relative min-h-[80px] cursor-pointer p-4 md:min-h-[100px] md:p-6',
        'touch-manipulation',
        selected && 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20',
        !selected && 'hover:border-amber-300',
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
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              selected ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1">
          <h3
            className={cn(
              'font-semibold',
              selected ? 'text-amber-900' : 'text-slate-900'
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
