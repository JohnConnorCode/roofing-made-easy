'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { Activity, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

interface ActivityEntry {
  id: string
  action: string
  category: string
  entity_type: string | null
  entity_name: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
  user_info: {
    first_name: string
    last_name: string
  } | null
}

interface ActivityLogPanelProps {
  entityType?: string
  entityId?: string
  limit?: number
}

const ACTION_LABELS: Record<string, string> = {
  job_status_changed: 'changed job status',
  job_created: 'created a job',
  job_updated: 'updated job',
  lead_status_changed: 'changed lead status',
  estimate_generated: 'generated estimate',
  invoice_created: 'created invoice',
  payment_recorded: 'recorded payment',
  change_order_created: 'created change order',
  change_order_approved: 'approved change order',
  change_order_rejected: 'rejected change order',
  note_added: 'added a note',
}

export function ActivityLogPanel({ entityType, entityId, limit = 10 }: ActivityLogPanelProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(limit) })
      if (entityType) params.set('entity_type', entityType)
      if (entityId) params.set('entity_id', entityId)

      const res = await fetch(`/api/admin/activity?${params}`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId, limit])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
    )
  }

  const displayed = isExpanded ? activities : activities.slice(0, 5)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </h4>
        <button onClick={fetchActivities} className="text-xs text-blue-600 hover:underline">
          Refresh
        </button>
      </div>

      <div className="space-y-1.5">
        {displayed.map((entry) => {
          const actionLabel = ACTION_LABELS[entry.action] || entry.action.replace(/_/g, ' ')
          const userName = entry.user_info
            ? `${entry.user_info.first_name} ${entry.user_info.last_name}`
            : 'System'

          return (
            <div key={entry.id} className="flex items-start gap-2 py-1.5">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-slate-700">{userName}</span>
                {' '}
                <span className="text-slate-500">{actionLabel}</span>
                {entry.entity_name && (
                  <span className="text-slate-700"> — {entry.entity_name}</span>
                )}
                {entry.old_values?.status != null && entry.new_values?.status != null && (
                  <span className="text-xs text-slate-400 ml-1">
                    ({String(entry.old_values.status).replace(/_/g, ' ')} → {String(entry.new_values.status).replace(/_/g, ' ')})
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-2">{formatDate(entry.created_at)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {activities.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {isExpanded ? 'Show less' : `Show all (${activities.length})`}
        </button>
      )}
    </div>
  )
}
