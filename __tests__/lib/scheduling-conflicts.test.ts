import { describe, it, expect, vi } from 'vitest'
import {
  detectTeamSchedulingConflicts,
  detectTeamCalendarConflicts,
  formatConflictMessage,
} from '@/lib/scheduling/conflicts'

/**
 * Thin mock of the Supabase query builder used by the conflict helpers.
 * We only need to intercept the final awaited result.
 */
function makeSupabase(overrides: {
  jobs?: unknown[]
  leads?: unknown[]
  calendar?: unknown[]
}) {
  const jobsResult = overrides.jobs ?? []
  const leadsResult = overrides.leads ?? []
  const calendarResult = overrides.calendar ?? []

  const buildThenable = (result: unknown[]) => {
    const chain: Record<string, unknown> = {}
    const methods = [
      'select', 'eq', 'neq', 'not', 'in', 'lte', 'gte', 'is', 'order', 'limit',
    ]
    for (const m of methods) chain[m] = vi.fn(() => chain)
    chain.then = (cb: (r: { data: unknown[] }) => unknown) => cb({ data: result })
    return chain
  }

  return {
    from: vi.fn((table: string) => {
      if (table === 'jobs') return buildThenable(jobsResult)
      if (table === 'leads') return buildThenable(leadsResult)
      if (table === 'calendar_events') return buildThenable(calendarResult)
      return buildThenable([])
    }),
  } as never
}

describe('detectTeamSchedulingConflicts', () => {
  it('returns no conflict when teamId is missing', async () => {
    const supabase = makeSupabase({})
    const result = await detectTeamSchedulingConflicts(supabase, {
      teamId: '',
      scheduledStart: '2026-05-01',
      scheduledEnd: '2026-05-03',
    })
    expect(result.hasConflict).toBe(false)
    expect(result.conflicts).toEqual([])
  })

  it('returns no conflict when schedule is missing', async () => {
    const supabase = makeSupabase({})
    const result = await detectTeamSchedulingConflicts(supabase, {
      teamId: 'team-1',
      scheduledStart: null,
      scheduledEnd: null,
    })
    expect(result.hasConflict).toBe(false)
  })

  it('returns no conflict when no overlapping jobs exist', async () => {
    const supabase = makeSupabase({ jobs: [] })
    const result = await detectTeamSchedulingConflicts(supabase, {
      teamId: 'team-1',
      scheduledStart: '2026-05-01',
      scheduledEnd: '2026-05-03',
    })
    expect(result.hasConflict).toBe(false)
  })

  it('flags conflict when an overlapping job is found', async () => {
    const supabase = makeSupabase({
      jobs: [
        {
          id: 'job-99',
          job_number: 'JOB-000099',
          status: 'scheduled',
          scheduled_start: '2026-05-02',
          scheduled_end: '2026-05-04',
          lead_id: 'lead-1',
        },
      ],
      leads: [
        { id: 'lead-1', contacts: [{ first_name: 'Mary', last_name: 'Jones' }] },
      ],
    })

    const result = await detectTeamSchedulingConflicts(supabase, {
      teamId: 'team-1',
      scheduledStart: '2026-05-01',
      scheduledEnd: '2026-05-03',
    })

    expect(result.hasConflict).toBe(true)
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toMatchObject({
      kind: 'job',
      jobNumber: 'JOB-000099',
      customerName: 'Mary Jones',
    })
  })
})

describe('detectTeamCalendarConflicts', () => {
  it('flags an overlapping calendar event', async () => {
    const supabase = makeSupabase({
      calendar: [
        {
          id: 'ev-1',
          title: 'Site inspection',
          status: 'scheduled',
          start_at: '2026-05-02T10:00:00Z',
          end_at: '2026-05-02T12:00:00Z',
        },
      ],
    })

    const result = await detectTeamCalendarConflicts(supabase, {
      teamId: 'team-1',
      startAt: '2026-05-02T11:00:00Z',
      endAt: '2026-05-02T13:00:00Z',
    })

    expect(result.hasConflict).toBe(true)
    expect(result.conflicts[0]).toMatchObject({
      kind: 'calendar_event',
      jobNumber: 'Site inspection',
    })
  })
})

describe('formatConflictMessage', () => {
  it('returns empty string when no conflicts', () => {
    expect(formatConflictMessage([])).toBe('')
  })

  it('formats single conflict with customer name', () => {
    const msg = formatConflictMessage([
      {
        kind: 'job',
        jobId: 'j',
        jobNumber: 'JOB-001',
        status: 'scheduled',
        scheduledStart: '2026-05-01',
        scheduledEnd: '2026-05-03',
        customerName: 'Mary Jones',
      },
    ])
    expect(msg).toContain('JOB-001')
    expect(msg).toContain('Mary Jones')
  })

  it('formats multiple conflicts as a list', () => {
    const msg = formatConflictMessage([
      {
        kind: 'job', jobId: 'j1', jobNumber: 'JOB-001', status: 'scheduled',
        scheduledStart: '2026-05-01', scheduledEnd: '2026-05-03', customerName: null,
      },
      {
        kind: 'job', jobId: 'j2', jobNumber: 'JOB-002', status: 'scheduled',
        scheduledStart: '2026-05-02', scheduledEnd: '2026-05-04', customerName: null,
      },
    ])
    expect(msg).toContain('2 other jobs')
    expect(msg).toContain('JOB-001')
    expect(msg).toContain('JOB-002')
  })
})
