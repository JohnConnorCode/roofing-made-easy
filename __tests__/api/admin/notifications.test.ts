/**
 * Tests for notification types and helper logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NotificationType, NotificationPriority } from '@/lib/notifications'

// Mock Supabase before importing the module
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => ({
      data: [{ id: 'admin-1' }, { id: 'admin-2' }],
    })),
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table === 'user_profiles') {
        return { select: mockSelect }
      }
      return { insert: mockInsert }
    }),
  })),
}))

// Import after mocks are set up
const {
  createNotification,
  notifyUser,
  notifyAdmins,
  notifyJobStatusChange,
} = await import('@/lib/notifications')

const ALL_TYPES: NotificationType[] = [
  'lead_new',
  'task_assigned',
  'task_overdue',
  'job_status_changed',
  'calendar_reminder',
  'invoice_paid',
  'invoice_overdue',
  'estimate_accepted',
  'message_received',
  'system_alert',
]

const ALL_PRIORITIES: NotificationPriority[] = ['low', 'normal', 'high', 'urgent']

describe('Notification Types', () => {
  it('should define all expected notification types', () => {
    // Type-level test: ensure all values in the union type are accounted for
    const typeSet = new Set<string>(ALL_TYPES)
    expect(typeSet.size).toBe(10)
  })

  it('should define all priority levels', () => {
    const prioritySet = new Set<string>(ALL_PRIORITIES)
    expect(prioritySet.size).toBe(4)
  })
})

describe('createNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should insert a notification with required fields', async () => {
    await createNotification({
      userId: 'user-123',
      type: 'lead_new',
      title: 'New lead received',
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        type: 'lead_new',
        title: 'New lead received',
        priority: 'normal',
      })
    )
  })

  it('should insert a notification with all optional fields', async () => {
    await createNotification({
      userId: 'user-123',
      type: 'job_status_changed',
      title: 'Job status changed',
      message: 'Job moved to in_progress',
      priority: 'high',
      actionUrl: '/jobs/job-1',
      actionLabel: 'View Job',
      entityType: 'job',
      entityId: 'job-1',
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        type: 'job_status_changed',
        title: 'Job status changed',
        message: 'Job moved to in_progress',
        priority: 'high',
        action_url: '/jobs/job-1',
        action_label: 'View Job',
        entity_type: 'job',
        entity_id: 'job-1',
      })
    )
  })

  it('should default optional fields to null', async () => {
    await createNotification({
      userId: 'user-123',
      type: 'system_alert',
      title: 'System alert',
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: null,
        action_url: null,
        action_label: null,
        entity_type: null,
        entity_id: null,
      })
    )
  })

  it('should not throw on insert error', async () => {
    mockInsert.mockRejectedValueOnce(new Error('DB error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      createNotification({
        userId: 'user-123',
        type: 'lead_new',
        title: 'New lead',
      })
    ).resolves.toBeUndefined()

    consoleSpy.mockRestore()
  })
})

describe('notifyUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call createNotification with the correct params', async () => {
    await notifyUser('user-abc', 'invoice_paid', 'Invoice paid', 'Invoice #1234 was paid', '/invoices/1234')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-abc',
        type: 'invoice_paid',
        title: 'Invoice paid',
        message: 'Invoice #1234 was paid',
        action_url: '/invoices/1234',
      })
    )
  })
})

describe('notifyJobStatusChange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a job status change notification', async () => {
    await notifyJobStatusChange('pm-user-1', 'JOB-001', 'job-id-1', 'scheduled', 'in_progress')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'pm-user-1',
        type: 'job_status_changed',
        title: 'Job JOB-001 status changed',
        message: 'Status changed from "scheduled" to "in progress"',
        action_url: '/jobs/job-id-1',
        action_label: 'View Job',
        entity_type: 'job',
        entity_id: 'job-id-1',
      })
    )
  })

  it('should format underscored status names with spaces', async () => {
    await notifyJobStatusChange('pm-1', 'JOB-002', 'job-2', 'pending_start', 'materials_ordered')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Status changed from "pending start" to "materials ordered"',
      })
    )
  })
})
