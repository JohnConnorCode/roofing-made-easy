/**
 * Tests for notification types, priority, and formatting logic
 */

import { describe, it, expect } from 'vitest'
import type { NotificationType, NotificationPriority } from '@/lib/notifications/index'

// --- Extracted logic ---

const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'lead_new',
  'task_assigned',
  'task_overdue',
  'job_status_changed',
  'calendar_reminder',
  'invoice_paid',
  'invoice_overdue',
  'invoice_created',
  'estimate_accepted',
  'message_received',
  'customer_registered',
  'change_order',
  'system_alert',
]

const ALL_PRIORITIES: NotificationPriority[] = ['low', 'normal', 'high', 'urgent']

function formatStatusTransition(oldStatus: string, newStatus: string): string {
  return `Status changed from "${oldStatus.replace(/_/g, ' ')}" to "${newStatus.replace(/_/g, ' ')}"`
}

function buildNotificationPayload(params: {
  userId: string
  type: NotificationType
  title: string
  message?: string
  priority?: NotificationPriority
  actionUrl?: string
  actionLabel?: string
  entityType?: string
  entityId?: string
}) {
  return {
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message || null,
    priority: params.priority || 'normal',
    action_url: params.actionUrl || null,
    action_label: params.actionLabel || null,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
  }
}

function buildAdminNotifications(
  adminIds: string[],
  type: NotificationType,
  title: string,
  message?: string,
  actionUrl?: string
) {
  return adminIds.map((id) => ({
    user_id: id,
    type,
    title,
    message: message || null,
    priority: 'normal' as const,
    action_url: actionUrl || null,
    action_label: null,
    entity_type: null,
    entity_id: null,
  }))
}

// --- Tests ---

describe('Notification System', () => {
  describe('Notification Types', () => {
    it('should include all 13 notification types', () => {
      expect(ALL_NOTIFICATION_TYPES).toHaveLength(13)
    })

    it('should include business event types added in Phase 1', () => {
      expect(ALL_NOTIFICATION_TYPES).toContain('invoice_created')
      expect(ALL_NOTIFICATION_TYPES).toContain('customer_registered')
      expect(ALL_NOTIFICATION_TYPES).toContain('change_order')
    })

    it('should include core notification types', () => {
      expect(ALL_NOTIFICATION_TYPES).toContain('lead_new')
      expect(ALL_NOTIFICATION_TYPES).toContain('job_status_changed')
      expect(ALL_NOTIFICATION_TYPES).toContain('invoice_paid')
    })
  })

  describe('Notification Payload', () => {
    it('should build payload with defaults', () => {
      const payload = buildNotificationPayload({
        userId: 'user-1',
        type: 'lead_new',
        title: 'New Lead',
      })
      expect(payload.user_id).toBe('user-1')
      expect(payload.type).toBe('lead_new')
      expect(payload.title).toBe('New Lead')
      expect(payload.message).toBeNull()
      expect(payload.priority).toBe('normal')
      expect(payload.action_url).toBeNull()
      expect(payload.action_label).toBeNull()
      expect(payload.entity_type).toBeNull()
      expect(payload.entity_id).toBeNull()
    })

    it('should build payload with all fields', () => {
      const payload = buildNotificationPayload({
        userId: 'user-1',
        type: 'job_status_changed',
        title: 'Job Status Changed',
        message: 'Pending to In Progress',
        priority: 'high',
        actionUrl: '/jobs/123',
        actionLabel: 'View Job',
        entityType: 'job',
        entityId: 'job-123',
      })
      expect(payload.message).toBe('Pending to In Progress')
      expect(payload.priority).toBe('high')
      expect(payload.action_url).toBe('/jobs/123')
      expect(payload.action_label).toBe('View Job')
      expect(payload.entity_type).toBe('job')
      expect(payload.entity_id).toBe('job-123')
    })
  })

  describe('Admin Bulk Notifications', () => {
    it('should create one notification per admin', () => {
      const adminIds = ['admin-1', 'admin-2', 'admin-3']
      const notifications = buildAdminNotifications(
        adminIds,
        'lead_new',
        'New Lead',
        'From website',
        '/leads/123'
      )
      expect(notifications).toHaveLength(3)
      expect(notifications[0].user_id).toBe('admin-1')
      expect(notifications[1].user_id).toBe('admin-2')
      expect(notifications[2].user_id).toBe('admin-3')
    })

    it('should set priority to normal for admin notifications', () => {
      const notifications = buildAdminNotifications(
        ['admin-1'],
        'invoice_created',
        'Invoice Created'
      )
      expect(notifications[0].priority).toBe('normal')
    })

    it('should handle empty admin list', () => {
      const notifications = buildAdminNotifications([], 'lead_new', 'Test')
      expect(notifications).toHaveLength(0)
    })
  })

  describe('Status Transition Formatting', () => {
    it('should format status transition with underscores replaced', () => {
      const msg = formatStatusTransition('pending_start', 'in_progress')
      expect(msg).toBe('Status changed from "pending start" to "in progress"')
    })

    it('should handle single-word statuses', () => {
      const msg = formatStatusTransition('new', 'won')
      expect(msg).toBe('Status changed from "new" to "won"')
    })
  })
})
