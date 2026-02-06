'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface StatusCardProps {
  title: string
  description: string
  icon: LucideIcon
  status?: {
    label: string
    color: string
  }
  value?: string | number
  href?: string
  action?: {
    label: string
    onClick?: () => void
  }
  variant?: 'default' | 'highlight' | 'success' | 'warning'
  contextMessage?: string
  badge?: {
    label: string
    variant: 'info' | 'warning' | 'success'
  }
}

export function StatusCard({
  title,
  description,
  icon: Icon,
  status,
  value,
  href,
  action,
  variant = 'default',
  contextMessage,
  badge,
}: StatusCardProps) {
  const badgeStyles = {
    info: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    success: 'bg-success/10 text-success border-success/30',
  }
  const variants = {
    default: 'border-slate-700',
    highlight: 'border-gold-light/30 bg-gold-light/5',
    success: 'border-success/30 bg-success/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
  }

  const content = (
    <Card variant="dark" className={cn('transition-all hover:border-slate-600', variants[variant], href && 'cursor-pointer hover:shadow-lg')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              variant === 'highlight' ? 'bg-gold-light/10' : 'bg-slate-800'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                variant === 'highlight' ? 'text-gold-light' : 'text-slate-400'
              )} />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">{title}</CardTitle>
              {status && (
                <span className={cn('text-xs font-medium', status.color)}>
                  {status.label}
                </span>
              )}
            </div>
          </div>
          {href && (
            <ChevronRight className="h-5 w-5 text-slate-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-400 mb-2">{description}</p>
        {contextMessage && (
          <p className="text-xs text-slate-500 italic mb-2">{contextMessage}</p>
        )}
        {badge && (
          <span className={cn(
            'inline-block text-xs font-medium px-2 py-0.5 rounded-full border mb-2',
            badgeStyles[badge.variant]
          )}>
            {badge.label}
          </span>
        )}
        {value && (
          <p className="text-2xl font-semibold text-gold-light">{value}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-gold-light hover:text-gold-hover"
          >
            {action.label}
          </button>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
