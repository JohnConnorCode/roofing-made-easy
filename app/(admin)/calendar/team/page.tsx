'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { SkeletonPageContent } from '@/components/ui/skeleton'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface ScheduleMember {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
}

interface ScheduleEvent {
  id: string
  title: string
  event_type: string
  start_at: string
  end_at: string
  all_day: boolean
  status: string
  color: string | null
  job?: { id: string; job_number: string } | null
}

interface ScheduleAvailability {
  date: string
  available: boolean
  reason: string | null
}

interface MemberSchedule {
  member: ScheduleMember
  events: ScheduleEvent[]
  availability: ScheduleAvailability[]
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  appointment: '#3b82f6',
  job_work: '#8b5cf6',
  inspection: '#f59e0b',
  material_delivery: '#10b981',
  crew_meeting: '#6366f1',
  other: '#94a3b8',
}

export default function TeamSchedulePage() {
  const [schedule, setSchedule] = useState<MemberSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    return d
  })

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const startStr = weekStart.toISOString().split('T')[0]
      const endDate = new Date(weekStart)
      endDate.setDate(endDate.getDate() + 6)
      const endStr = endDate.toISOString().split('T')[0]

      const params = new URLSearchParams({ start: startStr, end: endStr })
      const response = await fetch(`/api/admin/calendar/team-schedule?${params}`)
      if (!response.ok) throw new Error('Failed to fetch schedule')

      const data = await response.json()
      setSchedule(data.schedule || [])
    } catch (err) {
      setError('Unable to load team schedule.')
    } finally {
      setIsLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  const navigateWeek = (direction: number) => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + direction * 7)
    setWeekStart(newDate)
  }

  const goToThisWeek = () => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    setWeekStart(d)
  }

  const today = new Date().toISOString().split('T')[0]

  const getEventsForMemberDate = (memberId: string, dateStr: string) => {
    const memberData = schedule.find((s) => s.member.id === memberId)
    if (!memberData) return []
    return memberData.events.filter((e) => {
      const eventDate = new Date(e.start_at).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const getAvailabilityForMemberDate = (memberId: string, dateStr: string) => {
    const memberData = schedule.find((s) => s.member.id === memberId)
    if (!memberData) return null
    return memberData.availability.find((a) => a.date === dateStr) || null
  }

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/calendar">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Calendar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Schedule</h1>
            <p className="text-slate-500">Weekly view of crew assignments and availability</p>
          </div>
        </div>
      </div>
      </FadeInSection>

      <FadeInSection delay={100} animation="slide-up">
      {/* Week Navigation */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToThisWeek}>
                This Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-slate-900 ml-2">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' - '}
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSchedule}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      </FadeInSection>

      <FadeInSection delay={200} animation="slide-up">
      {error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchSchedule}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <SkeletonPageContent />
              </div>
            ) : schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-slate-600">No team members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 w-40">
                        Team Member
                      </th>
                      {weekDates.map((date) => {
                        const dateStr = date.toISOString().split('T')[0]
                        const isToday = dateStr === today
                        return (
                          <th
                            key={dateStr}
                            className={`px-2 py-3 text-center text-sm font-medium min-w-[120px] ${
                              isToday ? 'bg-gold/5 text-gold' : 'text-slate-500'
                            }`}
                          >
                            <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className="text-xs">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((memberSchedule) => (
                      <tr key={memberSchedule.member.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {memberSchedule.member.first_name} {memberSchedule.member.last_name}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">{memberSchedule.member.role.replace('_', ' ')}</p>
                          </div>
                        </td>
                        {weekDates.map((date) => {
                          const dateStr = date.toISOString().split('T')[0]
                          const isToday = dateStr === today
                          const dayEvents = getEventsForMemberDate(memberSchedule.member.id, dateStr)
                          const avail = getAvailabilityForMemberDate(memberSchedule.member.id, dateStr)
                          const isUnavailable = avail && !avail.available

                          return (
                            <td
                              key={dateStr}
                              className={`px-2 py-2 align-top min-w-[120px] ${
                                isToday ? 'bg-gold/5' : ''
                              } ${isUnavailable ? 'bg-red-50' : ''}`}
                            >
                              {isUnavailable && (
                                <div className="text-[10px] text-red-600 bg-red-100 rounded px-1 py-0.5 mb-1 truncate">
                                  {avail?.reason || 'Unavailable'}
                                </div>
                              )}
                              {dayEvents.map((event) => (
                                <div
                                  key={event.id}
                                  className="text-[10px] leading-tight px-1 py-0.5 rounded mb-0.5 text-white truncate"
                                  style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.event_type] || '#94a3b8' }}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length === 0 && !isUnavailable && (
                                <span className="text-[10px] text-slate-300">-</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </FadeInSection>
    </AdminPageTransition>
  )
}
