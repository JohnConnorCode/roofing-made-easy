/**
 * Tests for time entry logic: summary computation, duplicate prevention, enrichment
 */

import { describe, it, expect } from 'vitest'

// --- Extracted from time-entries/route.ts GET handler ---

interface TimeEntryRow {
  id: string
  user_id: string
  status: string
  total_hours: number | null
  clock_in: string
  clock_out: string | null
  break_minutes: number
}

interface UserProfile {
  first_name: string
  last_name: string
}

function enrichEntries(
  entries: TimeEntryRow[],
  userMap: Record<string, UserProfile>
) {
  return entries.map((e) => ({
    ...e,
    user: userMap[e.user_id] || null,
  }))
}

function computeSummary(
  entries: Array<TimeEntryRow & { user: UserProfile | null }>
) {
  const completed = entries.filter((e) => e.status === 'completed')
  const totalHours = completed.reduce(
    (sum, e) => sum + (e.total_hours || 0),
    0
  )
  const activeEntry = entries.find((e) => e.status === 'active')

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    entryCount: completed.length,
    hasActiveEntry: !!activeEntry,
    activeEntryId: activeEntry?.id || null,
  }
}

function hasDuplicateActive(
  existing: Array<{ id: string }> | null
): boolean {
  return !!existing && existing.length > 0
}

// --- Tests ---

describe('Time Entries', () => {
  describe('Summary Computation', () => {
    it('should sum completed entry hours', () => {
      const entries = enrichEntries(
        [
          { id: '1', user_id: 'u1', status: 'completed', total_hours: 4.5, clock_in: '', clock_out: '', break_minutes: 0 },
          { id: '2', user_id: 'u1', status: 'completed', total_hours: 3.25, clock_in: '', clock_out: '', break_minutes: 0 },
        ],
        { u1: { first_name: 'John', last_name: 'Doe' } }
      )
      const summary = computeSummary(entries)
      expect(summary.totalHours).toBe(7.75)
      expect(summary.entryCount).toBe(2)
    })

    it('should exclude voided entries', () => {
      const entries = enrichEntries(
        [
          { id: '1', user_id: 'u1', status: 'completed', total_hours: 4, clock_in: '', clock_out: '', break_minutes: 0 },
          { id: '2', user_id: 'u1', status: 'voided', total_hours: 2, clock_in: '', clock_out: '', break_minutes: 0 },
        ],
        { u1: { first_name: 'John', last_name: 'Doe' } }
      )
      // Note: voided entries should be filtered out BEFORE this function
      // but even if passed, they won't be counted as completed
      const summary = computeSummary(entries)
      expect(summary.totalHours).toBe(4)
      expect(summary.entryCount).toBe(1)
    })

    it('should exclude active entries from hours total', () => {
      const entries = enrichEntries(
        [
          { id: '1', user_id: 'u1', status: 'completed', total_hours: 4, clock_in: '', clock_out: '', break_minutes: 0 },
          { id: '2', user_id: 'u1', status: 'active', total_hours: null, clock_in: '', clock_out: null, break_minutes: 0 },
        ],
        { u1: { first_name: 'John', last_name: 'Doe' } }
      )
      const summary = computeSummary(entries)
      expect(summary.totalHours).toBe(4)
      expect(summary.entryCount).toBe(1)
      expect(summary.hasActiveEntry).toBe(true)
      expect(summary.activeEntryId).toBe('2')
    })

    it('should handle empty entries', () => {
      const summary = computeSummary([])
      expect(summary.totalHours).toBe(0)
      expect(summary.entryCount).toBe(0)
      expect(summary.hasActiveEntry).toBe(false)
      expect(summary.activeEntryId).toBeNull()
    })

    it('should handle null total_hours gracefully', () => {
      const entries = enrichEntries(
        [
          { id: '1', user_id: 'u1', status: 'completed', total_hours: null, clock_in: '', clock_out: '', break_minutes: 0 },
          { id: '2', user_id: 'u1', status: 'completed', total_hours: 3, clock_in: '', clock_out: '', break_minutes: 0 },
        ],
        { u1: { first_name: 'John', last_name: 'Doe' } }
      )
      const summary = computeSummary(entries)
      expect(summary.totalHours).toBe(3)
      expect(summary.entryCount).toBe(2)
    })

    it('should round total hours to 2 decimal places', () => {
      const entries = enrichEntries(
        [
          { id: '1', user_id: 'u1', status: 'completed', total_hours: 1.333, clock_in: '', clock_out: '', break_minutes: 0 },
          { id: '2', user_id: 'u1', status: 'completed', total_hours: 2.666, clock_in: '', clock_out: '', break_minutes: 0 },
        ],
        { u1: { first_name: 'John', last_name: 'Doe' } }
      )
      const summary = computeSummary(entries)
      expect(summary.totalHours).toBe(4)
    })
  })

  describe('User Enrichment', () => {
    it('should attach user profile to entries', () => {
      const userMap = {
        u1: { first_name: 'Alice', last_name: 'Smith' },
        u2: { first_name: 'Bob', last_name: 'Jones' },
      }
      const entries: TimeEntryRow[] = [
        { id: '1', user_id: 'u1', status: 'completed', total_hours: 4, clock_in: '', clock_out: '', break_minutes: 0 },
        { id: '2', user_id: 'u2', status: 'active', total_hours: null, clock_in: '', clock_out: null, break_minutes: 0 },
      ]
      const enriched = enrichEntries(entries, userMap)
      expect(enriched[0].user).toEqual({ first_name: 'Alice', last_name: 'Smith' })
      expect(enriched[1].user).toEqual({ first_name: 'Bob', last_name: 'Jones' })
    })

    it('should set user to null for unknown user_id', () => {
      const entries: TimeEntryRow[] = [
        { id: '1', user_id: 'unknown', status: 'completed', total_hours: 4, clock_in: '', clock_out: '', break_minutes: 0 },
      ]
      const enriched = enrichEntries(entries, {})
      expect(enriched[0].user).toBeNull()
    })
  })

  describe('Duplicate Active Entry Prevention', () => {
    it('should detect existing active entry', () => {
      expect(hasDuplicateActive([{ id: 'existing-entry' }])).toBe(true)
    })

    it('should allow clock-in when no active entries', () => {
      expect(hasDuplicateActive([])).toBe(false)
    })

    it('should allow clock-in when null result', () => {
      expect(hasDuplicateActive(null)).toBe(false)
    })
  })
})
