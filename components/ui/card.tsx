'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'selectable' | 'selected' | 'dark' | 'dark-selectable' | 'dark-selected'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      // Light theme (default for admin)
      default: 'bg-white border border-slate-200 shadow-sm',
      selectable:
        'bg-white border-2 border-slate-200 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all',
      selected: 'bg-white border-2 border-amber-500 shadow-md ring-2 ring-amber-500/20',
      // Dark theme (for customer portal / funnel)
      dark: 'bg-slate-deep border border-slate-700',
      'dark-selectable':
        'bg-slate-deep border-2 border-slate-700 cursor-pointer hover:border-gold-muted hover:shadow-lg transition-all',
      'dark-selected': 'bg-slate-deep border-2 border-gold-light shadow-lg glow-gold',
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-6', variants[variant], className)}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight text-slate-900', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-600', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-4', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
