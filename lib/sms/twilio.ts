import twilio from 'twilio'
import { getTwilioCredentials } from '@/lib/credentials/loader'

// Cached Twilio client
let cachedClient: ReturnType<typeof twilio> | null = null
let cachedFromNumber: string | null = null

/**
 * Get a Twilio client instance and phone number
 * Creates client on-demand using credentials from DB or ENV
 */
async function getTwilioClient(): Promise<{
  client: ReturnType<typeof twilio> | null
  fromNumber: string | null
}> {
  const { credentials } = await getTwilioCredentials()

  if (!credentials) {
    return { client: null, fromNumber: null }
  }

  // Return cached client if we have one
  if (cachedClient && cachedFromNumber) {
    return { client: cachedClient, fromNumber: cachedFromNumber }
  }

  cachedClient = twilio(credentials.accountSid, credentials.authToken)
  cachedFromNumber = credentials.phoneNumber

  return { client: cachedClient, fromNumber: cachedFromNumber }
}

// Check if Twilio is configured (sync check for backwards compatibility)
export function isTwilioConfigured(): boolean {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  return !!(accountSid && authToken && fromNumber)
}

/**
 * Check if Twilio is configured (async, checks DB too)
 */
export async function isTwilioConfiguredAsync(): Promise<boolean> {
  const { credentials } = await getTwilioCredentials()
  return credentials !== null
}

// Send SMS result type
export interface SendSmsResult {
  success: boolean
  messageId?: string
  error?: string
}

// Send a single SMS
export async function sendSms(
  to: string,
  body: string
): Promise<SendSmsResult> {
  const { client, fromNumber } = await getTwilioClient()

  if (!client || !fromNumber) {
    return { success: false, error: 'SMS service not configured' }
  }

  // Normalize phone number (ensure E.164 format for US)
  const normalizedTo = normalizePhoneNumber(to)
  if (!normalizedTo) {
    return { success: false, error: 'Invalid phone number format' }
  }

  try {
    const message = await client.messages.create({
      body,
      to: normalizedTo,
      from: fromNumber,
    })

    return { success: true, messageId: message.sid }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    }
  }
}

// Normalize phone number to E.164 format (US)
function normalizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // US numbers
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  // Already has country code
  if (digits.length > 10 && phone.startsWith('+')) {
    return `+${digits}`
  }

  return null
}

// SMS Templates
export const SMS_TEMPLATES = {
  consultationReminder: (customerName: string, date: string, time: string) =>
    `Hi ${customerName}! This is a reminder that your roofing consultation with Smart Roof Pricing is tomorrow (${date}) at ${time}. Reply CONFIRM to confirm or call (662) 555-0123 to reschedule.`,

  estimateReady: (customerName: string, url: string) =>
    `Hi ${customerName}! Your roofing estimate from Smart Roof Pricing is ready. View it here: ${url}`,

  paymentReceived: (customerName: string, amount: string) =>
    `Hi ${customerName}! We've received your payment of ${amount}. Thank you for choosing Smart Roof Pricing! We'll be in touch to schedule your project.`,

  appointmentConfirmed: (customerName: string, date: string, time: string) =>
    `Hi ${customerName}! Your roofing consultation is confirmed for ${date} at ${time}. See you then! - Smart Roof Pricing`,

  projectStarting: (customerName: string, date: string) =>
    `Hi ${customerName}! Your roofing project is scheduled to begin on ${date}. Our crew will arrive between 7-8am. - Smart Roof Pricing`,
}

// Send consultation reminder SMS
export async function sendConsultationReminder(
  phone: string,
  customerName: string,
  date: string,
  time: string
): Promise<SendSmsResult> {
  const message = SMS_TEMPLATES.consultationReminder(customerName, date, time)
  return sendSms(phone, message)
}

// Send estimate ready SMS
export async function sendEstimateReadySms(
  phone: string,
  customerName: string,
  estimateUrl: string
): Promise<SendSmsResult> {
  const message = SMS_TEMPLATES.estimateReady(customerName, estimateUrl)
  return sendSms(phone, message)
}

// Send payment received SMS
export async function sendPaymentReceivedSms(
  phone: string,
  customerName: string,
  amount: string
): Promise<SendSmsResult> {
  const message = SMS_TEMPLATES.paymentReceived(customerName, amount)
  return sendSms(phone, message)
}
