/**
 * Tests for activity log enrichment and filtering logic
 */

import { describe, it, expect } from 'vitest'

// --- Extracted from activity/route.ts ---

interface ActivityRow {
  id: string
  user_id: string | null
  action: string
  category: string
  entity_type: string | null
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
}

interface UserProfile {
  first_name: string
  last_name: string
  avatar_url: string
}

function buildUserMap(
  profiles: Array<{ id: string; first_name: string; last_name: string; avatar_url: string }>
): Record<string, UserProfile> {
  return profiles.reduce((acc, user) => {
    acc[user.id] = {
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
    }
    return acc
  }, {} as Record<string, UserProfile>)
}

function enrichActivities(
  activities: ActivityRow[],
  userMap: Record<string, UserProfile>
) {
  return activities.map((a) => ({
    ...a,
    user_info: a.user_id ? userMap[a.user_id] || null : null,
  }))
}

function extractUserIds(activities: ActivityRow[]): string[] {
  return [...new Set(activities.map((a) => a.user_id).filter(Boolean) as string[])]
}

// --- Extracted from activity-log-panel.tsx ---

const ACTION_LABELS: Record<string, string> = {
  job_status_changed: 'changed job status',
  job_created: 'created a job',
  job_updated: 'updated job',
  lead_status_changed: 'changed lead status',
  estimate_generated: 'generated estimate',
  invoice_created: 'created invoice',
  payment_recorded: 'recorded payment',
  change_order_created: 'created change order',
  change_order_approved: 'approved change order',
  change_order_rejected: 'rejected change order',
  note_added: 'added a note',
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action.replace(/_/g, ' ')
}

// --- Tests ---

describe('Activity Log', () => {
  describe('User ID Extraction', () => {
    it('should extract unique user IDs', () => {
      const activities: ActivityRow[] = [
        { id: '1', user_id: 'u1', action: 'test', category: 'job', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
        { id: '2', user_id: 'u2', action: 'test', category: 'job', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
        { id: '3', user_id: 'u1', action: 'test', category: 'job', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
      ]
      const ids = extractUserIds(activities)
      expect(ids).toHaveLength(2)
      expect(ids).toContain('u1')
      expect(ids).toContain('u2')
    })

    it('should filter out null user IDs', () => {
      const activities: ActivityRow[] = [
        { id: '1', user_id: null, action: 'test', category: 'system', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
        { id: '2', user_id: 'u1', action: 'test', category: 'job', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
      ]
      const ids = extractUserIds(activities)
      expect(ids).toEqual(['u1'])
    })

    it('should return empty for no activities', () => {
      expect(extractUserIds([])).toEqual([])
    })
  })

  describe('User Map Building', () => {
    it('should build map from profiles', () => {
      const profiles = [
        { id: 'u1', first_name: 'Alice', last_name: 'Smith', avatar_url: '/avatars/alice.png' },
        { id: 'u2', first_name: 'Bob', last_name: 'Jones', avatar_url: '' },
      ]
      const map = buildUserMap(profiles)
      expect(map['u1']).toEqual({
        first_name: 'Alice',
        last_name: 'Smith',
        avatar_url: '/avatars/alice.png',
      })
      expect(map['u2'].first_name).toBe('Bob')
    })

    it('should handle empty profiles', () => {
      const map = buildUserMap([])
      expect(Object.keys(map)).toHaveLength(0)
    })
  })

  describe('Activity Enrichment', () => {
    const userMap = {
      u1: { first_name: 'Alice', last_name: 'Smith', avatar_url: '' },
    }

    it('should attach user info to activities', () => {
      const activities: ActivityRow[] = [
        { id: '1', user_id: 'u1', action: 'job_created', category: 'job', entity_type: 'job', entity_id: 'j1', old_values: null, new_values: null, created_at: '2026-01-01' },
      ]
      const enriched = enrichActivities(activities, userMap)
      expect(enriched[0].user_info).toEqual({
        first_name: 'Alice',
        last_name: 'Smith',
        avatar_url: '',
      })
    })

    it('should set user_info to null for null user_id', () => {
      const activities: ActivityRow[] = [
        { id: '1', user_id: null, action: 'system_event', category: 'system', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
      ]
      const enriched = enrichActivities(activities, userMap)
      expect(enriched[0].user_info).toBeNull()
    })

    it('should set user_info to null for unknown user_id', () => {
      const activities: ActivityRow[] = [
        { id: '1', user_id: 'unknown', action: 'test', category: 'job', entity_type: null, entity_id: null, old_values: null, new_values: null, created_at: '' },
      ]
      const enriched = enrichActivities(activities, userMap)
      expect(enriched[0].user_info).toBeNull()
    })

    it('should preserve all original activity fields', () => {
      const activities: ActivityRow[] = [
        {
          id: '1',
          user_id: 'u1',
          action: 'job_status_changed',
          category: 'job',
          entity_type: 'job',
          entity_id: 'j1',
          old_values: { status: 'pending_start' },
          new_values: { status: 'in_progress' },
          created_at: '2026-02-14T10:00:00Z',
        },
      ]
      const enriched = enrichActivities(activities, userMap)
      expect(enriched[0].id).toBe('1')
      expect(enriched[0].action).toBe('job_status_changed')
      expect(enriched[0].old_values).toEqual({ status: 'pending_start' })
      expect(enriched[0].new_values).toEqual({ status: 'in_progress' })
    })
  })

  describe('Action Labels', () => {
    it('should return known labels', () => {
      expect(getActionLabel('job_created')).toBe('created a job')
      expect(getActionLabel('payment_recorded')).toBe('recorded payment')
      expect(getActionLabel('change_order_approved')).toBe('approved change order')
    })

    it('should humanize unknown actions', () => {
      expect(getActionLabel('custom_thing_happened')).toBe('custom thing happened')
    })

    it('should handle single-word actions', () => {
      expect(getActionLabel('test')).toBe('test')
    })
  })
})
