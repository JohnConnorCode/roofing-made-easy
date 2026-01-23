'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId()

    return (
      <div className="flex items-start">
        <div className="flex items-center">
          {/* 44x44px touch target wrapper for accessibility */}
          <label
            htmlFor={checkboxId}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center -m-3"
          >
            <input
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                'h-5 w-5 rounded border-2 border-slate-300 bg-white transition-colors',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/20 peer-focus-visible:ring-offset-2',
                'peer-checked:border-amber-600 peer-checked:bg-amber-600',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                className
              )}
            />
            <Check
              className={cn(
                'absolute h-4 w-4 text-white opacity-0 transition-opacity pointer-events-none',
                'peer-checked:opacity-100'
              )}
            />
          </label>
        </div>
        {(label || description) && (
          <div className="ml-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-slate-600">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
