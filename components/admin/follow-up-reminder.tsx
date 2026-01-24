'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, Check, X, Clock } from 'lucide-react'

export interface Reminder {
  id: string
  leadId: string
  leadName: string
  dueDate: string
  note: string
  isComplete: boolean
}

interface FollowUpReminderProps {
  leadId: string
  leadName: string
  existingReminder?: Reminder
  onSave?: (reminder: Omit<Reminder, 'id' | 'isComplete'>) => Promise<void>
  onComplete?: (reminderId: string) => Promise<void>
  onDelete?: (reminderId: string) => Promise<void>
}

export function FollowUpReminder({
  leadId,
  leadName,
  existingReminder,
  onSave,
  onComplete,
  onDelete,
}: FollowUpReminderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [reminder, setReminder] = useState<Reminder | null>(existingReminder || null)
  const [dueDate, setDueDate] = useState(existingReminder?.dueDate?.split('T')[0] || '')
  const [note, setNote] = useState(existingReminder?.note || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!dueDate) return

    setIsSaving(true)
    const newReminder: Reminder = {
      id: existingReminder?.id || Date.now().toString(),
      leadId,
      leadName,
      dueDate: new Date(dueDate).toISOString(),
      note,
      isComplete: false,
    }

    if (onSave) {
      try {
        await onSave({ leadId, leadName, dueDate: newReminder.dueDate, note })
      } catch {
        // Handle error
      }
    }

    setReminder(newReminder)
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleComplete = async () => {
    if (!reminder) return
    if (onComplete) {
      await onComplete(reminder.id)
    }
    setReminder({ ...reminder, isComplete: true })
  }

  const handleDelete = async () => {
    if (!reminder) return
    if (onDelete) {
      await onDelete(reminder.id)
    }
    setReminder(null)
    setDueDate('')
    setNote('')
  }

  const isOverdue = reminder && new Date(reminder.dueDate) < new Date() && !reminder.isComplete
  const isDueToday =
    reminder &&
    new Date(reminder.dueDate).toDateString() === new Date().toDateString() &&
    !reminder.isComplete

  if (!reminder && !isEditing) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Bell className="h-5 w-5" />
            <span className="text-sm">No follow-up scheduled</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Set Reminder
          </Button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-slate-900 flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-600" />
          Schedule Follow-Up
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Call to discuss quote"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false)
              if (!reminder) {
                setDueDate('')
                setNote('')
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!dueDate || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Reminder'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border rounded-lg p-4 ${
        reminder?.isComplete
          ? 'bg-green-50 border-green-200'
          : isOverdue
          ? 'bg-red-50 border-red-200'
          : isDueToday
          ? 'bg-amber-50 border-amber-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              reminder?.isComplete
                ? 'bg-green-100'
                : isOverdue
                ? 'bg-red-100'
                : 'bg-amber-100'
            }`}
          >
            {reminder?.isComplete ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Bell
                className={`h-4 w-4 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}
              />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">
              {reminder?.isComplete ? 'Completed' : isOverdue ? 'Overdue!' : 'Follow-up scheduled'}
            </p>
            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {reminder && new Date(reminder.dueDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            {reminder?.note && (
              <p className="text-sm text-slate-500 mt-1">{reminder.note}</p>
            )}
          </div>
        </div>
        {!reminder?.isComplete && (
          <div className="flex gap-1">
            <button
              onClick={handleComplete}
              className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
              title="Mark complete"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              title="Edit"
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
              title="Delete"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
