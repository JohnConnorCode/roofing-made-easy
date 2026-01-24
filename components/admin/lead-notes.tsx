'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus, Clock, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export interface LeadNote {
  id: string
  text: string
  author: string
  createdAt: string
  type: 'note' | 'call' | 'email' | 'status_change'
}

interface LeadNotesProps {
  leadId: string
  initialNotes?: LeadNote[]
  onAddNote?: (note: Omit<LeadNote, 'id' | 'createdAt'>) => Promise<void>
}

const NOTE_TYPE_LABELS = {
  note: { label: 'Note', color: 'bg-slate-100 text-slate-700' },
  call: { label: 'Call', color: 'bg-green-100 text-green-700' },
  email: { label: 'Email', color: 'bg-blue-100 text-blue-700' },
  status_change: { label: 'Status', color: 'bg-amber-100 text-amber-700' },
}

export function LeadNotes({ leadId, initialNotes = [], onAddNote }: LeadNotesProps) {
  const [notes, setNotes] = useState<LeadNote[]>(initialNotes)
  const [isAdding, setIsAdding] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<LeadNote['type']>('note')
  const [isSaving, setIsSaving] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSaving(true)
    const note: LeadNote = {
      id: Date.now().toString(),
      text: newNote,
      author: 'Admin', // In production, get from auth context
      createdAt: new Date().toISOString(),
      type: noteType,
    }

    if (onAddNote) {
      try {
        await onAddNote({ text: newNote, author: 'Admin', type: noteType })
      } catch {
        // Handle error
      }
    }

    // Add locally for immediate feedback
    setNotes([note, ...notes])
    setNewNote('')
    setIsAdding(false)
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes & Activity
        </h3>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Note
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            {(Object.keys(NOTE_TYPE_LABELS) as LeadNote['type'][]).map((type) => (
              <button
                key={type}
                onClick={() => setNoteType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  noteType === type
                    ? NOTE_TYPE_LABELS[type].color
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {NOTE_TYPE_LABELS[type].label}
              </button>
            ))}
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this lead..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false)
                setNewNote('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm">Add notes to track your interactions with this lead.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="border border-slate-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    NOTE_TYPE_LABELS[note.type].color
                  }`}
                >
                  {NOTE_TYPE_LABELS[note.type].label}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <p className="text-slate-700 text-sm">{note.text}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <User className="h-3 w-3" />
                {note.author}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
