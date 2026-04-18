/**
 * Daily Cron Job - Master Endpoint
 *
 * Runs all daily maintenance tasks in a single cron job.
 * Vercel Hobby plan only allows 1 daily cron, so we consolidate here.
 *
 * Tasks:
 * 1. Process scheduled messages
 * 2. Send calendar reminders
 * 3. Cleanup abandoned uploads
 * 4. Auto-publish scheduled blog posts
 *
 * Security: Uses CRON_SECRET to authenticate requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/communication/send-email'
import { sendSMS } from '@/lib/communication/send-sms'
import { emailWrapper } from '@/lib/email/templates'
import { notifyUser } from '@/lib/notifications'
import { sendConsultationReminderEmail } from '@/lib/email/notifications'
import { sendConsultationReminder as sendConsultationReminderSms } from '@/lib/sms/twilio'
import { logger } from '@/lib/logger'
import { safeCompare } from '@/lib/utils'

const CRON_SECRET = process.env.CRON_SECRET
const ABANDONED_UPLOAD_HOURS = 24

interface TaskResult {
  task: string
  success: boolean
  details: Record<string, unknown>
  error?: string
}

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured - cron jobs disabled' },
      { status: 503 }
    )
  }

  // Verify cron secret using constant-time comparison
  const authHeader = request.headers.get('authorization') || ''
  if (!safeCompare(authHeader, `Bearer ${CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: TaskResult[] = []
  const supabase = await createAdminClient()

  // Task 1: Process Scheduled Messages
  try {
    const messageResult = await processScheduledMessages(supabase)
    results.push({
      task: 'process_messages',
      success: true,
      details: messageResult,
    })
  } catch (error) {
    results.push({
      task: 'process_messages',
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  // Task 2: Send Calendar Reminders (24h before)
  try {
    const reminderResult = await sendCalendarReminders(supabase)
    results.push({
      task: 'calendar_reminders',
      success: true,
      details: reminderResult,
    })
  } catch (error) {
    results.push({
      task: 'calendar_reminders',
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  // Task 3: Cleanup Abandoned Uploads (was Task 2)
  try {
    const cleanupResult = await cleanupAbandonedUploads(supabase)
    results.push({
      task: 'cleanup_uploads',
      success: true,
      details: cleanupResult,
    })
  } catch (error) {
    results.push({
      task: 'cleanup_uploads',
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  // Task 4: Auto-publish scheduled blog posts
  try {
    const publishResult = await publishScheduledBlogPosts(supabase)
    results.push({
      task: 'publish_blog_posts',
      success: true,
      details: publishResult,
    })
  } catch (error) {
    results.push({
      task: 'publish_blog_posts',
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  const allSuccessful = results.every(r => r.success)

  return NextResponse.json({
    status: allSuccessful ? 'completed' : 'completed_with_errors',
    timestamp: new Date().toISOString(),
    results,
  }, {
    status: allSuccessful ? 200 : 207, // 207 = Multi-Status
  })
}

// Also support POST
export async function POST(request: NextRequest) {
  return GET(request)
}

// ============================================================================
// Task Functions
// ============================================================================

interface ScheduledMessage {
  id: string
  lead_id: string | null
  customer_id: string | null
  recipient_email: string | null
  recipient_phone: string | null
  recipient_name: string | null
  channel: 'email' | 'sms'
  subject: string | null
  body: string
  scheduled_for: string
  status: string
  workflow_id: string | null
  template_id: string | null
}

async function processScheduledMessages(
  supabase: Awaited<ReturnType<typeof createAdminClient>>
): Promise<{ processed: number; sent: number; failed: number }> {
  const now = new Date().toISOString()
  const results = { processed: 0, sent: 0, failed: 0 }

  // Fetch messages due to be sent
  const { data: messages, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .in('status', ['pending', 'scheduled'])
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  if (!messages || messages.length === 0) {
    return results
  }

  for (const msg of messages as ScheduledMessage[]) {
    results.processed++

    try {
      // Mark as processing
      await supabase
        .from('scheduled_messages')
        .update({ status: 'processing' } as never)
        .eq('id', msg.id)

      let sendResult: { success: boolean; error?: string; externalId?: string }

      if (msg.channel === 'email' && msg.recipient_email) {
        const wrappedHtml = await emailWrapper(msg.body, msg.subject || 'Notification')
        sendResult = await sendEmail({
          to: msg.recipient_email,
          subject: msg.subject || 'Notification',
          body: msg.body,
          html: wrappedHtml,
          leadId: msg.lead_id || undefined,
          customerId: msg.customer_id || undefined,
          templateId: msg.template_id || undefined,
          workflowId: msg.workflow_id || undefined,
          scheduledMessageId: msg.id,
        })
      } else if (msg.channel === 'sms' && msg.recipient_phone) {
        sendResult = await sendSMS({
          to: msg.recipient_phone,
          body: msg.body,
          leadId: msg.lead_id || undefined,
          customerId: msg.customer_id || undefined,
          templateId: msg.template_id || undefined,
          workflowId: msg.workflow_id || undefined,
          scheduledMessageId: msg.id,
        })
      } else {
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: `No valid ${msg.channel} recipient`,
            processed_at: now,
          } as never)
          .eq('id', msg.id)
        results.failed++
        continue
      }

      if (sendResult.success) {
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'sent',
            sent_at: now,
            processed_at: now,
            external_id: sendResult.externalId || null,
          } as never)
          .eq('id', msg.id)
        results.sent++
      } else {
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: sendResult.error || 'Unknown error',
            processed_at: now,
          } as never)
          .eq('id', msg.id)
        results.failed++
      }
    } catch (err) {
      await supabase
        .from('scheduled_messages')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
          processed_at: now,
        } as never)
        .eq('id', msg.id)
      results.failed++
    }
  }

  return results
}

async function sendCalendarReminders(
  supabase: Awaited<ReturnType<typeof createAdminClient>>
): Promise<{ checked: number; sent: number }> {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const results = { checked: 0, sent: 0 }

  // Find calendar events starting in the next 24-25 hours that haven't had reminders sent
  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('id, title, start_at, lead_id, assigned_to, attendee_email, attendee_phone, attendee_name')
    .gte('start_at', in24h.toISOString())
    .lte('start_at', in25h.toISOString())
    .eq('reminder_sent', false)
    .limit(50)

  if (error || !events || events.length === 0) {
    return results
  }

  results.checked = events.length

  for (const event of events) {
    const evt = event as {
      id: string; title: string; start_at: string; lead_id?: string; assigned_to?: string
      attendee_email?: string; attendee_phone?: string; attendee_name?: string
    }

    const startDate = new Date(evt.start_at)
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

    // Notify the assigned user
    if (evt.assigned_to) {
      notifyUser(evt.assigned_to, 'calendar_reminder', `Reminder: ${evt.title}`, `Tomorrow at ${timeStr}`, `/calendar`)
        .catch(err => logger.error(`[Cron] Failed to notify user ${evt.assigned_to}`, { error: String(err instanceof Error ? err.message : err) }))
    }

    // Email attendee
    if (evt.attendee_email) {
      sendConsultationReminderEmail({
        customerEmail: evt.attendee_email,
        customerName: evt.attendee_name || undefined,
        consultationDate: dateStr,
        consultationTime: timeStr,
      }).catch(err => logger.error(`[Cron] Failed to send reminder email to ${evt.attendee_email}`, { error: String(err instanceof Error ? err.message : err) }))
    }

    // SMS attendee
    if (evt.attendee_phone) {
      sendConsultationReminderSms(evt.attendee_phone, evt.attendee_name || 'there', dateStr, timeStr)
        .catch(err => logger.error(`[Cron] Failed to send reminder SMS to ${evt.attendee_phone}`, { error: String(err instanceof Error ? err.message : err) }))
    }

    // Mark reminder as sent
    await supabase
      .from('calendar_events')
      .update({ reminder_sent: true } as never)
      .eq('id', evt.id)

    results.sent++
  }

  return results
}

async function cleanupAbandonedUploads(
  supabase: Awaited<ReturnType<typeof createAdminClient>>
): Promise<{ deletedUploads: number; deletedFiles: number }> {
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - ABANDONED_UPLOAD_HOURS)

  const results = { deletedUploads: 0, deletedFiles: 0 }

  // Find abandoned uploads
  const { data: abandonedUploads, error: fetchError } = await supabase
    .from('uploads')
    .select('id, storage_path')
    .lt('created_at', cutoffTime.toISOString())
    .is('completed_at', null)
    .limit(100)

  if (fetchError) {
    throw new Error(`Failed to fetch uploads: ${fetchError.message}`)
  }

  if (!abandonedUploads || abandonedUploads.length === 0) {
    return results
  }

  // Delete files from storage
  const storagePaths = abandonedUploads
    .map(u => (u as { storage_path: string | null }).storage_path)
    .filter((path): path is string => path !== null)

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove(storagePaths)

    if (!storageError) {
      results.deletedFiles = storagePaths.length
    }
  }

  // Delete upload records
  const uploadIds = abandonedUploads.map(u => (u as { id: string }).id)
  const { error: deleteError } = await supabase
    .from('uploads')
    .delete()
    .in('id', uploadIds)

  if (!deleteError) {
    results.deletedUploads = uploadIds.length
  }

  return results
}

async function publishScheduledBlogPosts(
  supabase: Awaited<ReturnType<typeof createAdminClient>>
): Promise<{ published: number; slugs: string[] }> {
  const now = new Date().toISOString()
  const results = { published: 0, slugs: [] as string[] }

  // Find posts scheduled to publish now or earlier
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('status', 'scheduled')
    .lte('publish_at', now)
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch scheduled posts: ${error.message}`)
  }

  if (!posts || posts.length === 0) {
    return results
  }

  const ids = posts.map(p => (p as { id: string }).id)
  const slugs = posts.map(p => (p as { slug: string }).slug)

  // Publish all matching posts
  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: now } as never)
    .in('id', ids)

  if (updateError) {
    throw new Error(`Failed to publish posts: ${updateError.message}`)
  }

  results.published = ids.length
  results.slugs = slugs

  // Ping IndexNow and trigger ISR revalidation
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'
  const indexNowKey = process.env.INDEXNOW_KEY

  const postPublishTasks: Promise<unknown>[] = []

  if (indexNowKey && slugs.length > 0) {
    const urls = slugs.map(s => `${BASE_URL}/blog/${s}`)
    postPublishTasks.push(
      fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: new URL(BASE_URL).hostname,
          key: indexNowKey,
          keyLocation: `${BASE_URL}/${indexNowKey}.txt`,
          urlList: urls,
        }),
      }).catch(err => logger.error('[Cron] IndexNow ping failed', { error: String(err) }))
    )
  }

  if (CRON_SECRET && slugs.length > 0) {
    postPublishTasks.push(
      fetch(`${BASE_URL}/api/revalidate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      }).catch(err => logger.error('[Cron] Revalidation failed', { error: String(err) }))
    )
  }

  await Promise.allSettled(postPublishTasks)

  return results
}
