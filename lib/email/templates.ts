// Email templates for notifications
// Using inline styles for maximum email client compatibility

import { EMAIL_COLORS, EMAIL_FONTS, getEmailCompanyInfo } from './brand-config'

// Re-export for backwards compatibility
const BRAND_COLORS = EMAIL_COLORS

// Shared email wrapper with centralized brand config
export async function emailWrapper(content: string, previewText: string, options?: { unsubscribeUrl?: string }): Promise<string> {
  const company = await getEmailCompanyInfo()

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${company.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_COLORS.background}; font-family: ${EMAIL_FONTS.primary};">
  <!-- Preview text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Content wrapper -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${BRAND_COLORS.surface}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; background-color: ${BRAND_COLORS.ink}; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                      <span style="color: ${BRAND_COLORS.gold};">${company.name.split(' ')[0]}</span> ${company.name.split(' ').slice(1).join(' ')}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: ${BRAND_COLORS.borderLight}; border-top: 1px solid ${BRAND_COLORS.border}; border-radius: 0 0 12px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="color: ${BRAND_COLORS.textLight}; font-size: 12px; line-height: 1.5;">
                    <p style="margin: 0 0 8px;">${company.legalName}</p>
                    <p style="margin: 0 0 8px;">${company.fullAddress}</p>
                    <p style="margin: 0 0 8px;">${company.phone}</p>
                    ${options?.unsubscribeUrl ? `<p style="margin: 0;"><a href="${options.unsubscribeUrl}" style="color: ${BRAND_COLORS.textLight}; text-decoration: underline;">Unsubscribe</a> from these emails</p>` : `<p style="margin: 0;">To stop receiving these emails, reply with "unsubscribe" or update your <a href="${company.website}/portal/settings" style="color: ${BRAND_COLORS.textLight}; text-decoration: underline;">notification preferences</a>.</p>`}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Info row helper
function infoRow(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `
    <tr>
      <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-size: 14px; width: 120px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; color: ${BRAND_COLORS.text}; font-size: 14px; font-weight: 500;">${value}</td>
    </tr>
  `
}

// Button helper
function button(text: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius: 8px; background-color: ${BRAND_COLORS.gold};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; color: ${BRAND_COLORS.ink}; text-decoration: none; font-size: 14px; font-weight: 600;">${text}</a>
        </td>
      </tr>
    </table>
  `
}

// Alert badge helper
function badge(text: string, color: string, bgColor: string): string {
  return `<span style="display: inline-block; padding: 4px 12px; background-color: ${bgColor}; color: ${color}; font-size: 12px; font-weight: 600; border-radius: 16px; text-transform: uppercase; letter-spacing: 0.5px;">${text}</span>`
}

// ============================================================================
// NEW LEAD NOTIFICATION
// ============================================================================

export interface NewLeadEmailData {
  leadId: string
  source: string
  createdAt: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  jobType?: string
  urgency?: string
  adminUrl: string
}

export async function newLeadEmail(data: NewLeadEmailData): Promise<{ subject: string; html: string; text: string }> {
  const subject = data.contactName
    ? `New Lead: ${data.contactName}`
    : `New Lead from ${data.source || 'Website'}`

  const previewText = data.address
    ? `New roofing lead in ${data.city || 'your area'} - ${data.jobType || 'Service requested'}`
    : 'New lead submitted through the website'

  const urgencyBadge = data.urgency === 'emergency'
    ? badge('EMERGENCY', '#dc2626', '#fef2f2')
    : data.urgency === 'urgent'
      ? badge('Urgent', '#d97706', '#fffbeb')
      : ''

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          ${urgencyBadge ? `<div style="margin-bottom: 16px;">${urgencyBadge}</div>` : ''}
          <h2 style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 20px; font-weight: 600;">New Lead Received</h2>
          <p style="margin: 0 0 24px; color: ${BRAND_COLORS.textLight}; font-size: 14px;">
            ${new Date(data.createdAt).toLocaleString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </td>
      </tr>

      <!-- Lead Details -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${infoRow('Name', data.contactName)}
            ${infoRow('Email', data.email)}
            ${infoRow('Phone', data.phone)}
            ${infoRow('Address', data.address)}
            ${infoRow('City', data.city && data.state ? `${data.city}, ${data.state}` : data.city)}
            ${infoRow('Service', data.jobType?.replace(/_/g, ' '))}
            ${infoRow('Source', data.source)}
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding-top: 24px;">
          ${button('View Lead Details', data.adminUrl)}
        </td>
      </tr>
    </table>
  `

  const text = `
NEW LEAD RECEIVED
${'='.repeat(40)}

${data.urgency === 'emergency' ? '⚠️ EMERGENCY REQUEST\n\n' : ''}
Date: ${new Date(data.createdAt).toLocaleString()}

Contact Information:
${data.contactName ? `Name: ${data.contactName}` : ''}
${data.email ? `Email: ${data.email}` : ''}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.address ? `Address: ${data.address}` : ''}
${data.city && data.state ? `City: ${data.city}, ${data.state}` : ''}
${data.jobType ? `Service: ${data.jobType.replace(/_/g, ' ')}` : ''}
${data.source ? `Source: ${data.source}` : ''}

View lead: ${data.adminUrl}
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// ESTIMATE GENERATED NOTIFICATION
// ============================================================================

export interface EstimateEmailData {
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
  adminUrl: string
}

export async function estimateGeneratedEmail(data: EstimateEmailData): Promise<{ subject: string; html: string; text: string }> {
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const subject = data.contactName
    ? `Estimate Generated: ${data.contactName} - ${formatCurrency(data.priceLikely)}`
    : `New Estimate: ${formatCurrency(data.priceLikely)}`

  const previewText = `Estimate of ${formatCurrency(data.priceLikely)} for ${data.jobType?.replace(/_/g, ' ') || 'roofing service'} in ${data.city || 'your area'}`

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 20px; font-weight: 600;">Estimate Generated</h2>
          <p style="margin: 0 0 24px; color: ${BRAND_COLORS.textLight}; font-size: 14px;">
            A customer has completed the estimate funnel
          </p>
        </td>
      </tr>

      <!-- Price Range -->
      <tr>
        <td style="padding: 24px; background-color: ${BRAND_COLORS.ink}; border-radius: 8px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Estimated Price</p>
          <p style="margin: 0; color: ${BRAND_COLORS.gold}; font-size: 36px; font-weight: 700;">${formatCurrency(data.priceLikely)}</p>
          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Range: ${formatCurrency(data.priceLow)} - ${formatCurrency(data.priceHigh)}</p>
        </td>
      </tr>

      <!-- Customer Details -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-top: 24px;">
          <p style="margin: 0 0 12px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">Customer Details</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${infoRow('Name', data.contactName)}
            ${infoRow('Email', data.email)}
            ${infoRow('Phone', data.phone)}
            ${infoRow('Address', data.address)}
            ${infoRow('City', data.city && data.state ? `${data.city}, ${data.state}` : data.city)}
          </table>
        </td>
      </tr>

      <!-- Property Details -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-top: 16px;">
          <p style="margin: 0 0 12px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">Property Details</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${infoRow('Service', data.jobType?.replace(/_/g, ' '))}
            ${infoRow('Material', data.roofMaterial?.replace(/_/g, ' '))}
            ${infoRow('Roof Size', data.roofSizeSqft ? `${data.roofSizeSqft.toLocaleString()} sq ft` : undefined)}
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding-top: 24px;">
          ${button('View Full Details', data.adminUrl)}
        </td>
      </tr>
    </table>
  `

  const text = `
ESTIMATE GENERATED
${'='.repeat(40)}

Estimated Price: ${formatCurrency(data.priceLikely)}
Range: ${formatCurrency(data.priceLow)} - ${formatCurrency(data.priceHigh)}

Customer Details:
${data.contactName ? `Name: ${data.contactName}` : ''}
${data.email ? `Email: ${data.email}` : ''}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.address ? `Address: ${data.address}` : ''}
${data.city && data.state ? `City: ${data.city}, ${data.state}` : ''}

Property Details:
${data.jobType ? `Service: ${data.jobType.replace(/_/g, ' ')}` : ''}
${data.roofMaterial ? `Material: ${data.roofMaterial.replace(/_/g, ' ')}` : ''}
${data.roofSizeSqft ? `Roof Size: ${data.roofSizeSqft.toLocaleString()} sq ft` : ''}

View full details: ${data.adminUrl}
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// DAILY DIGEST
// ============================================================================

export interface DailyDigestEmailData {
  date: string
  newLeadsCount: number
  estimatesCount: number
  pipelineValue: number
  leads: Array<{
    id: string
    name?: string
    city?: string
    status: string
    estimateValue?: number
  }>
  adminUrl: string
}

// ============================================================================
// CUSTOMER ESTIMATE EMAIL (sent to customer)
// ============================================================================

export interface CustomerEstimateEmailData {
  contactName?: string
  address?: string
  city?: string
  state?: string
  jobType?: string
  priceLow: number
  priceLikely: number
  priceHigh: number
  estimateUrl: string
  validUntil?: string
}

export async function customerEstimateEmail(data: CustomerEstimateEmailData): Promise<{ subject: string; html: string; text: string }> {
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const firstName = data.contactName?.split(' ')[0] || 'there'

  const subject = `Your Roofing Estimate: ${formatCurrency(data.priceLikely)}`
  const previewText = `Hi ${firstName}! Your free roofing estimate is ready. View it online anytime.`

  const company = await getEmailCompanyInfo()

  const validUntilText = data.validUntil
    ? new Date(data.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 20px; font-weight: 600;">Hi ${firstName}!</h2>
          <p style="margin: 0 0 24px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
            Thank you for requesting an estimate for your roofing project. Based on the information you provided, here's your personalized estimate:
          </p>
        </td>
      </tr>

      <!-- Price Display -->
      <tr>
        <td style="padding: 32px; background-color: ${BRAND_COLORS.ink}; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 8px; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Estimated Investment</p>
          <p style="margin: 0; color: ${BRAND_COLORS.gold}; font-size: 42px; font-weight: 700;">${formatCurrency(data.priceLikely)}</p>
          <p style="margin: 12px 0 0; color: #94a3b8; font-size: 14px;">Range: ${formatCurrency(data.priceLow)} - ${formatCurrency(data.priceHigh)}</p>
        </td>
      </tr>

      <!-- Project Summary -->
      <tr>
        <td style="padding: 24px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${infoRow('Property', data.address || 'Not specified')}
            ${infoRow('Location', data.city && data.state ? `${data.city}, ${data.state}` : '')}
            ${infoRow('Service', data.jobType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Roofing Service')}
            ${validUntilText ? infoRow('Valid Until', validUntilText) : ''}
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="text-align: center;">
          ${button('View My Estimate', data.estimateUrl)}
          <p style="margin: 16px 0 0; color: ${BRAND_COLORS.textLight}; font-size: 13px;">
            You can access this estimate anytime using the button above.
          </p>
        </td>
      </tr>

      <!-- What's Next -->
      <tr>
        <td style="padding: 32px 0 0;">
          <h3 style="margin: 0 0 16px; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">What's Next?</h3>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.ink}; font-size: 12px; font-weight: 700; border-radius: 50%;">1</span>
                    </td>
                    <td>
                      <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px;"><strong>Review your estimate</strong> - Click the button above to see the full breakdown</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.ink}; font-size: 12px; font-weight: 700; border-radius: 50%;">2</span>
                    </td>
                    <td>
                      <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px;"><strong>Schedule a consultation</strong> - We'll do an on-site inspection at no cost</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.ink}; font-size: 12px; font-weight: 700; border-radius: 50%;">3</span>
                    </td>
                    <td>
                      <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px;"><strong>Get a detailed quote</strong> - After inspection, we'll provide an exact price</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Questions -->
      <tr>
        <td style="padding: 24px 0 0;">
          <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px; line-height: 1.6;">
            Questions? Just reply to this email or call us at <strong style="color: ${BRAND_COLORS.text};">${company.phone}</strong>. We're here to help!
          </p>
        </td>
      </tr>
    </table>
  `

  const text = `
Hi ${firstName}!

Thank you for requesting an estimate for your roofing project.

YOUR ESTIMATED INVESTMENT
${'='.repeat(40)}
${formatCurrency(data.priceLikely)}
Range: ${formatCurrency(data.priceLow)} - ${formatCurrency(data.priceHigh)}

PROJECT DETAILS
${data.address ? `Property: ${data.address}` : ''}
${data.city && data.state ? `Location: ${data.city}, ${data.state}` : ''}
${data.jobType ? `Service: ${data.jobType.replace(/_/g, ' ')}` : ''}
${validUntilText ? `Valid Until: ${validUntilText}` : ''}

VIEW YOUR ESTIMATE
${data.estimateUrl}

WHAT'S NEXT?
1. Review your estimate - Click the link above
2. Schedule a consultation - We'll do an on-site inspection at no cost
3. Get a detailed quote - After inspection, we'll provide an exact price

Questions? Reply to this email or call us at ${company.phone}.

Best regards,
The ${company.name} Team
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// CONTACT FORM CONFIRMATION (sent to customer)
// ============================================================================

export interface ContactConfirmationEmailData {
  name: string
  subject?: string
  message: string
}

export async function contactConfirmationEmail(data: ContactConfirmationEmailData): Promise<{ subject: string; html: string; text: string }> {
  const company = await getEmailCompanyInfo()
  const firstName = data.name?.split(' ')[0] || 'there'

  const subject = `We received your message - ${company.name}`
  const previewText = `Hi ${firstName}! Thanks for reaching out. We'll get back to you within 24 hours.`

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 20px; font-weight: 600;">Thanks for reaching out, ${firstName}!</h2>
          <p style="margin: 0 0 24px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
            We've received your message and will get back to you within 24 hours. In the meantime, here's a copy of what you sent us:
          </p>
        </td>
      </tr>

      <!-- Message Copy -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid ${BRAND_COLORS.gold};">
          ${data.subject ? `<p style="margin: 0 0 8px; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p><p style="margin: 0 0 16px; color: ${BRAND_COLORS.text}; font-size: 14px; font-weight: 500;">${data.subject}</p>` : ''}
          <p style="margin: 0 0 8px; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </td>
      </tr>

      <!-- Quick Options -->
      <tr>
        <td style="padding: 24px 0;">
          <p style="margin: 0 0 16px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">Need faster service?</p>
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6;">
            Call us directly at <strong>${company.phone}</strong> or get an instant estimate online:
          </p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td>
          ${button('Get a Free Estimate', company.website)}
        </td>
      </tr>
    </table>
  `

  const text = `
Hi ${firstName}!

Thanks for reaching out. We've received your message and will get back to you within 24 hours.

YOUR MESSAGE
${'='.repeat(40)}
${data.subject ? `Subject: ${data.subject}\n` : ''}
${data.message}

NEED FASTER SERVICE?
Call us directly at ${company.phone} or get an instant estimate at ${company.website}

Best regards,
The ${company.name} Team
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// CONTACT FORM ADMIN NOTIFICATION
// ============================================================================

export interface ContactAdminNotificationData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  submittedAt: string
  adminUrl: string
}

export async function contactAdminNotificationEmail(data: ContactAdminNotificationData): Promise<{ subject: string; html: string; text: string }> {
  const subject = data.subject
    ? `Contact Form: ${data.subject}`
    : `Contact Form: ${data.name}`

  const previewText = `New contact form submission from ${data.name}`

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 20px; font-weight: 600;">New Contact Form Submission</h2>
          <p style="margin: 0 0 24px; color: ${BRAND_COLORS.textLight}; font-size: 14px;">
            ${new Date(data.submittedAt).toLocaleString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </td>
      </tr>

      <!-- Contact Details -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 0 0 12px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">Contact Information</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${infoRow('Name', data.name)}
            ${infoRow('Email', data.email)}
            ${infoRow('Phone', data.phone)}
          </table>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-top: 16px;">
          ${data.subject ? `<p style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">Subject: ${data.subject}</p>` : ''}
          <p style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">${data.subject ? 'Message' : 'Message'}</p>
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding-top: 24px;">
          ${button('View in Admin', data.adminUrl)}
        </td>
      </tr>
    </table>
  `

  const text = `
NEW CONTACT FORM SUBMISSION
${'='.repeat(40)}

Date: ${new Date(data.submittedAt).toLocaleString()}

CONTACT INFORMATION
Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}

MESSAGE
${data.subject ? `Subject: ${data.subject}\n` : ''}
${data.message}

View in admin: ${data.adminUrl}
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// DAILY DIGEST
// ============================================================================

export async function dailyDigestEmail(data: DailyDigestEmailData): Promise<{ subject: string; html: string; text: string }> {
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const subject = `Daily Digest: ${data.newLeadsCount} new leads, ${formatCurrency(data.pipelineValue)} pipeline`
  const previewText = `${data.newLeadsCount} new leads received yesterday with a total pipeline value of ${formatCurrency(data.pipelineValue)}`

  const leadRows = data.leads.slice(0, 10).map(lead => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; color: ${BRAND_COLORS.text}; font-size: 14px;">${lead.name || 'No name'}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">${lead.city || '-'}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
        <span style="display: inline-block; padding: 2px 8px; background-color: #f1f5f9; color: ${BRAND_COLORS.text}; font-size: 12px; border-radius: 4px;">${lead.status.replace(/_/g, ' ')}</span>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; color: ${BRAND_COLORS.text}; font-size: 14px; text-align: right;">${lead.estimateValue ? formatCurrency(lead.estimateValue) : '-'}</td>
    </tr>
  `).join('')

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 8px; color: ${BRAND_COLORS.ink}; font-size: 20px; font-weight: 600;">Daily Digest</h2>
          <p style="margin: 0 0 24px; color: ${BRAND_COLORS.textLight}; font-size: 14px;">
            ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </td>
      </tr>

      <!-- Stats -->
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="width: 33%; text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; color: ${BRAND_COLORS.gold}; font-size: 32px; font-weight: 700;">${data.newLeadsCount}</p>
                <p style="margin: 4px 0 0; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase;">New Leads</p>
              </td>
              <td style="width: 8px;"></td>
              <td style="width: 33%; text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; color: ${BRAND_COLORS.gold}; font-size: 32px; font-weight: 700;">${data.estimatesCount}</p>
                <p style="margin: 4px 0 0; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase;">Estimates</p>
              </td>
              <td style="width: 8px;"></td>
              <td style="width: 33%; text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; color: ${BRAND_COLORS.gold}; font-size: 24px; font-weight: 700;">${formatCurrency(data.pipelineValue)}</p>
                <p style="margin: 4px 0 0; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase;">Pipeline</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Recent Leads Table -->
      ${data.leads.length > 0 ? `
      <tr>
        <td style="padding-top: 24px;">
          <p style="margin: 0 0 12px; color: ${BRAND_COLORS.ink}; font-size: 14px; font-weight: 600;">Recent Leads</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <tr style="background-color: #f8fafc;">
              <th style="padding: 12px 8px; text-align: left; color: ${BRAND_COLORS.textLight}; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Name</th>
              <th style="padding: 12px 8px; text-align: left; color: ${BRAND_COLORS.textLight}; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">City</th>
              <th style="padding: 12px 8px; text-align: left; color: ${BRAND_COLORS.textLight}; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Status</th>
              <th style="padding: 12px 8px; text-align: right; color: ${BRAND_COLORS.textLight}; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Value</th>
            </tr>
            ${leadRows}
          </table>
        </td>
      </tr>
      ` : ''}

      <!-- CTA -->
      <tr>
        <td style="padding-top: 24px;">
          ${button('View Dashboard', data.adminUrl)}
        </td>
      </tr>
    </table>
  `

  const text = `
DAILY DIGEST - ${new Date(data.date).toLocaleDateString()}
${'='.repeat(40)}

Stats:
- New Leads: ${data.newLeadsCount}
- Estimates: ${data.estimatesCount}
- Pipeline Value: ${formatCurrency(data.pipelineValue)}

Recent Leads:
${data.leads.slice(0, 10).map(l => `- ${l.name || 'No name'} (${l.city || 'Unknown'}) - ${l.status}${l.estimateValue ? ` - ${formatCurrency(l.estimateValue)}` : ''}`).join('\n')}

View dashboard: ${data.adminUrl}
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// CONSULTATION REMINDER (24h before)
// ============================================================================

export interface ConsultationReminderEmailData {
  customerName?: string
  consultationDate: string // formatted date string
  consultationTime: string // formatted time string
  address?: string
  city?: string
  state?: string
  consultantName?: string
  consultantPhone?: string
  rescheduleUrl?: string
}

export async function consultationReminderEmail(data: ConsultationReminderEmailData): Promise<{ subject: string; html: string; text: string }> {
  const company = await getEmailCompanyInfo()
  const customerName = data.customerName || 'there'
  const subject = `Reminder: Your Roofing Consultation Tomorrow at ${data.consultationTime}`
  const previewText = `We'll see you tomorrow at ${data.consultationTime} for your free roof evaluation.`

  const locationText = data.address
    ? `${data.address}${data.city ? `, ${data.city}` : ''}${data.state ? `, ${data.state}` : ''}`
    : 'Your property'

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <!-- Header -->
      <tr>
        <td style="padding-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${BRAND_COLORS.ink};">
            See You Tomorrow!
          </h1>
        </td>
      </tr>

      <!-- Main Message -->
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0 0 16px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
            Hi ${customerName},
          </p>
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that your roofing consultation is scheduled for <strong>tomorrow</strong>.
            We're looking forward to meeting with you!
          </p>
        </td>
      </tr>

      <!-- Appointment Details Card -->
      <tr>
        <td style="padding-bottom: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND_COLORS.gold}10; border-radius: 12px; border: 2px solid ${BRAND_COLORS.gold}40;">
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 4px; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Consultation Details</p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 12px;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Date</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">${data.consultationDate}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Time</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">${data.consultationTime}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Location</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">${locationText}</p>
                    </td>
                  </tr>
                  ${data.consultantName ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Your Consultant</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">${data.consultantName}</p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- What to Expect -->
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0 0 12px; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">What to Expect</p>
          <ul style="margin: 0; padding: 0 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.8;">
            <li>We'll perform a thorough roof inspection (about 30-45 minutes)</li>
            <li>Review any issues or concerns we find</li>
            <li>Discuss your options and answer any questions</li>
            <li>Provide a detailed estimate if repairs or replacement is needed</li>
          </ul>
        </td>
      </tr>

      <!-- Need to Reschedule -->
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.6;">
            <strong>Need to reschedule?</strong> No problem!
            ${data.rescheduleUrl ? `<a href="${data.rescheduleUrl}" style="color: ${BRAND_COLORS.gold}; text-decoration: underline;">Click here</a> or call` : 'Call'}
            us at ${data.consultantPhone || company.phone} and we'll find a time that works better for you.
          </p>
        </td>
      </tr>
    </table>
  `

  const text = `
See You Tomorrow!

Hi ${customerName},

This is a friendly reminder that your roofing consultation is scheduled for tomorrow.

CONSULTATION DETAILS
--------------------
Date: ${data.consultationDate}
Time: ${data.consultationTime}
Location: ${locationText}
${data.consultantName ? `Consultant: ${data.consultantName}` : ''}

WHAT TO EXPECT
--------------
- We'll perform a thorough roof inspection (about 30-45 minutes)
- Review any issues or concerns we find
- Discuss your options and answer any questions
- Provide a detailed estimate if repairs or replacement is needed

Need to reschedule? No problem! ${data.rescheduleUrl ? `Visit ${data.rescheduleUrl} or call` : 'Call'} us at ${data.consultantPhone || company.phone}.

We look forward to seeing you!

- The ${company.name} Team
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

// ============================================================================
// PAYMENT RECEIVED
// ============================================================================

export interface PaymentReceivedEmailData {
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

// ============================================================================
// WELCOME EMAIL (for auto-created customer accounts)
// ============================================================================

export interface WelcomeEmailData {
  firstName?: string
  email: string
  portalUrl: string
  magicLinkUrl?: string
}

export async function welcomeEmail(data: WelcomeEmailData): Promise<{ subject: string; html: string; text: string }> {
  const company = await getEmailCompanyInfo()
  const firstName = data.firstName || 'there'
  const subject = `Welcome to ${company.name} - Your Account is Ready`
  const previewText = `Hi ${firstName}! Your customer portal is ready. Track your project, view estimates, and more.`

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <!-- Header -->
      <tr>
        <td style="padding-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${BRAND_COLORS.ink};">
            Welcome to ${company.name}!
          </h1>
        </td>
      </tr>

      <!-- Main Message -->
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0 0 16px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
            Hi ${firstName},
          </p>
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
            Thank you for getting an estimate with us! We've created a customer portal account for you
            where you can view your estimate, track your project progress, and manage your roofing journey.
          </p>
        </td>
      </tr>

      <!-- Portal Features -->
      <tr>
        <td style="padding-bottom: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; padding: 24px;">
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 16px; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">With your portal account, you can:</p>
                <ul style="margin: 0; padding: 0 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.8;">
                  <li>View and download your estimate anytime</li>
                  <li>Upload photos of your roof</li>
                  <li>Track your project status</li>
                  <li>Explore financing options</li>
                  <li>Communicate with our team</li>
                </ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="text-align: center; padding-bottom: 24px;">
          ${button('Access My Portal', data.magicLinkUrl || data.portalUrl)}
          <p style="margin: 16px 0 0; color: ${BRAND_COLORS.textLight}; font-size: 13px;">
            ${data.magicLinkUrl ? 'This link will log you in automatically and expires in 24 hours.' : 'Sign in with your email to access your portal.'}
          </p>
        </td>
      </tr>

      <!-- Account Info -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid ${BRAND_COLORS.gold};">
          <p style="margin: 0 0 8px; color: ${BRAND_COLORS.textLight}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Account Email</p>
          <p style="margin: 0; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 500;">${data.email}</p>
        </td>
      </tr>

      <!-- Questions -->
      <tr>
        <td style="padding: 24px 0 0;">
          <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px; line-height: 1.6;">
            Questions? Just reply to this email or call us at <strong style="color: ${BRAND_COLORS.text};">${company.phone}</strong>. We're here to help!
          </p>
        </td>
      </tr>
    </table>
  `

  const text = `
WELCOME TO ${company.name.toUpperCase()}!

Hi ${firstName},

Thank you for getting an estimate with us! We've created a customer portal account for you.

WITH YOUR PORTAL ACCOUNT, YOU CAN:
- View and download your estimate anytime
- Upload photos of your roof
- Track your project status
- Explore financing options
- Communicate with our team

ACCESS YOUR PORTAL
${data.magicLinkUrl || data.portalUrl}
${data.magicLinkUrl ? '(This link expires in 24 hours)' : ''}

YOUR ACCOUNT EMAIL: ${data.email}

Questions? Reply to this email or call us at ${company.phone}.

- The ${company.name} Team
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}

export async function paymentReceivedEmail(data: PaymentReceivedEmailData): Promise<{ subject: string; html: string; text: string }> {
  const company = await getEmailCompanyInfo()
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const customerName = data.customerName || 'there'
  const paymentTypeLabels = {
    deposit: 'Deposit',
    progress: 'Progress Payment',
    final: 'Final Payment',
  }
  const paymentLabel = paymentTypeLabels[data.paymentType]

  const subject = `Payment Received - ${formatCurrency(data.amount)} ${paymentLabel}`
  const previewText = `Thank you! We've received your ${paymentLabel.toLowerCase()} of ${formatCurrency(data.amount)}.`

  const locationText = data.address
    ? `${data.address}${data.city ? `, ${data.city}` : ''}${data.state ? `, ${data.state}` : ''}`
    : null

  const isDeposit = data.paymentType === 'deposit'
  const isFinal = data.paymentType === 'final'

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <!-- Header with Checkmark -->
      <tr>
        <td style="padding-bottom: 24px; text-align: center;">
          <div style="display: inline-block; width: 64px; height: 64px; background-color: ${BRAND_COLORS.success}20; border-radius: 50%; line-height: 64px; margin-bottom: 16px;">
            <span style="font-size: 32px;">&#10003;</span>
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${BRAND_COLORS.ink};">
            Payment Received!
          </h1>
        </td>
      </tr>

      <!-- Main Message -->
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; text-align: center;">
            Hi ${customerName}, thank you for your payment! We've successfully received your ${paymentLabel.toLowerCase()}.
          </p>
        </td>
      </tr>

      <!-- Payment Details Card -->
      <tr>
        <td style="padding-bottom: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">${paymentLabel}</p>
                      <p style="margin: 8px 0 0; color: ${BRAND_COLORS.success}; font-size: 32px; font-weight: 700;">${formatCurrency(data.amount)}</p>
                    </td>
                  </tr>
                  ${locationText ? `
                  <tr>
                    <td style="padding-top: 16px;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Project Address</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px;">${locationText}</p>
                    </td>
                  </tr>
                  ` : ''}
                  ${data.projectDescription ? `
                  <tr>
                    <td style="padding-top: 16px;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Project</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px;">${data.projectDescription}</p>
                    </td>
                  </tr>
                  ` : ''}
                  ${data.remainingBalance !== undefined && data.remainingBalance > 0 ? `
                  <tr>
                    <td style="padding-top: 16px;">
                      <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 14px;">Remaining Balance</p>
                      <p style="margin: 4px 0 0; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">${formatCurrency(data.remainingBalance)}</p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${data.receiptUrl ? `
      <!-- Download Receipt -->
      <tr>
        <td style="padding-bottom: 24px; text-align: center;">
          <a href="${data.receiptUrl}" style="color: ${BRAND_COLORS.gold}; font-size: 14px; text-decoration: underline;">Download Receipt</a>
        </td>
      </tr>
      ` : ''}

      <!-- Next Steps -->
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0 0 12px; color: ${BRAND_COLORS.ink}; font-size: 16px; font-weight: 600;">What's Next?</p>
          ${isDeposit ? `
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.6;">
            Now that we've received your deposit, our team will reach out within 1-2 business days to schedule your project start date.
            We'll coordinate materials delivery and crew scheduling to get your project completed efficiently.
          </p>
          ` : isFinal ? `
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.6;">
            Your account is now paid in full. Thank you for choosing ${company.name}!
            Your project warranty information will be sent separately. We'd love to hear about your experience -
            feel free to leave us a review.
          </p>
          ` : `
          <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.6;">
            Thank you for your progress payment. Our team will continue working on your project as scheduled.
            If you have any questions, don't hesitate to reach out.
          </p>
          `}
        </td>
      </tr>

      <!-- CTA -->
      ${data.portalUrl ? `
      <tr>
        <td>
          ${button('View Project Details', data.portalUrl)}
        </td>
      </tr>
      ` : ''}
    </table>
  `

  const text = `
PAYMENT RECEIVED

Hi ${customerName},

Thank you for your payment! We've successfully received your ${paymentLabel.toLowerCase()}.

PAYMENT DETAILS
---------------
Amount: ${formatCurrency(data.amount)}
Type: ${paymentLabel}
${locationText ? `Address: ${locationText}` : ''}
${data.projectDescription ? `Project: ${data.projectDescription}` : ''}
${data.remainingBalance !== undefined && data.remainingBalance > 0 ? `Remaining Balance: ${formatCurrency(data.remainingBalance)}` : ''}

WHAT'S NEXT
-----------
${isDeposit ? `Now that we've received your deposit, our team will reach out within 1-2 business days to schedule your project start date.` : isFinal ? `Your account is now paid in full. Thank you for choosing ${company.name}! Your project warranty information will be sent separately.` : `Our team will continue working on your project as scheduled.`}

${data.receiptUrl ? `Download your receipt: ${data.receiptUrl}` : ''}
${data.portalUrl ? `View project details: ${data.portalUrl}` : ''}

Thank you for choosing ${company.name}!
  `.trim()

  return {
    subject,
    html: await emailWrapper(content, previewText),
    text,
  }
}
