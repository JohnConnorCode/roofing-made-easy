/**
 * Cron Job: Process Scheduled Messages
 *
 * This endpoint processes scheduled messages that are due to be sent.
 * Should be called every minute via Vercel Cron or external scheduler.
 *
 * Security: Uses CRON_SECRET to authenticate requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/communication/send-email'
import { sendSMS } from '@/lib/communication/send-sms'
import { emailWrapper } from '@/lib/email/templates'

const CRON_SECRET = process.env.CRON_SECRET

// Validate CRON_SECRET is configured - required in ALL environments
function validateCronSecret(): { valid: boolean; error?: string } {
  if (!CRON_SECRET) {
    return {
      valid: false,
      error: 'CRON_SECRET environment variable is not configured. Cron jobs are disabled.',
    }
  }
  return { valid: true }
}

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

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET is configured
  const validation = validateCronSecret()
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 503 }
    )
  }

  // Verify cron secret - ALWAYS required in all environments
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    // Fetch messages that are due to be sent
    const { data: messages, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .in('status', ['pending', 'scheduled'])
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(50) // Process in batches

    if (error) {
      console.error('Error fetching scheduled messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled messages' },
        { status: 500 }
      )
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: 'No messages to process', ...results })
    }

    // Process each message
    for (const msg of messages as ScheduledMessage[]) {
      results.processed++

      try {
        // Mark as processing to prevent duplicate sends
        await supabase
          .from('scheduled_messages')
          .update({ status: 'processing' } as never)
          .eq('id', msg.id)

        let sendResult

        if (msg.channel === 'email' && msg.recipient_email) {
          // Wrap body in email template for consistent branding
          const wrappedHtml = await emailWrapper(msg.body, msg.subject || 'Notification')

          sendResult = await sendEmail({
            to: msg.recipient_email,
            subject: msg.subject || 'Notification',
            body: msg.body, // Plain text version
            html: wrappedHtml, // Branded HTML version
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
          // Invalid message - no valid recipient
          await supabase
            .from('scheduled_messages')
            .update({
              status: 'failed',
              error_message: `No valid ${msg.channel} recipient`,
              processed_at: now,
            } as never)
            .eq('id', msg.id)

          results.failed++
          results.errors.push(`Message ${msg.id}: No valid recipient`)
          continue
        }

        // Update message status based on result
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
          results.errors.push(`Message ${msg.id}: ${sendResult.error}`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'

        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: errorMsg,
            processed_at: now,
          } as never)
          .eq('id', msg.id)

        results.failed++
        results.errors.push(`Message ${msg.id}: ${errorMsg}`)
      }
    }

    return NextResponse.json({
      message: `Processed ${results.processed} messages`,
      ...results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
