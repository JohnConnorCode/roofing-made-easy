'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  showRequired?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, showRequired, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {showRequired && (
              <>
                <span className="text-[#c9a25c] ml-0.5" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            // Base styles with min-height for touch targets
            'flex h-12 min-h-[48px] w-full rounded-lg border border-white/10 bg-slate-900/60 backdrop-blur-sm px-4 py-2 text-base text-slate-50',
            'placeholder:text-slate-500',
            // Focus states
            'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
            // Disabled states
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            // Dark theme support
            'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:focus:border-amber-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400',
            // Error state
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-slate-400 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
