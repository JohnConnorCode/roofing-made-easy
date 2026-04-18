'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'selectable' | 'selected' | 'dark' | 'dark-selectable' | 'dark-selected'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      // Default: glass card (dark translucent surface, matches admin + customer portal)
      default: 'border border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
      selectable:
        'border border-white/5 bg-slate-950/40 backdrop-blur-xl cursor-pointer hover:border-white/10 hover:bg-slate-950/60 transition-colors',
      selected: 'border-2 border-[#c9a25c] bg-slate-950/60 backdrop-blur-xl shadow-lg ring-2 ring-[#c9a25c]/20',
      // Explicit dark variants (funnel and customer portal use these)
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

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

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

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight text-slate-50', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-400', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

type CardContentProps = React.HTMLAttributes<HTMLDivElement>

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-4', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

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
