/**
 * Operations Report API
 * GET - Schedule adherence, crew productivity, delays, change orders, cycle time
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '90', 10) || 90, 1), 365)

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Fetch jobs with team info
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        id, job_number, status, scheduled_start, scheduled_end, actual_start, actual_end,
        contract_amount, material_cost, labor_cost,
        assigned_team_id,
        team:assigned_team_id(id, name)
      `)
      .gte('created_at', since.toISOString())
      .limit(500)

    const jobRows = (jobs || []) as Array<{
      id: string; job_number: string; status: string
      scheduled_start: string | null; scheduled_end: string | null
      actual_start: string | null; actual_end: string | null
      contract_amount: number; material_cost: number; labor_cost: number
      assigned_team_id: string | null
      team: { id: string; name: string } | null
    }>

    const jobIds = jobRows.map(j => j.id)

    // Fetch time entries, daily logs, change orders, and status history in parallel
    const [timeResult, logsResult, changeOrderResult, statusHistoryResult] = await Promise.all([
      jobIds.length > 0
        ? supabase
            .from('time_entries')
            .select('job_id, total_hours, user_id, clock_in')
            .in('job_id', jobIds.slice(0, 200))
            .eq('status', 'completed')
        : { data: [] },
      jobIds.length > 0
        ? supabase
            .from('job_daily_logs')
            .select('job_id, hours_worked, work_delayed, delay_reason, weather_conditions, log_date')
            .in('job_id', jobIds.slice(0, 200))
        : { data: [] },
      jobIds.length > 0
        ? supabase
            .from('change_orders')
            .select('job_id, cost_delta, status, reason, created_at')
            .in('job_id', jobIds.slice(0, 200))
        : { data: [] },
      jobIds.length > 0
        ? supabase
            .from('job_status_history')
            .select('job_id, old_status, new_status, created_at')
            .in('job_id', jobIds.slice(0, 200))
            .order('created_at', { ascending: true })
        : { data: [] },
    ])

    const timeEntries = (timeResult.data || []) as Array<{
      job_id: string; total_hours: number | null; user_id: string; clock_in: string
    }>
    const dailyLogs = (logsResult.data || []) as Array<{
      job_id: string; hours_worked: number | null; work_delayed: boolean
      delay_reason: string | null; weather_conditions: string | null; log_date: string
    }>
    const changeOrders = (changeOrderResult.data || []) as Array<{
      job_id: string; cost_delta: number; status: string; reason: string | null; created_at: string
    }>
    const statusHistory = (statusHistoryResult.data || []) as Array<{
      job_id: string; old_status: string | null; new_status: string; created_at: string
    }>

    // Schedule Adherence
    const completedJobs = jobRows.filter(j =>
      ['completed', 'warranty_active', 'closed'].includes(j.status)
    )
    let onTimeCount = 0
    const lateJobs: Array<{
      jobNumber: string; scheduledEnd: string; actualEnd: string; daysLate: number
    }> = []

    for (const job of completedJobs) {
      if (job.scheduled_end && job.actual_end) {
        const scheduledEnd = new Date(job.scheduled_end)
        const actualEnd = new Date(job.actual_end)
        if (actualEnd <= scheduledEnd) {
          onTimeCount++
        } else {
          const daysLate = Math.ceil((actualEnd.getTime() - scheduledEnd.getTime()) / (24 * 60 * 60 * 1000))
          lateJobs.push({
            jobNumber: job.job_number,
            scheduledEnd: job.scheduled_end,
            actualEnd: job.actual_end,
            daysLate,
          })
        }
      }
    }

    const jobsWithSchedule = completedJobs.filter(j => j.scheduled_end && j.actual_end).length
    const scheduleAdherencePct = jobsWithSchedule > 0
      ? Math.round((onTimeCount / jobsWithSchedule) * 100)
      : null

    const avgDaysOver = lateJobs.length > 0
      ? Math.round(lateJobs.reduce((sum, j) => sum + j.daysLate, 0) / lateJobs.length)
      : 0

    // Crew Productivity by team
    const teamHours = new Map<string, { name: string; totalHours: number; jobCount: Set<string>; laborCost: number }>()
    for (const job of jobRows) {
      if (job.team) {
        if (!teamHours.has(job.team.id)) {
          teamHours.set(job.team.id, { name: job.team.name, totalHours: 0, jobCount: new Set(), laborCost: 0 })
        }
        const team = teamHours.get(job.team.id)!
        team.jobCount.add(job.id)
        team.laborCost += job.labor_cost || 0
      }
    }

    for (const entry of timeEntries) {
      const job = jobRows.find(j => j.id === entry.job_id)
      if (job?.team && teamHours.has(job.team.id)) {
        teamHours.get(job.team.id)!.totalHours += entry.total_hours || 0
      }
    }

    const crewProductivity = Array.from(teamHours.entries())
      .map(([id, data]) => ({
        teamId: id,
        teamName: data.name,
        totalHours: Math.round(data.totalHours * 10) / 10,
        jobCount: data.jobCount.size,
        avgHoursPerJob: data.jobCount.size > 0
          ? Math.round((data.totalHours / data.jobCount.size) * 10) / 10
          : 0,
        laborCost: data.laborCost,
        costPerHour: data.totalHours > 0
          ? Math.round(data.laborCost / data.totalHours)
          : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours)

    const totalHours = timeEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0)
    const avgHoursPerJob = jobIds.length > 0 ? Math.round((totalHours / jobIds.length) * 10) / 10 : 0

    // Delays
    const delayedLogs = dailyLogs.filter(l => l.work_delayed)
    const delayReasons: Record<string, number> = {}
    let weatherDays = 0
    for (const log of delayedLogs) {
      const reason = log.delay_reason || 'Unspecified'
      delayReasons[reason] = (delayReasons[reason] || 0) + 1
      if (log.weather_conditions && ['rain', 'storm', 'snow', 'ice', 'wind'].some(w =>
        (log.weather_conditions || '').toLowerCase().includes(w)
      )) {
        weatherDays++
      }
    }

    // Change Orders
    const approvedCOs = changeOrders.filter(co => co.status === 'approved')
    const totalCOCost = approvedCOs.reduce((sum, co) => sum + (co.cost_delta || 0), 0)
    const avgCOPerJob = jobIds.length > 0
      ? Math.round((changeOrders.length / jobIds.length) * 100) / 100
      : 0

    const coReasons: Record<string, number> = {}
    for (const co of changeOrders) {
      const reason = co.reason || 'Unspecified'
      coReasons[reason] = (coReasons[reason] || 0) + 1
    }

    // Job Cycle Time
    const cycleTimes: number[] = []
    for (const job of completedJobs) {
      if (job.actual_start && job.actual_end) {
        const daysDiff = Math.ceil(
          (new Date(job.actual_end).getTime() - new Date(job.actual_start).getTime()) / (24 * 60 * 60 * 1000)
        )
        cycleTimes.push(daysDiff)
      }
    }

    const avgCycleTime = cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
      : null

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      scheduleAdherence: {
        onTimePct: scheduleAdherencePct,
        lateJobsCount: lateJobs.length,
        avgDaysOver,
        totalTracked: jobsWithSchedule,
      },
      lateJobs: lateJobs.sort((a, b) => b.daysLate - a.daysLate).slice(0, 20),
      crewProductivity,
      productivitySummary: {
        totalHours: Math.round(totalHours * 10) / 10,
        avgHoursPerJob,
      },
      delays: {
        totalDelayDays: delayedLogs.length,
        weatherDays,
        reasons: Object.entries(delayReasons)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count),
      },
      changeOrders: {
        totalCount: changeOrders.length,
        approvedCount: approvedCOs.length,
        totalCostImpact: totalCOCost,
        avgPerJob: avgCOPerJob,
        reasons: Object.entries(coReasons)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      },
      cycleTime: {
        avgDays: avgCycleTime,
        completedJobCount: cycleTimes.length,
      },
    })
  } catch (error) {
    console.error('Operations report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
