'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Send,
  Trash2,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface ScheduledMessage {
  id: string
  lead_id: string | null
  customer_id: string | null
  recipient_email: string | null
  recipient_phone: string | null
  recipient_name: string | null
  channel: 'email' | 'sms'
  subject: string | null
  body: string
  scheduled_for: string
  sent_at: string | null
  status: 'pending' | 'scheduled' | 'processing' | 'sent' | 'failed' | 'cancelled'
  error_message: string | null
  workflow: { id: string; name: string } | null
  template: { id: string; name: string } | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CHANNEL_OPTIONS = [
  { value: '', label: 'All Channels' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  scheduled: Calendar,
  processing: RefreshCw,
  sent: CheckCircle2,
  failed: XCircle,
  cancelled: Pause,
}

const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
}

const LIMIT = 25

export default function MessagesPage() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (channelFilter) params.set('channel', channelFilter)
      params.set('limit', LIMIT.toString())
      params.set('offset', offset.toString())

      const response = await fetch(`/api/admin/messages/scheduled?${params}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()

      setMessages(data.messages || [])
      setTotal(data.total || 0)
      setCounts(data.counts || {})
    } catch {
      setError('Failed to load scheduled messages')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, channelFilter, offset])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleCancel = async () => {
    if (!cancelId) return

    try {
      const response = await fetch(`/api/admin/messages/scheduled?id=${cancelId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel message')
      }

      await fetchMessages()
      setCancelId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel message')
    }
  }

  const pendingCount = (counts.pending || 0) + (counts.scheduled || 0)
  const sentCount = counts.sent || 0
  const failedCount = counts.failed || 0

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheduled Messages</h1>
          <p className="text-slate-500">View and manage automated message queue</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
                <div className="text-sm text-slate-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{sentCount}</div>
                <div className="text-sm text-slate-500">Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{failedCount}</div>
                <div className="text-sm text-slate-500">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{total}</div>
                <div className="text-sm text-slate-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setOffset(0) }}
              className="md:w-40 bg-white border-slate-300 text-slate-900"
            />
            <Select
              options={CHANNEL_OPTIONS}
              value={channelFilter}
              onChange={(v) => { setChannelFilter(v); setOffset(0) }}
              className="md:w-40 bg-white border-slate-300 text-slate-900"
            />
            {(statusFilter || channelFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter(''); setChannelFilter(''); setOffset(0) }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {total} Message{total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No messages found</p>
              <p className="text-sm text-slate-400">Messages will appear here when workflows trigger</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const StatusIcon = STATUS_ICONS[msg.status] || Clock
                const ChannelIcon = CHANNEL_ICONS[msg.channel] || Mail
                const canCancel = ['pending', 'scheduled'].includes(msg.status)

                return (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Channel icon */}
                      <div className="mt-1">
                        <ChannelIcon className="h-5 w-5 text-slate-400" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${STATUS_COLORS[msg.status]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {msg.status}
                          </span>
                          {msg.workflow && (
                            <span className="text-xs text-slate-500">
                              via {msg.workflow.name}
                            </span>
                          )}
                        </div>

                        <div className="font-medium text-slate-900 truncate">
                          {msg.channel === 'email' ? msg.subject : msg.body.substring(0, 60)}
                          {msg.body.length > 60 && '...'}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {msg.recipient_name || msg.recipient_email || msg.recipient_phone || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(msg.scheduled_for)}
                          </span>
                        </div>

                        {msg.error_message && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            {msg.error_message}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelId(msg.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={offset + LIMIT >= total}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Message"
        description="Are you sure you want to cancel this scheduled message? This action cannot be undone."
        confirmText="Cancel Message"
        variant="danger"
        onConfirm={handleCancel}
      />
    </div>
  )
}
