/**
 * Notification service for creating in-app notifications
 * Fire-and-forget pattern - errors logged, never thrown
 */

import { createClient } from '@/lib/supabase/server'

export type NotificationType =
  | 'lead_new'
  | 'task_assigned'
  | 'task_overdue'
  | 'job_status_changed'
  | 'calendar_reminder'
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'invoice_created'
  | 'estimate_accepted'
  | 'message_received'
  | 'customer_registered'
  | 'change_order'
  | 'system_alert'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message?: string
  priority?: NotificationPriority
  actionUrl?: string
  actionLabel?: string
  entityType?: string
  entityId?: string
}

/**
 * Create a notification for a specific user
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message || null,
        priority: params.priority || 'normal',
        action_url: params.actionUrl || null,
        action_label: params.actionLabel || null,
        entity_type: params.entityType || null,
        entity_id: params.entityId || null,
      } as never)
  } catch (error) {
    console.error('[Notifications] Failed to create notification:', error)
  }
}

/**
 * Convenience: notify a specific user
 */
export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message?: string,
  actionUrl?: string
): Promise<void> {
  await createNotification({
    userId,
    type,
    title,
    message,
    actionUrl,
  })
}

/**
 * Notify all admin-role users
 */
export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message?: string,
  actionUrl?: string
): Promise<void> {
  try {
    const supabase = await createClient()

    // Get all admin users
    const { data: admins } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (!admins || admins.length === 0) return

    // Create notification for each admin
    const notifications = admins.map((admin) => ({
      user_id: (admin as { id: string }).id,
      type,
      title,
      message: message || null,
      priority: 'normal' as const,
      action_url: actionUrl || null,
      action_label: null,
      entity_type: null,
      entity_id: null,
    }))

    await supabase.from('notifications').insert(notifications as never[])
  } catch (error) {
    console.error('[Notifications] Failed to notify admins:', error)
  }
}

/**
 * Notify a user's project manager about a job status change
 */
export async function notifyJobStatusChange(
  pmUserId: string,
  jobNumber: string,
  jobId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await createNotification({
    userId: pmUserId,
    type: 'job_status_changed',
    title: `Job ${jobNumber} status changed`,
    message: `Status changed from "${oldStatus.replace(/_/g, ' ')}" to "${newStatus.replace(/_/g, ' ')}"`,
    priority: 'normal',
    actionUrl: `/jobs/${jobId}`,
    actionLabel: 'View Job',
    entityType: 'job',
    entityId: jobId,
  })
}
