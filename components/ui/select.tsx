'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  onChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, id, onChange, ...props }, ref) => {
    const selectId = id || React.useId()

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              // Base styles with min-height for touch targets
              'flex h-11 min-h-[44px] w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2 pr-10 text-base text-slate-900',
              // Focus states
              'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
              // Disabled states
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              // Dark theme support
              'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
              'dark:focus:border-amber-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400',
              // Error state
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
