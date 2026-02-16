import { Resend } from 'resend'
import { getResendCredentials } from '@/lib/credentials/loader'

// From address configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'notifications@smartroofpricing.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Smart Roof Pricing'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Get a Resend client instance
 * Creates client on-demand using credentials from DB or ENV
 */
async function getResendClient(): Promise<Resend | null> {
  const { credentials } = await getResendCredentials()
  if (!credentials) return null
  return new Resend(credentials.apiKey)
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const resend = await getResendClient()

  if (!resend) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Check if email service is configured (sync check for quick UI status)
 * Note: For accurate status with DB credentials, use isEmailConfiguredAsync()
 */
export function isEmailConfigured(): boolean {
  // Quick sync check - ENV only (for backwards compatibility)
  return !!process.env.RESEND_API_KEY
}

/**
 * Check if email service is configured (async, checks DB too)
 */
export async function isEmailConfiguredAsync(): Promise<boolean> {
  const { credentials } = await getResendCredentials()
  return credentials !== null
}
