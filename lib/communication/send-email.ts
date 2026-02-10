/**
 * Email sending utility using Resend
 */

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getBusinessConfig, getFullAddress, getPhoneDisplay } from '@/lib/config/business'
import type { MessageStatus } from './types'

interface SendEmailOptions {
  to: string
  subject: string
  body: string
  html?: string
  from?: string
  replyTo?: string
  leadId?: string
  customerId?: string
  templateId?: string
  workflowId?: string
  scheduledMessageId?: string
  sentBy?: string
}

interface SendEmailResult {
  success: boolean
  externalId?: string
  error?: string
  status: MessageStatus
}

/**
 * Send an email via Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const config = getBusinessConfig()

  // Get Resend API key from credentials
  const apiKey = await getResendApiKey()

  if (!apiKey) {
    return {
      success: false,
      error: 'Resend API key not configured',
      status: 'failed',
    }
  }

  const resend = new Resend(apiKey)

  try {
    const fromEmail = options.from || config.email.primary || 'noreply@example.com'
    const fromName = config.name || 'Roofing Company'

    const { data, error } = await Promise.race([
      resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.body,
        html: options.html || convertToHtml(options.body),
        replyTo: options.replyTo || config.email.primary,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Email send timed out after 15s')), 15000)
      ),
    ])

    if (error) {
      // Log the communication attempt
      await logCommunication({
        ...options,
        status: 'failed',
        errorMessage: error.message,
      })

      return {
        success: false,
        error: error.message,
        status: 'failed',
      }
    }

    // Log successful communication
    await logCommunication({
      ...options,
      status: 'sent',
      externalId: data?.id,
    })

    return {
      success: true,
      externalId: data?.id,
      status: 'sent',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await logCommunication({
      ...options,
      status: 'failed',
      errorMessage,
    })

    return {
      success: false,
      error: errorMessage,
      status: 'failed',
    }
  }
}

/**
 * Get Resend API key from encrypted credentials
 */
async function getResendApiKey(): Promise<string | null> {
  // First check environment variable
  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY
  }

  // Then check database credentials
  try {
    const supabase = await createClient()
    const { data: credential } = await supabase
      .from('api_credentials')
      .select('encrypted_key')
      .eq('service_id', 'resend')
      .single()

    const credData = credential as { encrypted_key: string } | null
    if (credData?.encrypted_key) {
      console.warn('[Security] API credential loaded from DB without encryption')
      return credData.encrypted_key
    }
  } catch {
    // Credentials not available
  }

  return null
}

/**
 * Convert plain text to basic HTML
 */
function convertToHtml(text: string): string {
  const config = getBusinessConfig()

  // Escape HTML entities
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Convert line breaks to <br>
  const withBreaks = escaped.replace(/\n/g, '<br>')

  // Wrap in basic HTML template
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div style="margin-bottom: 20px;">
    ${withBreaks}
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <div style="font-size: 12px; color: #666;">
    ${config.name}<br>
    ${getFullAddress()}<br>
    ${getPhoneDisplay()}
  </div>
</body>
</html>
  `.trim()
}

/**
 * Log communication to database
 */
async function logCommunication(options: SendEmailOptions & {
  status: MessageStatus
  externalId?: string
  errorMessage?: string
}): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from('communication_logs').insert({
      lead_id: options.leadId || null,
      customer_id: options.customerId || null,
      channel: 'email',
      direction: 'outbound',
      recipient_email: options.to,
      subject: options.subject,
      body: options.body,
      body_html: options.html || convertToHtml(options.body),
      workflow_id: options.workflowId || null,
      template_id: options.templateId || null,
      scheduled_message_id: options.scheduledMessageId || null,
      status: options.status,
      external_id: options.externalId || null,
      sent_by: options.sentBy || null,
      metadata: options.errorMessage ? { error: options.errorMessage } : {},
    } as never)
  } catch (error) {
    console.error('Failed to log email communication:', error)
  }
}
