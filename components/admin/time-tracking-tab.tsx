'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils'
import {
  Clock,
  Play,
  Square,
  Coffee,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { TimeEntry } from '@/lib/jobs/types'

interface TimeTrackingTabProps {
  jobId: string
  estimatedHours?: number
}

interface Summary {
  totalHours: number
  entryCount: number
  hasActiveEntry: boolean
  activeEntryId: string | null
}

export function TimeTrackingTab({ jobId, estimatedHours }: TimeTrackingTabProps) {
  const { showToast } = useToast()

  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [summary, setSummary] = useState<Summary>({ totalHours: 0, entryCount: 0, hasActiveEntry: false, activeEntryId: null })
  const [isLoading, setIsLoading] = useState(true)
  const [isClocking, setIsClocking] = useState(false)
  const [clockOutNotes, setClockOutNotes] = useState('')
  const [breakMinutes, setBreakMinutes] = useState(0)

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/time-entries`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setSummary(data.summary || { totalHours: 0, entryCount: 0, hasActiveEntry: false, activeEntryId: null })
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleClockIn = async () => {
    setIsClocking(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/time-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Clock in failed')
      }
      showToast('Clocked in', 'success')
      fetchEntries()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Clock in failed'
      showToast(msg, 'error')
    } finally {
      setIsClocking(false)
    }
  }

  const handleClockOut = async () => {
    if (!summary.activeEntryId) return
    setIsClocking(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/time-entries/${summary.activeEntryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clock_out: true,
          break_minutes: breakMinutes,
          notes: clockOutNotes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Clock out failed')
      showToast('Clocked out', 'success')
      setClockOutNotes('')
      setBreakMinutes(0)
      fetchEntries()
    } catch {
      showToast('Clock out failed', 'error')
    } finally {
      setIsClocking(false)
    }
  }

  const handleVoid = async (entryId: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/time-entries/${entryId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Void failed')
      showToast('Entry voided', 'success')
      fetchEntries()
    } catch {
      showToast('Failed to void entry', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  const hoursPercent = estimatedHours && estimatedHours > 0
    ? Math.min((summary.totalHours / estimatedHours) * 100, 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Hours Tracked</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalHours}h</p>
            {estimatedHours && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{summary.totalHours}h / {estimatedHours}h estimated</span>
                  <span>{hoursPercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${hoursPercent > 90 ? 'bg-red-500' : hoursPercent > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${hoursPercent}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Entries</p>
            <p className="text-2xl font-bold text-slate-900">{summary.entryCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className={`text-lg font-bold ${summary.hasActiveEntry ? 'text-green-600' : 'text-slate-500'}`}>
              {summary.hasActiveEntry ? 'Clocked In' : 'Not Clocked In'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clock in/out controls */}
      <Card>
        <CardContent className="p-4">
          {summary.hasActiveEntry ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700">Currently clocked in</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="480"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-slate-500">min break</span>
                </div>
                <input
                  type="text"
                  value={clockOutNotes}
                  onChange={(e) => setClockOutNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="flex-1 min-w-[200px] rounded border border-slate-300 px-3 py-1 text-sm"
                />
              </div>
              <Button
                variant="primary"
                onClick={handleClockOut}
                disabled={isClocking}
                leftIcon={<Square className="h-4 w-4" />}
                className="bg-red-500 hover:bg-red-600"
              >
                {isClocking ? 'Clocking out...' : 'Clock Out'}
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handleClockIn}
              disabled={isClocking}
              leftIcon={<Play className="h-4 w-4" />}
            >
              {isClocking ? 'Clocking in...' : 'Clock In'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Entry list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No time entries recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-slate-500">
                    <th className="pb-3 pr-4">Person</th>
                    <th className="pb-3 pr-4">Clock In</th>
                    <th className="pb-3 pr-4">Clock Out</th>
                    <th className="pb-3 pr-4">Break</th>
                    <th className="pb-3 pr-4">Hours</th>
                    <th className="pb-3 pr-4">Notes</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-sm">
                        {entry.user
                          ? `${entry.user.first_name} ${entry.user.last_name}`
                          : 'Unknown'}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-700">{formatDate(entry.clock_in)}</td>
                      <td className="py-3 pr-4 text-sm text-slate-700">
                        {entry.clock_out ? formatDate(entry.clock_out) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{entry.break_minutes}m</td>
                      <td className="py-3 pr-4 text-sm font-medium">
                        {entry.total_hours != null ? `${entry.total_hours}h` : '-'}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500 max-w-[200px] truncate">
                        {entry.notes || '-'}
                      </td>
                      <td className="py-3">
                        {entry.status !== 'active' && (
                          <button
                            onClick={() => handleVoid(entry.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Void entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
