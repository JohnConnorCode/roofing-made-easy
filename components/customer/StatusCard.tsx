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
}: StatusCardProps) {
  const variants = {
    default: 'border-slate-700',
    highlight: 'border-[#c9a25c]/30 bg-[#c9a25c]/5',
    success: 'border-[#3d7a5a]/30 bg-[#3d7a5a]/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
  }

  const content = (
    <Card className={cn('transition-all hover:border-slate-600', variants[variant], href && 'cursor-pointer hover:shadow-lg')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              variant === 'highlight' ? 'bg-[#c9a25c]/10' : 'bg-slate-800'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                variant === 'highlight' ? 'text-[#c9a25c]' : 'text-slate-400'
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
        {value && (
          <p className="text-2xl font-semibold text-[#c9a25c]">{value}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-[#c9a25c] hover:text-[#d4b06c]"
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
