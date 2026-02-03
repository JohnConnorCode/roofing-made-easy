'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Calendar,
  Pin,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export interface LeadActivity {
  id: string
  type: 'note' | 'call' | 'email' | 'sms' | 'status_change' | 'estimate_generated' | 'quote_sent' | 'appointment_scheduled' | 'system'
  content: string
  metadata?: Record<string, unknown>
  author_name?: string
  author_email?: string
  is_system_generated: boolean
  pinned: boolean
  created_at: string
}

interface LeadNotesProps {
  leadId: string
}

const ACTIVITY_CONFIG: Record<LeadActivity['type'], {
  label: string
  icon: typeof MessageSquare
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  note: {
    label: 'Note',
    icon: MessageSquare,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
  },
  call: {
    label: 'Call',
    icon: Phone,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  email: {
    label: 'Email',
    icon: Mail,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  sms: {
    label: 'SMS',
    icon: MessageCircle,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  status_change: {
    label: 'Status',
    icon: TrendingUp,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  estimate_generated: {
    label: 'Estimate',
    icon: FileText,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  quote_sent: {
    label: 'Quote Sent',
    icon: FileText,
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  appointment_scheduled: {
    label: 'Appointment',
    icon: Calendar,
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
  },
  system: {
    label: 'System',
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
}

const ACTIVITY_TYPES: LeadActivity['type'][] = ['note', 'call', 'email', 'sms', 'appointment_scheduled']

export function LeadNotes({ leadId }: LeadNotesProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<LeadActivity['type']>('note')
  const [isSaving, setIsSaving] = useState(false)

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`)
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()
      setActivities(data.activities || [])
    } catch {
      setError('Unable to load activity history')
    } finally {
      setIsLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleAddActivity = async () => {
    if (!newContent.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          content: newContent,
        }),
      })

      if (!response.ok) throw new Error('Failed to add activity')

      const data = await response.json()
      setActivities([data.activity, ...activities])
      setNewContent('')
      setIsAdding(false)
    } catch {
      // Failed to add activity
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/activities?id=${activityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setActivities(activities.filter(a => a.id !== activityId))
    } catch {
      // Failed to delete activity
    }
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, LeadActivity[]>)

  // Separate pinned activities
  const pinnedActivities = activities.filter(a => a.pinned)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Activity Timeline
        </h3>
        <div className="flex gap-2">
          {!isAdding && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchActivities}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Note
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add New Activity Form */}
      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((type) => {
              const config = ACTIVITY_CONFIG[type]
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => setNewType(type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    newType === type
                      ? `${config.bgColor} ${config.textColor}`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </button>
              )
            })}
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={`Add ${ACTIVITY_CONFIG[newType].label.toLowerCase()} notes...`}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false)
                setNewContent('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddActivity}
              disabled={!newContent.trim() || isSaving}
              leftIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No activity yet</p>
          <p className="text-sm">Add notes, log calls, and track interactions.</p>
        </div>
      )}

      {/* Pinned Activities */}
      {pinnedActivities.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Pin className="h-3 w-3" /> Pinned
          </p>
          {pinnedActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Grouped Activities Timeline */}
      {!isLoading && Object.keys(groupedActivities).length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {date}
              </p>
              <div className="space-y-2 relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-200" />
                {dayActivities
                  .filter(a => !a.pinned)
                  .map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityCard({
  activity,
  onDelete,
}: {
  activity: LeadActivity
  onDelete: (id: string) => void
}) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.note
  const Icon = config.icon

  return (
    <div
      className={`relative pl-8 group ${activity.pinned ? 'bg-amber-50/50 rounded-lg p-3 -ml-3' : ''}`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} border-2 border-white shadow-sm`}
      >
        <Icon className={`h-4 w-4 ${config.textColor}`} />
      </div>

      <div className={`bg-white border ${config.borderColor} rounded-lg p-3`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
              >
                {config.label}
              </span>
              {activity.is_system_generated && (
                <span className="text-xs text-slate-400">Auto</span>
              )}
              {activity.pinned && (
                <Pin className="h-3 w-3 text-amber-500" />
              )}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{activity.content}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(activity.created_at)}
              </span>
              {activity.author_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {activity.author_name}
                </span>
              )}
            </div>
          </div>
          {!activity.is_system_generated && (
            <button
              onClick={() => onDelete(activity.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
