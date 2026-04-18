/**
 * Team scheduling conflict detection.
 *
 * Called before any job is assigned to a team with scheduled dates, and
 * before any update to an existing job's schedule or team. A conflict is
 * another non-closed job assigned to the same team whose scheduled window
 * overlaps the new one.
 *
 * Overlap rule (inclusive at both ends): existing.end >= new.start AND
 * existing.start <= new.end. Same-day handoffs ARE considered conflicts —
 * materials run from one job, crew on the next. Change mid-day and you'll
 * feel it.
 *
 * Dates are `scheduled_start` / `scheduled_end` on `jobs` (DATE columns,
 * not timestamptz — contractor-scale scheduling is day-granular). Callers
 * passing date-time strings can pass just the YYYY-MM-DD prefix.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ConflictCheckInput {
  teamId: string
  scheduledStart: string | null
  scheduledEnd: string | null
  excludeJobId?: string
  excludeCalendarEventId?: string
}

export interface ConflictingJob {
  kind: 'job' | 'calendar_event'
  jobId: string
  jobNumber: string
  status: string
  scheduledStart: string | null
  scheduledEnd: string | null
  customerName: string | null
}

export interface ConflictCheckResult {
  hasConflict: boolean
  conflicts: ConflictingJob[]
}

// Statuses that aren't "active on the calendar" — closed jobs are historical,
// completed/warranty have no ongoing crew footprint.
const INACTIVE_STATUSES = ['closed', 'completed', 'warranty_active']

export async function detectTeamSchedulingConflicts(
  supabase: SupabaseClient,
  input: ConflictCheckInput
): Promise<ConflictCheckResult> {
  // No conflict possible without both team and schedule. Skip the query.
  if (!input.teamId || !input.scheduledStart || !input.scheduledEnd) {
    return { hasConflict: false, conflicts: [] }
  }

  // Normalize to YYYY-MM-DD in case a timestamp string came in.
  const start = input.scheduledStart.slice(0, 10)
  const end = input.scheduledEnd.slice(0, 10)

  // Overlap check: existing.scheduled_end >= new.start AND existing.scheduled_start <= new.end.
  // Scoped to same team, not inactive statuses, excluding the job being updated.
  let query = supabase
    .from('jobs')
    .select('id, job_number, status, scheduled_start, scheduled_end, lead_id')
    .eq('assigned_team_id', input.teamId)
    .not('status', 'in', `(${INACTIVE_STATUSES.map((s) => `"${s}"`).join(',')})`)
    .not('scheduled_start', 'is', null)
    .not('scheduled_end', 'is', null)
    .lte('scheduled_start', end)
    .gte('scheduled_end', start)

  if (input.excludeJobId) {
    query = query.neq('id', input.excludeJobId)
  }

  const { data: overlapping } = await query

  if (!overlapping || overlapping.length === 0) {
    return { hasConflict: false, conflicts: [] }
  }

  // Fetch customer names for the conflicts in a single batch (cheap even at
  // 10+ conflicts, which would itself be a bigger problem).
  const leadIds = overlapping
    .map((j) => (j as { lead_id: string | null }).lead_id)
    .filter((id): id is string => !!id)

  const nameMap: Record<string, string> = {}
  if (leadIds.length > 0) {
    const { data: leads } = await supabase
      .from('leads')
      .select('id, contacts(first_name, last_name)')
      .in('id', leadIds)

    for (const lead of leads ?? []) {
      const row = lead as {
        id: string
        contacts: Array<{ first_name?: string; last_name?: string }> | { first_name?: string; last_name?: string } | null
      }
      const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts
      if (contact) {
        nameMap[row.id] = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
      }
    }
  }

  const conflicts: ConflictingJob[] = overlapping.map((job) => {
    const j = job as {
      id: string
      job_number: string
      status: string
      scheduled_start: string | null
      scheduled_end: string | null
      lead_id: string | null
    }
    return {
      kind: 'job' as const,
      jobId: j.id,
      jobNumber: j.job_number,
      status: j.status,
      scheduledStart: j.scheduled_start,
      scheduledEnd: j.scheduled_end,
      customerName: j.lead_id ? nameMap[j.lead_id] ?? null : null,
    }
  })

  return { hasConflict: true, conflicts }
}

/**
 * Check calendar_events for the same team during a specific time window.
 * Use when scheduling inspections, site visits, or other crew assignments
 * that don't live on the jobs table. Timestamp-granular (hours matter).
 */
export interface CalendarConflictInput {
  teamId: string
  startAt: string
  endAt: string
  excludeEventId?: string
}

export async function detectTeamCalendarConflicts(
  supabase: SupabaseClient,
  input: CalendarConflictInput
): Promise<ConflictCheckResult> {
  if (!input.teamId || !input.startAt || !input.endAt) {
    return { hasConflict: false, conflicts: [] }
  }

  let query = supabase
    .from('calendar_events')
    .select('id, title, status, start_at, end_at')
    .eq('assigned_team_id', input.teamId)
    .neq('status', 'cancelled')
    .lte('start_at', input.endAt)
    .gte('end_at', input.startAt)

  if (input.excludeEventId) {
    query = query.neq('id', input.excludeEventId)
  }

  const { data: overlapping } = await query

  if (!overlapping || overlapping.length === 0) {
    return { hasConflict: false, conflicts: [] }
  }

  const conflicts: ConflictingJob[] = overlapping.map((ev) => {
    const e = ev as {
      id: string
      title: string
      status: string
      start_at: string
      end_at: string
    }
    return {
      kind: 'calendar_event' as const,
      jobId: e.id,
      jobNumber: e.title,
      status: e.status,
      scheduledStart: e.start_at,
      scheduledEnd: e.end_at,
      customerName: null,
    }
  })

  return { hasConflict: true, conflicts }
}

/**
 * Human-readable message summarizing a conflict. Used in 409 responses and
 * admin toast. Singular/plural aware. Short enough for a toast.
 */
export function formatConflictMessage(conflicts: ConflictingJob[]): string {
  if (conflicts.length === 0) return ''
  if (conflicts.length === 1) {
    const c = conflicts[0]
    const who = c.customerName ? ` for ${c.customerName}` : ''
    return `Schedule overlaps with job ${c.jobNumber}${who} (${c.scheduledStart} to ${c.scheduledEnd}).`
  }
  return `Schedule overlaps with ${conflicts.length} other jobs: ${conflicts
    .map((c) => c.jobNumber)
    .join(', ')}.`
}
