'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  variant?: 'default' | 'encouraging'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isEncouraging = variant === 'encouraging'

  const actionButton = actionLabel && (
    <Button
      variant="primary"
      className={cn(
        'mt-4',
        isEncouraging
          ? 'bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-0'
      )}
      rightIcon={<ArrowRight className="h-4 w-4" />}
      onClick={onAction}
    >
      {actionLabel}
    </Button>
  )

  return (
    <Card
      variant="dark"
      className={cn(
        isEncouraging ? 'border-gold-light/30 bg-gold-light/5' : 'border-slate-700',
        className
      )}
    >
      <CardContent className="py-8 text-center">
        <div className={cn(
          'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
          isEncouraging ? 'bg-gold-light/10' : 'bg-slate-800'
        )}>
          <Icon className={cn(
            'h-7 w-7',
            isEncouraging ? 'text-gold-light' : 'text-slate-500'
          )} />
        </div>
        <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>
        {actionHref ? (
          <Link href={actionHref}>{actionButton}</Link>
        ) : (
          actionButton
        )}
      </CardContent>
    </Card>
  )
}
