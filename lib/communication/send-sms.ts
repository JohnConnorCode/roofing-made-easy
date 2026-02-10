/**
 * SMS sending utility using Twilio
 */

import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'
import { getBusinessConfig, getPhoneDisplay } from '@/lib/config/business'
import type { MessageStatus } from './types'

interface SendSMSOptions {
  to: string
  body: string
  leadId?: string
  customerId?: string
  templateId?: string
  workflowId?: string
  scheduledMessageId?: string
  sentBy?: string
}

interface SendSMSResult {
  success: boolean
  externalId?: string
  error?: string
  status: MessageStatus
}

interface TwilioCredentials {
  accountSid: string
  authToken: string
  fromNumber: string
}

/**
 * Send an SMS via Twilio
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResult> {
  const credentials = await getTwilioCredentials()

  if (!credentials) {
    return {
      success: false,
      error: 'Twilio credentials not configured',
      status: 'failed',
    }
  }

  try {
    const client = twilio(credentials.accountSid, credentials.authToken)

    // Format phone number
    const formattedPhone = formatPhoneNumber(options.to)

    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format',
        status: 'failed',
      }
    }

    const message = await Promise.race([
      client.messages.create({
        to: formattedPhone,
        from: credentials.fromNumber,
        body: options.body,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SMS send timed out after 15s')), 15000)
      ),
    ])

    // Log successful communication
    await logCommunication({
      ...options,
      status: 'sent',
      externalId: message.sid,
      externalStatus: message.status,
    })

    // Update or create SMS conversation
    await updateConversation(formattedPhone, options.body, 'outbound', options.leadId, options.customerId)

    return {
      success: true,
      externalId: message.sid,
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
 * Get Twilio credentials from environment or database
 */
async function getTwilioCredentials(): Promise<TwilioCredentials | null> {
  // First check environment variables
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    return {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
    }
  }

  // Then check database credentials
  try {
    const supabase = await createClient()
    const { data: credential } = await supabase
      .from('api_credentials')
      .select('encrypted_key')
      .eq('service_id', 'twilio')
      .single()

    const credData = credential as { encrypted_key: string } | null
    if (credData?.encrypted_key) {
      // Parse the encrypted credentials (simplified - in production decrypt properly)
      try {
        const creds = JSON.parse(credData.encrypted_key)
        if (creds.accountSid && creds.authToken && creds.fromNumber) {
          return creds as TwilioCredentials
        }
      } catch {
        // Invalid format
      }
    }
  } catch {
    // Credentials not available
  }

  return null
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string | null {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '')

  // Handle US numbers
  if (digits.length === 10) {
    return `+1${digits}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // Already has country code
  if (digits.length >= 11) {
    return `+${digits}`
  }

  return null
}

/**
 * Log communication to database
 */
async function logCommunication(options: SendSMSOptions & {
  status: MessageStatus
  externalId?: string
  externalStatus?: string
  errorMessage?: string
}): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from('communication_logs').insert({
      lead_id: options.leadId || null,
      customer_id: options.customerId || null,
      channel: 'sms',
      direction: 'outbound',
      recipient_phone: options.to,
      sender_phone: getPhoneDisplay(),
      body: options.body,
      workflow_id: options.workflowId || null,
      template_id: options.templateId || null,
      scheduled_message_id: options.scheduledMessageId || null,
      status: options.status,
      external_id: options.externalId || null,
      external_status: options.externalStatus || null,
      sent_by: options.sentBy || null,
      metadata: options.errorMessage ? { error: options.errorMessage } : {},
    } as never)
  } catch (error) {
    console.error('Failed to log SMS communication:', error)
  }
}

/**
 * Update or create SMS conversation
 */
async function updateConversation(
  phoneNumber: string,
  messageBody: string,
  direction: 'outbound' | 'inbound',
  leadId?: string,
  customerId?: string
): Promise<void> {
  try {
    const supabase = await createClient()

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('sms_conversations')
      .select('id, unread_count')
      .eq('phone_number', phoneNumber)
      .single()

    const existingConvo = existing as { id: string; unread_count: number } | null
    const preview = messageBody.length > 160 ? messageBody.substring(0, 157) + '...' : messageBody

    if (existingConvo) {
      // Update existing conversation
      await supabase
        .from('sms_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: preview,
          last_message_direction: direction,
          unread_count: direction === 'inbound' ? (existingConvo.unread_count || 0) + 1 : 0,
          lead_id: leadId || undefined,
          customer_id: customerId || undefined,
        } as never)
        .eq('id', existingConvo.id)
    } else {
      // Create new conversation
      await supabase.from('sms_conversations').insert({
        phone_number: phoneNumber,
        lead_id: leadId || null,
        customer_id: customerId || null,
        status: 'active',
        unread_count: direction === 'inbound' ? 1 : 0,
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
        last_message_direction: direction,
      } as never)
    }
  } catch (error) {
    console.error('Failed to update SMS conversation:', error)
  }
}

/**
 * Handle inbound SMS (webhook from Twilio)
 */
export async function handleInboundSMS(
  from: string,
  body: string,
  messageSid: string
): Promise<void> {
  const supabase = await createClient()

  // Try to find existing lead/customer by phone
  const { data: contact } = await supabase
    .from('contacts')
    .select('lead_id, first_name, last_name')
    .eq('phone', from)
    .single()

  const contactData = contact as { lead_id: string | null; first_name: string | null; last_name: string | null } | null
  const leadId = contactData?.lead_id || null
  const senderName = contactData
    ? [contactData.first_name, contactData.last_name].filter(Boolean).join(' ') || null
    : null

  // Log the inbound message
  await supabase.from('communication_logs').insert({
    lead_id: leadId,
    channel: 'sms',
    direction: 'inbound',
    sender_phone: from,
    recipient_name: senderName,
    body,
    status: 'delivered',
    external_id: messageSid,
  } as never)

  // Update conversation
  await updateConversation(from, body, 'inbound', leadId || undefined)

  // Could also trigger workflows here for inbound messages
}
