/**
 * Email Preview API
 * POST - Render email template with sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/team/permissions'
import { emailWrapper } from '@/lib/email/templates'
import { getEmailCompanyInfo } from '@/lib/email/brand-config'
import { createClient } from '@/lib/supabase/server'

// Sample data for template preview
function getSampleData() {
  const company = getEmailCompanyInfo()

  return {
    // Customer info
    customer_name: 'John Smith',
    customer_first_name: 'John',
    customer_last_name: 'Smith',
    customer_email: 'john.smith@example.com',
    customer_phone: '(555) 123-4567',

    // Property info
    property_address: '123 Oak Street, Tupelo, MS 38801',
    property_city: 'Tupelo',
    property_state: 'MS',
    property_zip: '38801',
    job_type: 'Roof Replacement',

    // Estimate info
    estimate_total: '$12,500',
    estimate_low: '$10,000',
    estimate_high: '$15,000',
    estimate_link: 'https://example.com/estimate/abc123',

    // Appointment info
    appointment_date: 'Tuesday, February 15, 2026',
    appointment_time: '10:00 AM',

    // Company info
    company_name: company.name,
    company_phone: company.phone,
    company_email: company.email,
    company_address: company.fullAddress,
    website_url: company.website,

    // Payment info
    payment_amount: '$3,000',
    payment_type: 'deposit',
    payment_type_label: 'Deposit',
    next_steps_message:
      "Now that we've received your deposit, our team will reach out within 1-2 business days to schedule your project start date.",

    // Links
    admin_url: 'https://example.com/admin/leads/abc123',
    portal_link: 'https://example.com/portal',
    review_link: 'https://example.com/review',

    // Digest data
    date_formatted: 'Monday, February 14, 2026',
    new_leads_count: '5',
    estimates_count: '3',
    pipeline_value: '$45,000',
    recent_leads_table: '<p style="color: #64748b; font-size: 14px;">[Recent leads would appear here]</p>',

    // Misc
    created_at_formatted: 'February 14, 2026 at 2:30 PM',
    urgency_badge: '',
    message_body: 'I would like to get an estimate for my roof. It has been leaking near the chimney.',
  }
}

// Render template body with variables
function renderTemplate(body: string, variables: Record<string, string>): string {
  let result = body
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '')
  }
  // Clean up any remaining unmatched variables
  result = result.replace(/\{\{[^}]+\}\}/g, '')
  return result
}

// POST /api/admin/email-preview - Render email preview
export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const body = await request.json()
    const { templateId, templateSlug, subject, htmlBody, customData } = body

    const sampleData = { ...getSampleData(), ...customData }
    let templateSubject = subject
    let templateBody = htmlBody

    // If templateId or templateSlug provided, fetch from database
    if (templateId || templateSlug) {
      const supabase = await createClient()
      let query = supabase.from('message_templates').select('*')

      if (templateId) {
        query = query.eq('id', templateId)
      } else {
        query = query.eq('slug', templateSlug)
      }

      const { data: template, error } = await query.single()

      if (error || !template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      const tmpl = template as { subject?: string; body: string }
      templateSubject = tmpl.subject
      templateBody = tmpl.body
    }

    if (!templateBody) {
      return NextResponse.json(
        { error: 'Template body is required' },
        { status: 400 }
      )
    }

    // Render subject if provided
    const renderedSubject = templateSubject
      ? renderTemplate(templateSubject, sampleData)
      : undefined

    // Render body content
    const renderedBody = renderTemplate(templateBody, sampleData)

    // Check if the body already contains full HTML structure
    const hasFullHtml = renderedBody.toLowerCase().includes('<!doctype html') ||
      renderedBody.toLowerCase().includes('<html')

    // Wrap in email wrapper unless it's already complete HTML
    const fullHtml = hasFullHtml
      ? renderedBody
      : emailWrapper(renderedBody, renderedSubject || 'Email Preview')

    // Generate plain text version
    const plainText = renderedBody
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()

    return NextResponse.json({
      subject: renderedSubject,
      html: fullHtml,
      plainText,
      sampleData, // Return sample data so UI can show what variables were used
    })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
