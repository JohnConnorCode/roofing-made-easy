/**
 * Email Template Service
 * Fetches templates from database with fallback to hardcoded templates
 * This is the bridge between admin-editable templates and actual email sending
 */

import { createClient } from '@/lib/supabase/server'
import { emailWrapper } from './templates'
import { getEmailCompanyInfo, EMAIL_COLORS } from './brand-config'
import { renderTemplate, getCompanyVariables } from '@/lib/communication/template-renderer'
import type { TemplateVariables } from '@/lib/communication/types'

interface DBTemplate {
  id: string
  slug: string
  name: string
  type: string
  subject: string | null
  body: string
  variables: string[]
  is_active: boolean
}

interface RenderedEmail {
  subject: string
  html: string
  text: string
  templateId?: string
  source: 'database' | 'hardcoded'
}

/**
 * Fetch a template from the database by slug
 */
async function fetchTemplateBySlug(slug: string): Promise<DBTemplate | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('message_templates')
      .select('id, slug, name, type, subject, body, variables, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return data as DBTemplate
  } catch {
    return null
  }
}

/**
 * Build email variables from data
 */
function buildVariables(data: Record<string, unknown>): TemplateVariables {
  const company = getEmailCompanyInfo()
  const companyVars = getCompanyVariables()

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  // Build variables from data
  const vars: TemplateVariables = {
    ...companyVars,
    company_name: company.name,
    company_phone: company.phone,
    company_email: company.email,
    company_address: company.fullAddress,
    website_url: company.website,
  }

  // Map common data fields to template variables
  if (data.contactName) vars.customer_name = String(data.contactName)
  if (data.customerName) vars.customer_name = String(data.customerName)
  if (data.firstName) vars.customer_first_name = String(data.firstName)
  if (data.email) vars.customer_email = String(data.email)
  if (data.customerEmail) vars.customer_email = String(data.customerEmail)
  if (data.phone) vars.customer_phone = String(data.phone)

  // Property
  if (data.address) vars.property_address = String(data.address)
  if (data.city) vars.property_city = String(data.city)
  if (data.state) vars.property_state = String(data.state)

  // Estimate
  if (typeof data.priceLikely === 'number') vars.estimate_total = formatCurrency(data.priceLikely)
  if (typeof data.priceLow === 'number') vars.estimate_low = formatCurrency(data.priceLow)
  if (typeof data.priceHigh === 'number') vars.estimate_high = formatCurrency(data.priceHigh)
  if (data.estimateUrl) vars.estimate_link = String(data.estimateUrl)

  // Appointment
  if (data.consultationDate) vars.appointment_date = String(data.consultationDate)
  if (data.consultationTime) vars.appointment_time = String(data.consultationTime)

  // URLs
  if (data.adminUrl) vars.admin_url = String(data.adminUrl)
  if (data.portalUrl) vars.portal_link = String(data.portalUrl)

  // Job type
  if (data.jobType) vars.job_type = String(data.jobType).replace(/_/g, ' ')

  // Payment
  if (typeof data.amount === 'number') vars.payment_amount = formatCurrency(data.amount)
  if (data.paymentType) {
    const labels: Record<string, string> = { deposit: 'Deposit', progress: 'Progress Payment', final: 'Final Payment' }
    vars.payment_type_label = labels[String(data.paymentType)] || String(data.paymentType)
  }

  // Message (for contact forms)
  if (data.message) vars.message_body = String(data.message)

  // Dates
  if (data.createdAt) {
    vars.created_at_formatted = new Date(String(data.createdAt)).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Customer first name extraction
  if (vars.customer_name && !vars.customer_first_name) {
    vars.customer_first_name = vars.customer_name.split(' ')[0]
  }

  return vars
}

/**
 * Generate plain text from HTML
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Render an email template - tries database first, falls back to hardcoded
 */
export async function renderEmailTemplate(
  slug: string,
  data: Record<string, unknown>,
  fallbackFn?: () => { subject: string; html: string; text: string }
): Promise<RenderedEmail> {
  // Try to fetch from database
  const dbTemplate = await fetchTemplateBySlug(slug)

  if (dbTemplate) {
    const variables = buildVariables(data)

    // Render subject (plain text, no escaping needed)
    const renderedSubject = dbTemplate.subject
      ? renderTemplate(dbTemplate.subject, variables)
      : 'Notification'

    // Render body (HTML context, escape user-supplied values)
    const renderedBody = renderTemplate(dbTemplate.body, variables, { escapeValues: true })

    // Check if body is full HTML or just content
    const isFullHtml = renderedBody.toLowerCase().includes('<!doctype') ||
      renderedBody.toLowerCase().includes('<html')

    const html = isFullHtml
      ? renderedBody
      : emailWrapper(renderedBody, renderedSubject)

    const text = htmlToText(renderedBody)

    return {
      subject: renderedSubject,
      html,
      text,
      templateId: dbTemplate.id,
      source: 'database',
    }
  }

  // Fall back to hardcoded template
  if (fallbackFn) {
    const fallback = fallbackFn()
    return {
      ...fallback,
      source: 'hardcoded',
    }
  }

  // No template found
  throw new Error(`Template not found: ${slug}`)
}

/**
 * Template slug constants - map to database slugs
 */
export const TEMPLATE_SLUGS = {
  // Email templates
  NEW_LEAD_ADMIN: 'new_lead_admin',
  ESTIMATE_GENERATED_ADMIN: 'estimate_generated_admin',
  CUSTOMER_ESTIMATE: 'customer_estimate',
  CONTACT_CONFIRMATION: 'contact_confirmation',
  DAILY_DIGEST: 'daily_digest',
  CONSULTATION_REMINDER: 'consultation_reminder',
  WELCOME_PORTAL: 'welcome_portal',
  PAYMENT_RECEIVED: 'payment_received',
  // SMS templates
  WELCOME_SMS: 'welcome_sms',
  ESTIMATE_READY_SMS: 'estimate_ready_sms',
  FOLLOW_UP_24H_SMS: 'follow_up_24h_sms',
  APPOINTMENT_CONFIRMATION_SMS: 'appointment_confirmation_sms',
  APPOINTMENT_REMINDER_SMS: 'appointment_reminder_sms',
} as const

/**
 * Helper: Generate info row HTML for templates
 */
export function infoRow(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `
    <tr>
      <td style="padding: 8px 0; color: ${EMAIL_COLORS.textLight}; font-size: 14px; width: 120px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; color: ${EMAIL_COLORS.text}; font-size: 14px; font-weight: 500;">${value}</td>
    </tr>
  `
}

/**
 * Helper: Generate CTA button HTML
 */
export function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius: 8px; background-color: ${EMAIL_COLORS.gold};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; color: ${EMAIL_COLORS.ink}; text-decoration: none; font-size: 14px; font-weight: 600;">${text}</a>
        </td>
      </tr>
    </table>
  `
}
