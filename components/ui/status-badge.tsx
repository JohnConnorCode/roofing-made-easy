'use client'

import { getStatusConfig, URGENCY_MAP, JOB_TYPE_MAP } from '@/lib/constants/status'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = getStatusConfig(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.badge,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface UrgencyBadgeProps {
  urgency: string
  className?: string
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const config = URGENCY_MAP[urgency]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        config.badge,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface JobTypeBadgeProps {
  jobType: string
  className?: string
}

export function JobTypeBadge({ jobType, className }: JobTypeBadgeProps) {
  const config = JOB_TYPE_MAP[jobType]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        config.badge,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface StatusDotProps {
  status: string
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  const config = getStatusConfig(status)

  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', config.dot, className)}
    />
  )
}
