'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  Plus,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  event_type: string
  status: string
  start_at: string
  end_at: string
  all_day: boolean
  location: string | null
  color: string | null
  assigned_user?: { id: string; first_name: string | null; last_name: string | null } | null
  team?: { id: string; name: string; color: string } | null
  job?: { id: string; job_number: string } | null
}

type ViewMode = 'month' | 'week' | 'day'

const EVENT_TYPE_COLORS: Record<string, string> = {
  appointment: '#3b82f6',
  job_work: '#8b5cf6',
  inspection: '#f59e0b',
  material_delivery: '#10b981',
  crew_meeting: '#6366f1',
  other: '#94a3b8',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  appointment: 'Appointment',
  job_work: 'Job Work',
  inspection: 'Inspection',
  material_delivery: 'Delivery',
  crew_meeting: 'Meeting',
  other: 'Other',
}

const VIEW_OPTIONS = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let startDate: string
      let endDate: string

      if (viewMode === 'month') {
        startDate = new Date(year, month, 1).toISOString()
        endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      } else if (viewMode === 'week') {
        const dayOfWeek = currentDate.getDay()
        const start = new Date(currentDate)
        start.setDate(start.getDate() - dayOfWeek)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        startDate = start.toISOString()
        endDate = end.toISOString()
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toISOString()
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59).toISOString()
      }

      const params = new URLSearchParams({ start: startDate, end: endDate })
      const response = await fetch(`/api/admin/calendar?${params}`)
      if (!response.ok) throw new Error('Failed to fetch events')

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError('Unable to load calendar events.')
    } finally {
      setIsLoading(false)
    }
  }, [year, month, currentDate, viewMode])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7)
    } else {
      newDate.setDate(newDate.getDate() + direction)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start_at).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const headerLabel = viewMode === 'month'
    ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : viewMode === 'week'
    ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  // Build month grid
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date().toISOString().split('T')[0]

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500">Schedule jobs, appointments, and team activities</p>
        </div>
        <Link href="/calendar/team">
          <Button variant="outline" size="sm">
            Team Schedule
          </Button>
        </Link>
      </div>
      </FadeInSection>

      {/* Controls */}
      <FadeInSection delay={100} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-slate-900 ml-2">{headerLabel}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select
                options={VIEW_OPTIONS}
                value={viewMode}
                onChange={(val) => setViewMode(val as ViewMode)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEvents}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </FadeInSection>

      {error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchEvents}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      <FadeInSection delay={200} animation="slide-up">
      {!error && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                {viewMode === 'month' && (
                  <>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-px mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar cells */}
                    <div className="relative grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                      {/* Empty month overlay */}
                      {!isLoading && events.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="text-center">
                            <CalendarDays className="h-10 w-10 text-slate-300 mx-auto" />
                            <p className="mt-2 text-sm text-slate-400">No events this month</p>
                          </div>
                        </div>
                      )}
                      {/* Empty cells before first day */}
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-50 min-h-[80px] p-1" />
                      ))}

                      {/* Day cells */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const dayEvents = getEventsForDate(dateStr)
                        const isToday = dateStr === today
                        const isSelected = dateStr === selectedDate

                        return (
                          <div
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`bg-white min-h-[80px] p-1 cursor-pointer transition-colors hover:bg-slate-50 ${
                              isSelected ? 'ring-2 ring-gold ring-inset' : ''
                            }`}
                          >
                            <span className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                              isToday ? 'bg-gold text-white' : 'text-slate-700'
                            }`}>
                              {day}
                            </span>
                            <div className="mt-1 space-y-0.5">
                              {dayEvents.slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  className="text-[10px] leading-tight px-1 py-0.5 rounded truncate text-white"
                                  style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.event_type] || '#94a3b8' }}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-[10px] text-slate-400 px-1">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                {viewMode === 'week' && (
                  <div className="space-y-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const dayDate = new Date(currentDate)
                      dayDate.setDate(dayDate.getDate() - dayDate.getDay() + i)
                      const dateStr = dayDate.toISOString().split('T')[0]
                      const dayEvents = getEventsForDate(dateStr)
                      const isToday = dateStr === today

                      return (
                        <div key={dateStr} className={`rounded-lg border p-3 ${isToday ? 'border-gold bg-gold/5' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-medium ${isToday ? 'text-gold' : 'text-slate-700'}`}>
                              {dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs text-slate-400">{dayEvents.length} events</span>
                          </div>
                          {dayEvents.length === 0 ? (
                            <p className="text-xs text-slate-400">No events</p>
                          ) : (
                            <div className="space-y-1">
                              {dayEvents.map((event) => (
                                <div key={event.id} className="flex items-center gap-2 text-sm">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.event_type] }}
                                  />
                                  <span className="text-xs text-slate-500">
                                    {new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                  <span className="text-sm text-slate-700 truncate">{event.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {viewMode === 'day' && (
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    ) : events.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarDays className="h-10 w-10 text-slate-300 mx-auto" />
                        <p className="mt-2 text-slate-500">No events for this day</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <div key={event.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.event_type] }}
                                />
                                <h3 className="font-medium text-slate-900">{event.title}</h3>
                              </div>
                              {event.description && (
                                <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  {' - '}
                                  {new Date(event.end_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 capitalize">
                              {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-slate-200 sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">
                  {selectedDate
                    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                    : "Today's Events"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">No events for this day</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => (
                      <div key={event.id} className="border-l-2 pl-3 py-1" style={{ borderColor: event.color || EVENT_TYPE_COLORS[event.event_type] }}>
                        <p className="text-sm font-medium text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {event.all_day ? 'All day' : new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                        {event.job && (
                          <Link href={`/jobs/${event.job.id}`} className="text-xs text-gold hover:underline">
                            {event.job.job_number}
                          </Link>
                        )}
                        {event.assigned_user && (
                          <p className="text-xs text-slate-400">
                            {event.assigned_user.first_name} {event.assigned_user.last_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Event type legend */}
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs font-medium text-slate-500 mb-2">Event Types</p>
                  <div className="space-y-1">
                    {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[type] }} />
                        <span className="text-xs text-slate-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </FadeInSection>
    </AdminPageTransition>
  )
}
