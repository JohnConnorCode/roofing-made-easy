'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg shadow-sm'

    const variants = {
      primary: 'bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0 focus-visible:ring-[#c9a25c] shadow-[#b5893a]/25',
      secondary: 'bg-[#1a1f2e] text-slate-200 border border-slate-700 hover:bg-[#232938] hover:border-slate-600 active:bg-[#1a1f2e] focus-visible:ring-slate-500',
      outline: 'border-2 border-slate-600 bg-transparent text-slate-200 hover:bg-[#1a1f2e] hover:border-slate-500 focus-visible:ring-slate-500',
      ghost: 'hover:bg-[#1a1f2e] text-slate-400 hover:text-slate-200 shadow-none focus-visible:ring-slate-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    }

    const sizes = {
      sm: 'h-10 min-h-[48px] px-4 text-sm',
      md: 'h-12 min-h-[48px] px-5 text-base',
      lg: 'h-14 min-h-[48px] px-6 text-lg',
      xl: 'h-16 min-h-[48px] px-8 text-xl min-w-[200px]',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
