/**
 * Tests for job status transition validation
 */

import { describe, it, expect } from 'vitest'
import {
  JOB_STATUS_TRANSITIONS,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  type JobStatus,
} from '@/lib/jobs/types'

const ALL_STATUSES: JobStatus[] = [
  'pending_start',
  'materials_ordered',
  'scheduled',
  'in_progress',
  'inspection_pending',
  'punch_list',
  'completed',
  'warranty_active',
  'closed',
]

describe('Job Status Transitions', () => {
  it('should define transitions for every status', () => {
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_TRANSITIONS[status]).toBeDefined()
      expect(Array.isArray(JOB_STATUS_TRANSITIONS[status])).toBe(true)
    }
  })

  it('should have labels for every status', () => {
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_LABELS[status]).toBeDefined()
      expect(typeof JOB_STATUS_LABELS[status]).toBe('string')
      expect(JOB_STATUS_LABELS[status].length).toBeGreaterThan(0)
    }
  })

  it('should have colors for every status', () => {
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_COLORS[status]).toBeDefined()
      expect(typeof JOB_STATUS_COLORS[status]).toBe('string')
    }
  })

  it('should not allow transitions from closed', () => {
    expect(JOB_STATUS_TRANSITIONS['closed']).toEqual([])
  })

  it('should allow closing from any non-closed status', () => {
    for (const status of ALL_STATUSES) {
      if (status === 'closed') continue
      expect(JOB_STATUS_TRANSITIONS[status]).toContain('closed')
    }
  })

  it('should only reference valid statuses in transitions', () => {
    for (const status of ALL_STATUSES) {
      for (const target of JOB_STATUS_TRANSITIONS[status]) {
        expect(ALL_STATUSES).toContain(target)
      }
    }
  })

  it('should allow standard forward flow: pending_start -> materials_ordered -> scheduled -> in_progress -> completed', () => {
    expect(JOB_STATUS_TRANSITIONS['pending_start']).toContain('materials_ordered')
    expect(JOB_STATUS_TRANSITIONS['materials_ordered']).toContain('scheduled')
    expect(JOB_STATUS_TRANSITIONS['scheduled']).toContain('in_progress')
    expect(JOB_STATUS_TRANSITIONS['in_progress']).toContain('completed')
  })

  it('should allow inspection flow: in_progress -> inspection_pending -> completed', () => {
    expect(JOB_STATUS_TRANSITIONS['in_progress']).toContain('inspection_pending')
    expect(JOB_STATUS_TRANSITIONS['inspection_pending']).toContain('completed')
  })

  it('should allow punch list flow: in_progress -> punch_list -> completed', () => {
    expect(JOB_STATUS_TRANSITIONS['in_progress']).toContain('punch_list')
    expect(JOB_STATUS_TRANSITIONS['punch_list']).toContain('completed')
  })

  it('should allow warranty flow: completed -> warranty_active -> closed', () => {
    expect(JOB_STATUS_TRANSITIONS['completed']).toContain('warranty_active')
    expect(JOB_STATUS_TRANSITIONS['warranty_active']).toContain('closed')
  })

  it('should allow backwards transitions for rework', () => {
    // Punch list back to in_progress
    expect(JOB_STATUS_TRANSITIONS['punch_list']).toContain('in_progress')
    // Inspection pending back to in_progress
    expect(JOB_STATUS_TRANSITIONS['inspection_pending']).toContain('in_progress')
    // Completed back to punch list (rework discovered)
    expect(JOB_STATUS_TRANSITIONS['completed']).toContain('punch_list')
  })

  describe('isValidTransition helper', () => {
    function isValidTransition(from: JobStatus, to: JobStatus): boolean {
      return JOB_STATUS_TRANSITIONS[from]?.includes(to) ?? false
    }

    it('should return true for valid transitions', () => {
      expect(isValidTransition('pending_start', 'scheduled')).toBe(true)
      expect(isValidTransition('in_progress', 'completed')).toBe(true)
    })

    it('should return false for invalid transitions', () => {
      expect(isValidTransition('pending_start', 'completed')).toBe(false)
      expect(isValidTransition('closed', 'pending_start')).toBe(false)
      expect(isValidTransition('warranty_active', 'in_progress')).toBe(false)
    })

    it('should not allow self-transitions', () => {
      for (const status of ALL_STATUSES) {
        expect(isValidTransition(status, status)).toBe(false)
      }
    })
  })
})
