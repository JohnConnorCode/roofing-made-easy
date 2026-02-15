'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Mail,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CommunicationLog {
  id: string
  channel: 'email' | 'sms'
  direction: 'inbound' | 'outbound'
  status: string
  recipient_email?: string
  recipient_phone?: string
  subject?: string
  body: string
  external_status?: string
  workflow?: { id: string; name: string } | null
  template?: { id: string; name: string } | null
  created_at: string
}

interface ScheduledMessage {
  id: string
  channel: 'email' | 'sms'
  scheduled_for: string
  status: string
  workflow?: { id: string; name: string } | null
  template?: { id: string; name: string } | null
}

interface CommunicationTimelineProps {
  leadId?: string
  customerId?: string
  jobId?: string
}

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
}

const CHANNEL_COLORS = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
}

const STATUS_ICONS = {
  sent: CheckCircle2,
  delivered: CheckCircle2,
  failed: XCircle,
  pending: Clock,
  scheduled: Clock,
  cancelled: AlertCircle,
}

const STATUS_COLORS = {
  sent: 'text-green-500',
  delivered: 'text-green-500',
  failed: 'text-red-500',
  pending: 'text-gold',
  scheduled: 'text-blue-500',
  cancelled: 'text-slate-400',
}

export function CommunicationTimeline({ leadId, customerId, jobId }: CommunicationTimelineProps) {
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Use lead-specific endpoint if leadId provided, otherwise use admin communications API
      let response: Response
      if (leadId) {
        response = await fetch(`/api/leads/${leadId}/communications`)
      } else {
        const params = new URLSearchParams()
        if (customerId) params.set('customer_id', customerId)
        // For job-based lookup, we fetch via the admin communications endpoint
        response = await fetch(`/api/admin/communications?${params}`)
      }
      if (!response.ok) throw new Error('Failed to fetch communications')
      const data = await response.json()
      setLogs(data.logs || [])
      setScheduled(data.scheduled || [])
    } catch {
      setError('Failed to load communications')
    } finally {
      setIsLoading(false)
    }
  }, [leadId, customerId, jobId])

  useEffect(() => {
    fetchCommunications()
  }, [fetchCommunications])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-sm text-red-500">
        {error}
      </div>
    )
  }

  const hasContent = logs.length > 0 || scheduled.length > 0

  if (!hasContent) {
    return (
      <div className="text-center py-6">
        <Mail className="h-8 w-8 mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">No communications yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Scheduled messages */}
      {scheduled.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Scheduled</h4>
          {scheduled.map((msg) => {
            const ChannelIcon = CHANNEL_ICONS[msg.channel]

            return (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 bg-gold-light/10 rounded-lg border border-gold-light/30"
              >
                <div className={`p-1.5 rounded ${CHANNEL_COLORS[msg.channel]}`}>
                  <ChannelIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    <span className="text-gold-dark font-medium">
                      Scheduled for {formatDate(msg.scheduled_for)}
                    </span>
                  </div>
                  {msg.workflow && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Zap className="h-3 w-3" />
                      {msg.workflow.name}
                    </div>
                  )}
                  {msg.template && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Template: {msg.template.name}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Communication history */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">History</h4>
          {logs.map((log) => {
            const ChannelIcon = CHANNEL_ICONS[log.channel]
            const StatusIcon = STATUS_ICONS[log.status as keyof typeof STATUS_ICONS] || Clock
            const statusColor = STATUS_COLORS[log.status as keyof typeof STATUS_COLORS] || 'text-slate-400'
            const isOutbound = log.direction === 'outbound'

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200"
              >
                <div className={`p-1.5 rounded ${CHANNEL_COLORS[log.channel]}`}>
                  <ChannelIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isOutbound ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                    ) : (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-slate-900">
                      {isOutbound ? 'Sent' : 'Received'} {log.channel === 'email' ? 'email' : 'SMS'}
                    </span>
                    <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
                  </div>

                  {log.subject && (
                    <p className="text-sm text-slate-600 mt-0.5 font-medium">
                      {log.subject}
                    </p>
                  )}

                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {log.body}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{formatDate(log.created_at)}</span>
                    {log.workflow && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {log.workflow.name}
                      </span>
                    )}
                    {log.recipient_email && (
                      <span>to {log.recipient_email}</span>
                    )}
                    {log.recipient_phone && (
                      <span>to {log.recipient_phone}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
