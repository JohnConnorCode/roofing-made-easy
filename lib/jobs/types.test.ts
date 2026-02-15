import { describe, it, expect } from 'vitest'
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_TRANSITIONS,
  type JobStatus,
} from './types'

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

describe('JOB_STATUS_LABELS', () => {
  it('has a label for every JobStatus', () => {
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_LABELS[status]).toBeDefined()
      expect(typeof JOB_STATUS_LABELS[status]).toBe('string')
      expect(JOB_STATUS_LABELS[status].length).toBeGreaterThan(0)
    }
  })

  it('contains human-readable labels (not raw status keys)', () => {
    // Labels should not contain underscores
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_LABELS[status]).not.toContain('_')
    }
  })

  it('maps specific statuses to expected labels', () => {
    expect(JOB_STATUS_LABELS['pending_start']).toBe('Pending Start')
    expect(JOB_STATUS_LABELS['in_progress']).toBe('In Progress')
    expect(JOB_STATUS_LABELS['closed']).toBe('Closed')
  })
})

describe('JOB_STATUS_COLORS', () => {
  it('has a color class for every JobStatus', () => {
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_COLORS[status]).toBeDefined()
      expect(typeof JOB_STATUS_COLORS[status]).toBe('string')
      expect(JOB_STATUS_COLORS[status].length).toBeGreaterThan(0)
    }
  })

  it('contains Tailwind bg and text classes', () => {
    for (const status of ALL_STATUSES) {
      const colorClass = JOB_STATUS_COLORS[status]
      expect(colorClass).toMatch(/bg-/)
      expect(colorClass).toMatch(/text-/)
    }
  })
})

describe('JOB_STATUS_TRANSITIONS', () => {
  it('has a transitions array for every JobStatus', () => {
    for (const status of ALL_STATUSES) {
      expect(JOB_STATUS_TRANSITIONS[status]).toBeDefined()
      expect(Array.isArray(JOB_STATUS_TRANSITIONS[status])).toBe(true)
    }
  })

  it('pending_start can transition to materials_ordered, scheduled, and closed', () => {
    const transitions = JOB_STATUS_TRANSITIONS['pending_start']
    expect(transitions).toContain('materials_ordered')
    expect(transitions).toContain('scheduled')
    expect(transitions).toContain('closed')
  })

  it('closed has no valid transitions (terminal state)', () => {
    expect(JOB_STATUS_TRANSITIONS['closed']).toEqual([])
  })

  it('in_progress can transition to inspection_pending, punch_list, completed, and closed', () => {
    const transitions = JOB_STATUS_TRANSITIONS['in_progress']
    expect(transitions).toContain('inspection_pending')
    expect(transitions).toContain('punch_list')
    expect(transitions).toContain('completed')
    expect(transitions).toContain('closed')
  })

  it('warranty_active can only transition to closed', () => {
    expect(JOB_STATUS_TRANSITIONS['warranty_active']).toEqual(['closed'])
  })

  it('all transition targets are valid JobStatus values', () => {
    for (const status of ALL_STATUSES) {
      for (const target of JOB_STATUS_TRANSITIONS[status]) {
        expect(ALL_STATUSES).toContain(target)
      }
    }
  })

  it('every status except closed can transition to closed', () => {
    for (const status of ALL_STATUSES) {
      if (status === 'closed') continue
      expect(JOB_STATUS_TRANSITIONS[status]).toContain('closed')
    }
  })
})

describe('Coverage: all three maps cover identical sets of statuses', () => {
  it('LABELS, COLORS, and TRANSITIONS all have the same keys', () => {
    const labelKeys = Object.keys(JOB_STATUS_LABELS).sort()
    const colorKeys = Object.keys(JOB_STATUS_COLORS).sort()
    const transitionKeys = Object.keys(JOB_STATUS_TRANSITIONS).sort()

    expect(labelKeys).toEqual(colorKeys)
    expect(labelKeys).toEqual(transitionKeys)
  })

  it('all maps cover exactly the ALL_STATUSES list', () => {
    const sorted = [...ALL_STATUSES].sort()
    expect(Object.keys(JOB_STATUS_LABELS).sort()).toEqual(sorted)
    expect(Object.keys(JOB_STATUS_COLORS).sort()).toEqual(sorted)
    expect(Object.keys(JOB_STATUS_TRANSITIONS).sort()).toEqual(sorted)
  })
})
