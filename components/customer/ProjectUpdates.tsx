'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Bell,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface Activity {
  id: string
  type: string
  content: string
  created_at: string
  metadata?: Record<string, unknown>
  author_name?: string
  is_system_generated: boolean
}

interface ProjectUpdatesProps {
  leadId: string
  className?: string
}

const ACTIVITY_CONFIG: Record<string, { icon: typeof Bell; color: string; bgColor: string; label: string }> = {
  note: {
    icon: MessageSquare,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    label: 'Note',
  },
  call: {
    icon: Phone,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    label: 'Phone Call',
  },
  email: {
    icon: Mail,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    label: 'Email',
  },
  sms: {
    icon: MessageSquare,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    label: 'Text Message',
  },
  status_change: {
    icon: RefreshCw,
    color: 'text-gold-light',
    bgColor: 'bg-gold-light/10',
    label: 'Status Update',
  },
  estimate_generated: {
    icon: DollarSign,
    color: 'text-gold-light',
    bgColor: 'bg-gold-light/10',
    label: 'Estimate',
  },
  quote_sent: {
    icon: FileText,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Quote Sent',
  },
  appointment_scheduled: {
    icon: Calendar,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    label: 'Appointment',
  },
  system: {
    icon: Bell,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    label: 'System',
  },
}

export function ProjectUpdates({ leadId, className }: ProjectUpdatesProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true)
      setError(null)
      try {
        // Use customer endpoint which filters to customer-visible activities
        const response = await fetch(`/api/customer/leads/${leadId}/activities`)
        if (!response.ok) throw new Error('Failed to fetch activities')
        const data = await response.json()
        setActivities((data.activities || []).slice(0, 10))
      } catch (err) {
        setError('Unable to load updates')
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [leadId])

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDate(dateString)
  }

  const getActivityConfig = (type: string) => {
    return ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.system
  }

  // Generate friendly message for customer
  const getCustomerMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'status_change':
        const newStatus = (activity.metadata?.new_status as string || '').replace(/_/g, ' ')
        return `Your project status was updated to "${newStatus}"`
      case 'estimate_generated':
        return 'Your personalized estimate has been generated'
      case 'quote_sent':
        return 'Your official quote has been sent'
      case 'appointment_scheduled':
        return 'Your consultation has been scheduled'
      case 'call':
        return `Call logged${activity.author_name ? ` by ${activity.author_name}` : ''}`
      case 'email':
        return `Email sent${activity.author_name ? ` by ${activity.author_name}` : ''}`
      default:
        return activity.content
    }
  }

  return (
    <Card variant="dark" className={cn('border-slate-700', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Bell className="h-5 w-5 text-gold-light" />
          Project Updates
        </CardTitle>
        <CardDescription>
          Recent activity on your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-700 rounded" />
                  <div className="h-3 w-1/4 bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">No updates yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Updates will appear here as your project progresses
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {activities.map((activity, index) => {
              const config = getActivityConfig(activity.type)
              const Icon = config.icon
              const isLast = index === activities.length - 1

              return (
                <div key={activity.id} className="flex gap-3">
                  {/* Timeline line and icon */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      config.bgColor
                    )}>
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-slate-700 my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
                    <p className="text-sm text-slate-200">
                      {getCustomerMessage(activity)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
