/**
 * Activity logging utility for tracking user actions
 * Uses service role client to bypass RLS for audit logging
 */

import { createClient } from '@/lib/supabase/server'
import type { ActivityCategory, UserRole } from './types'
import type { User } from '@supabase/supabase-js'

export interface LogActivityParams {
  user: User | null
  action: string
  category: ActivityCategory
  entityType?: string
  entityId?: string
  entityName?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log a user activity to the audit trail
 * This is fire-and-forget - errors are logged but don't affect the main operation
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const supabase = await createClient()

    // Get user role from profile if available
    let userRole: UserRole | null = null
    if (params.user) {
      userRole = (params.user.user_metadata?.role as UserRole) ||
                 (params.user.app_metadata?.role as UserRole) ||
                 null
    }

    await supabase
      .from('user_activity_log')
      .insert({
        user_id: params.user?.id || null,
        user_email: params.user?.email || null,
        user_role: userRole,
        action: params.action,
        category: params.category,
        entity_type: params.entityType || null,
        entity_id: params.entityId || null,
        entity_name: params.entityName || null,
        old_values: params.oldValues || null,
        new_values: params.newValues || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        metadata: params.metadata || {},
      } as never)
  } catch (error) {
    // Log error but don't throw - activity logging should never break main operations
    console.error('[Activity Logger] Failed to log activity:', error)
  }
}

/**
 * Pre-built activity logging functions for common operations
 */
export const ActivityLogger = {
  // Auth events
  login: (user: User, ipAddress?: string, userAgent?: string) =>
    logActivity({
      user,
      action: 'login',
      category: 'auth',
      ipAddress,
      userAgent,
    }),

  logout: (user: User) =>
    logActivity({
      user,
      action: 'logout',
      category: 'auth',
    }),

  passwordChange: (user: User) =>
    logActivity({
      user,
      action: 'password_changed',
      category: 'auth',
    }),

  // Lead events
  leadCreated: (user: User | null, leadId: string, leadName?: string) =>
    logActivity({
      user,
      action: 'lead_created',
      category: 'lead',
      entityType: 'lead',
      entityId: leadId,
      entityName: leadName,
    }),

  leadUpdated: (
    user: User,
    leadId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) =>
    logActivity({
      user,
      action: 'lead_updated',
      category: 'lead',
      entityType: 'lead',
      entityId: leadId,
      oldValues,
      newValues,
    }),

  leadStatusChanged: (
    user: User,
    leadId: string,
    oldStatus: string,
    newStatus: string
  ) =>
    logActivity({
      user,
      action: 'lead_status_changed',
      category: 'lead',
      entityType: 'lead',
      entityId: leadId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
    }),

  leadDeleted: (user: User, leadId: string, leadName?: string) =>
    logActivity({
      user,
      action: 'lead_deleted',
      category: 'lead',
      entityType: 'lead',
      entityId: leadId,
      entityName: leadName,
    }),

  leadAssigned: (user: User, leadId: string, assigneeId: string, assigneeName?: string) =>
    logActivity({
      user,
      action: 'lead_assigned',
      category: 'lead',
      entityType: 'lead',
      entityId: leadId,
      metadata: { assignee_id: assigneeId, assignee_name: assigneeName },
    }),

  // Estimate events
  estimateGenerated: (user: User, estimateId: string, leadId: string, total: number) =>
    logActivity({
      user,
      action: 'estimate_generated',
      category: 'estimate',
      entityType: 'estimate',
      entityId: estimateId,
      metadata: { lead_id: leadId, total },
    }),

  estimateSent: (user: User, estimateId: string, recipientEmail: string) =>
    logActivity({
      user,
      action: 'estimate_sent',
      category: 'estimate',
      entityType: 'estimate',
      entityId: estimateId,
      metadata: { recipient_email: recipientEmail },
    }),

  // Task events
  taskCreated: (user: User, taskId: string, taskTitle: string, assigneeId?: string) =>
    logActivity({
      user,
      action: 'task_created',
      category: 'task',
      entityType: 'task',
      entityId: taskId,
      entityName: taskTitle,
      metadata: assigneeId ? { assignee_id: assigneeId } : {},
    }),

  taskUpdated: (
    user: User,
    taskId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) =>
    logActivity({
      user,
      action: 'task_updated',
      category: 'task',
      entityType: 'task',
      entityId: taskId,
      oldValues,
      newValues,
    }),

  taskCompleted: (user: User, taskId: string, taskTitle: string) =>
    logActivity({
      user,
      action: 'task_completed',
      category: 'task',
      entityType: 'task',
      entityId: taskId,
      entityName: taskTitle,
    }),

  taskDeleted: (user: User, taskId: string, taskTitle: string) =>
    logActivity({
      user,
      action: 'task_deleted',
      category: 'task',
      entityType: 'task',
      entityId: taskId,
      entityName: taskTitle,
    }),

  // Team events
  userCreated: (user: User, newUserId: string, newUserEmail: string, role: UserRole) =>
    logActivity({
      user,
      action: 'user_created',
      category: 'team',
      entityType: 'user',
      entityId: newUserId,
      entityName: newUserEmail,
      metadata: { role },
    }),

  userUpdated: (
    user: User,
    targetUserId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) =>
    logActivity({
      user,
      action: 'user_updated',
      category: 'team',
      entityType: 'user',
      entityId: targetUserId,
      oldValues,
      newValues,
    }),

  userInvited: (user: User, email: string, role: UserRole) =>
    logActivity({
      user,
      action: 'user_invited',
      category: 'team',
      entityType: 'invitation',
      entityName: email,
      metadata: { role },
    }),

  userDeactivated: (user: User, targetUserId: string, targetEmail: string) =>
    logActivity({
      user,
      action: 'user_deactivated',
      category: 'team',
      entityType: 'user',
      entityId: targetUserId,
      entityName: targetEmail,
    }),

  teamCreated: (user: User, teamId: string, teamName: string) =>
    logActivity({
      user,
      action: 'team_created',
      category: 'team',
      entityType: 'team',
      entityId: teamId,
      entityName: teamName,
    }),

  teamUpdated: (
    user: User,
    teamId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) =>
    logActivity({
      user,
      action: 'team_updated',
      category: 'team',
      entityType: 'team',
      entityId: teamId,
      oldValues,
      newValues,
    }),

  teamMemberAdded: (user: User, teamId: string, memberId: string, memberName?: string) =>
    logActivity({
      user,
      action: 'team_member_added',
      category: 'team',
      entityType: 'team',
      entityId: teamId,
      metadata: { member_id: memberId, member_name: memberName },
    }),

  teamMemberRemoved: (user: User, teamId: string, memberId: string, memberName?: string) =>
    logActivity({
      user,
      action: 'team_member_removed',
      category: 'team',
      entityType: 'team',
      entityId: teamId,
      metadata: { member_id: memberId, member_name: memberName },
    }),

  // Settings events
  settingsUpdated: (
    user: User,
    settingKey: string,
    oldValue: unknown,
    newValue: unknown
  ) =>
    logActivity({
      user,
      action: 'settings_updated',
      category: 'settings',
      entityType: 'settings',
      entityName: settingKey,
      oldValues: { value: oldValue },
      newValues: { value: newValue },
    }),

  // Communication events
  emailSent: (user: User, recipientEmail: string, subject: string, leadId?: string) =>
    logActivity({
      user,
      action: 'email_sent',
      category: 'communication',
      entityType: 'email',
      entityName: subject,
      metadata: { recipient_email: recipientEmail, lead_id: leadId },
    }),

  smsSent: (user: User, recipientPhone: string, leadId?: string) =>
    logActivity({
      user,
      action: 'sms_sent',
      category: 'communication',
      entityType: 'sms',
      metadata: { recipient_phone: recipientPhone, lead_id: leadId },
    }),
}
