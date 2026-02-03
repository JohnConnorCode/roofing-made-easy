// Notification service - sends emails based on settings
// Uses database templates when available, falls back to hardcoded templates
import { sendEmail, isEmailConfigured } from './resend'
import {
  newLeadEmail,
  estimateGeneratedEmail,
  customerEstimateEmail,
  contactConfirmationEmail,
  contactAdminNotificationEmail,
  consultationReminderEmail,
  paymentReceivedEmail,
  welcomeEmail,
  type NewLeadEmailData,
  type EstimateEmailData,
  type CustomerEstimateEmailData,
  type ContactConfirmationEmailData,
  type ContactAdminNotificationData,
  type ConsultationReminderEmailData,
  type PaymentReceivedEmailData,
  type WelcomeEmailData,
} from './templates'
import { renderEmailTemplate, TEMPLATE_SLUGS } from './template-service'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

interface NotificationSettings {
  newLeadEmail: boolean
  estimateEmail: boolean
  dailyDigest: boolean
  emailRecipients: string[]
}

// Database settings row type
interface SettingsRow {
  notifications_new_lead_email: boolean | null
  notifications_estimate_email: boolean | null
  notifications_daily_digest: boolean | null
  notifications_email_recipients: string[] | null
}

// Fetch notification settings from database
async function getNotificationSettings(): Promise<NotificationSettings | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('settings')
      .select('notifications_new_lead_email, notifications_estimate_email, notifications_daily_digest, notifications_email_recipients')
      .eq('id', 1)
      .single()

    if (error || !data) {
      // Return defaults if settings not found
      return {
        newLeadEmail: true,
        estimateEmail: true,
        dailyDigest: false,
        emailRecipients: [],
      }
    }

    const row = data as SettingsRow

    return {
      newLeadEmail: row.notifications_new_lead_email ?? true,
      estimateEmail: row.notifications_estimate_email ?? true,
      dailyDigest: row.notifications_daily_digest ?? false,
      emailRecipients: row.notifications_email_recipients ?? [],
    }
  } catch {
    return null
  }
}

// ============================================================================
// NEW LEAD NOTIFICATION
// ============================================================================

export interface LeadNotificationData {
  leadId: string
  source?: string
  createdAt: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  jobType?: string
  urgency?: string
}

export async function notifyNewLead(data: LeadNotificationData): Promise<void> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    return
  }

  // Fetch settings
  const settings = await getNotificationSettings()
  if (!settings) {
    return
  }

  // Check if notifications are enabled
  if (!settings.newLeadEmail) {
    return
  }

  // Check if we have recipients
  if (!settings.emailRecipients || settings.emailRecipients.length === 0) {
    return
  }

  const adminUrl = `${BASE_URL}/leads/${data.leadId}`

  // Build email data for both DB template and fallback
  const emailData: NewLeadEmailData = {
    leadId: data.leadId,
    source: data.source || 'Web Funnel',
    createdAt: data.createdAt,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    jobType: data.jobType,
    urgency: data.urgency,
    adminUrl,
  }

  // Try DB template first, fall back to hardcoded
  const { subject, html, text } = await renderEmailTemplate(
    TEMPLATE_SLUGS.NEW_LEAD_ADMIN,
    { ...emailData, customerEmail: data.email, customerPhone: data.phone },
    () => newLeadEmail(emailData)
  )

  await sendEmail({
    to: settings.emailRecipients,
    subject,
    html,
    text,
    replyTo: data.email, // Reply goes to the lead
  })
}

// ============================================================================
// ESTIMATE GENERATED NOTIFICATION
// ============================================================================

export interface EstimateNotificationData {
  leadId: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  jobType?: string
  roofMaterial?: string
  roofSizeSqft?: number
  priceLow: number
  priceLikely: number
  priceHigh: number
}

export async function notifyEstimateGenerated(data: EstimateNotificationData): Promise<void> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    return
  }

  // Fetch settings
  const settings = await getNotificationSettings()
  if (!settings) {
    return
  }

  // Check if notifications are enabled
  if (!settings.estimateEmail) {
    return
  }

  // Check if we have recipients
  if (!settings.emailRecipients || settings.emailRecipients.length === 0) {
    return
  }

  const adminUrl = `${BASE_URL}/leads/${data.leadId}`

  const emailData: EstimateEmailData = {
    leadId: data.leadId,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    jobType: data.jobType,
    roofMaterial: data.roofMaterial,
    roofSizeSqft: data.roofSizeSqft,
    priceLow: data.priceLow,
    priceLikely: data.priceLikely,
    priceHigh: data.priceHigh,
    adminUrl,
  }

  // Try DB template first, fall back to hardcoded
  const { subject, html, text } = await renderEmailTemplate(
    TEMPLATE_SLUGS.ESTIMATE_GENERATED_ADMIN,
    { ...emailData, customerEmail: data.email, customerPhone: data.phone },
    () => estimateGeneratedEmail(emailData)
  )

  await sendEmail({
    to: settings.emailRecipients,
    subject,
    html,
    text,
    replyTo: data.email,
  })
}

// ============================================================================
// CUSTOMER ESTIMATE EMAIL (sent to customer)
// ============================================================================

export interface CustomerEstimateData {
  customerEmail: string
  contactName?: string
  address?: string
  city?: string
  state?: string
  jobType?: string
  priceLow: number
  priceLikely: number
  priceHigh: number
  shareToken: string
  validUntil?: string
}

export async function sendCustomerEstimateEmail(data: CustomerEstimateData): Promise<{ success: boolean; error?: string }> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email service not configured' }
  }

  // Build the estimate URL using the share token
  const estimateUrl = `${BASE_URL}/estimate/${data.shareToken}`

  const emailData: CustomerEstimateEmailData = {
    contactName: data.contactName,
    address: data.address,
    city: data.city,
    state: data.state,
    jobType: data.jobType,
    priceLow: data.priceLow,
    priceLikely: data.priceLikely,
    priceHigh: data.priceHigh,
    estimateUrl,
    validUntil: data.validUntil,
  }

  // Try DB template first, fall back to hardcoded
  const { subject, html, text } = await renderEmailTemplate(
    TEMPLATE_SLUGS.CUSTOMER_ESTIMATE,
    { ...emailData, customerEmail: data.customerEmail },
    () => customerEstimateEmail(emailData)
  )

  return await sendEmail({
    to: data.customerEmail,
    subject,
    html,
    text,
  })
}

// ============================================================================
// CONTACT FORM EMAILS
// ============================================================================

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  submittedAt: string
  submissionId: string
}

export async function sendContactFormEmails(data: ContactFormData): Promise<{ customerSuccess: boolean; adminSuccess: boolean }> {
  const results = {
    customerSuccess: false,
    adminSuccess: false,
  }

  // Check if email is configured
  if (!isEmailConfigured()) {
    return results
  }

  // Send confirmation to customer
  const confirmationData: ContactConfirmationEmailData = {
    name: data.name,
    subject: data.subject,
    message: data.message,
  }

  // Try DB template first, fall back to hardcoded
  const customerEmail = await renderEmailTemplate(
    TEMPLATE_SLUGS.CONTACT_CONFIRMATION,
    { contactName: data.name, firstName: data.name.split(' ')[0], message: data.message },
    () => contactConfirmationEmail(confirmationData)
  )

  const customerResult = await sendEmail({
    to: data.email,
    subject: customerEmail.subject,
    html: customerEmail.html,
    text: customerEmail.text,
  })

  results.customerSuccess = customerResult.success

  // Fetch settings for admin recipients
  const settings = await getNotificationSettings()
  if (!settings || settings.emailRecipients.length === 0) {
    return results
  }

  // Send notification to admin
  const adminUrl = `${BASE_URL}/admin/contacts/${data.submissionId}`
  const adminData: ContactAdminNotificationData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    submittedAt: data.submittedAt,
    adminUrl,
  }

  const { subject: adminSubject, html: adminHtml, text: adminText } = contactAdminNotificationEmail(adminData)

  const adminResult = await sendEmail({
    to: settings.emailRecipients,
    subject: adminSubject,
    html: adminHtml,
    text: adminText,
    replyTo: data.email,
  })

  results.adminSuccess = adminResult.success

  return results
}

// ============================================================================
// CONSULTATION REMINDER EMAIL (sent to customer 24h before)
// ============================================================================

export interface ConsultationReminderData {
  customerEmail: string
  customerName?: string
  consultationDate: string
  consultationTime: string
  address?: string
  city?: string
  state?: string
  consultantName?: string
  consultantPhone?: string
  rescheduleUrl?: string
}

export async function sendConsultationReminderEmail(data: ConsultationReminderData): Promise<{ success: boolean; error?: string }> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email service not configured' }
  }

  const emailData: ConsultationReminderEmailData = {
    customerName: data.customerName,
    consultationDate: data.consultationDate,
    consultationTime: data.consultationTime,
    address: data.address,
    city: data.city,
    state: data.state,
    consultantName: data.consultantName,
    consultantPhone: data.consultantPhone,
    rescheduleUrl: data.rescheduleUrl,
  }

  // Try DB template first, fall back to hardcoded
  const { subject, html, text } = await renderEmailTemplate(
    TEMPLATE_SLUGS.CONSULTATION_REMINDER,
    { ...emailData, customerEmail: data.customerEmail },
    () => consultationReminderEmail(emailData)
  )

  return await sendEmail({
    to: data.customerEmail,
    subject,
    html,
    text,
  })
}

// ============================================================================
// PAYMENT RECEIVED EMAIL (sent to customer)
// ============================================================================

export interface PaymentNotificationData {
  customerEmail: string
  customerName?: string
  amount: number
  paymentType: 'deposit' | 'progress' | 'final'
  address?: string
  city?: string
  state?: string
  projectDescription?: string
  remainingBalance?: number
  portalUrl?: string
  receiptUrl?: string
}

export async function sendPaymentReceivedEmail(data: PaymentNotificationData): Promise<{ success: boolean; error?: string }> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email service not configured' }
  }

  const emailData: PaymentReceivedEmailData = {
    customerName: data.customerName,
    amount: data.amount,
    paymentType: data.paymentType,
    address: data.address,
    city: data.city,
    state: data.state,
    projectDescription: data.projectDescription,
    remainingBalance: data.remainingBalance,
    portalUrl: data.portalUrl,
    receiptUrl: data.receiptUrl,
  }

  // Try DB template first, fall back to hardcoded
  const { subject, html, text } = await renderEmailTemplate(
    TEMPLATE_SLUGS.PAYMENT_RECEIVED,
    { ...emailData, customerEmail: data.customerEmail },
    () => paymentReceivedEmail(emailData)
  )

  return await sendEmail({
    to: data.customerEmail,
    subject,
    html,
    text,
  })
}

// ============================================================================
// WELCOME EMAIL (for auto-created customer accounts)
// ============================================================================

export interface WelcomeData {
  email: string
  firstName?: string
  leadId?: string
}

export async function sendWelcomeEmail(data: WelcomeData): Promise<{ success: boolean; error?: string }> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email service not configured' }
  }

  const portalUrl = `${BASE_URL}/portal`

  // Generate a magic link for easy login (if Supabase auth supports it)
  // For now, we'll just use the portal URL
  const emailData: WelcomeEmailData = {
    firstName: data.firstName,
    email: data.email,
    portalUrl,
    // magicLinkUrl could be generated via Supabase auth.admin.generateLink()
  }

  // Try DB template first, fall back to hardcoded
  const { subject, html, text } = await renderEmailTemplate(
    TEMPLATE_SLUGS.WELCOME_PORTAL,
    { ...emailData, customerEmail: data.email },
    () => welcomeEmail(emailData)
  )

  return await sendEmail({
    to: data.email,
    subject,
    html,
    text,
  })
}
