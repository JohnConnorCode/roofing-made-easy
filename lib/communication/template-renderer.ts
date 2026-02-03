/**
 * Template rendering utilities
 */

import { createClient } from '@/lib/supabase/server'
import type { TemplateVariables, MessageTemplate } from './types'
import { getBusinessConfig, getFullAddress, getPhoneDisplay } from '@/lib/config/business'

/**
 * Render a template by replacing {{variable}} placeholders
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`
    result = result.split(placeholder).join(value || '')
  }

  // Clean up any remaining unresolved variables
  result = result.replace(/\{\{[^}]+\}\}/g, '')

  return result
}

/**
 * Get variables for a lead
 */
export async function getLeadVariables(leadId: string): Promise<TemplateVariables> {
  const supabase = await createClient()
  const config = getBusinessConfig()

  // Fetch lead with related data
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      id,
      contacts (
        first_name,
        last_name,
        email,
        phone
      ),
      properties (
        street_address,
        city,
        state,
        zip_code
      ),
      detailed_estimates (
        id,
        price_likely,
        price_low,
        price_high,
        share_token
      )
    `)
    .eq('id', leadId)
    .single()

  if (!lead) {
    return getCompanyVariables()
  }

  // Cast the lead data to access nested relations
  const leadData = lead as {
    id: string
    contacts: Array<{
      first_name: string | null
      last_name: string | null
      email: string | null
      phone: string | null
    }>
    properties: Array<{
      street_address: string | null
      city: string | null
      state: string | null
      zip_code: string | null
    }>
    detailed_estimates: Array<{
      id: string
      price_likely: number
      price_low: number
      price_high: number
      share_token: string | null
    }>
  }

  const contact = leadData.contacts?.[0]
  const property = leadData.properties?.[0]
  const estimate = leadData.detailed_estimates?.[0]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const variables: TemplateVariables = {
    // Customer info
    customer_name: contact
      ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Valued Customer'
      : 'Valued Customer',
    customer_first_name: contact?.first_name || '',
    customer_last_name: contact?.last_name || '',
    customer_email: contact?.email || '',
    customer_phone: contact?.phone || '',

    // Property info
    property_address: property
      ? [property.street_address, property.city, property.state, property.zip_code]
          .filter(Boolean)
          .join(', ')
      : '',
    property_city: property?.city || '',
    property_state: property?.state || '',
    property_zip: property?.zip_code || '',

    // Estimate info
    estimate_total: estimate ? formatCurrency(estimate.price_likely) : '',
    estimate_low: estimate ? formatCurrency(estimate.price_low) : '',
    estimate_high: estimate ? formatCurrency(estimate.price_high) : '',
    estimate_link: estimate?.share_token ? `${appUrl}/estimate/${estimate.share_token}` : '',

    // Company info
    ...getCompanyVariables(),

    // Links
    portal_link: `${appUrl}/portal`,
    review_link: config.social.googleBusiness || `${appUrl}/review`,
  }

  return variables
}

/**
 * Get company variables from config
 */
export function getCompanyVariables(): TemplateVariables {
  const config = getBusinessConfig()

  return {
    company_name: config.name,
    company_phone: getPhoneDisplay(),
    company_email: config.email.primary,
    company_address: getFullAddress(),
  }
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Preview a template with sample data
 */
export function previewTemplate(template: MessageTemplate): { subject: string | null; body: string } {
  const sampleVariables: TemplateVariables = {
    customer_name: 'John Smith',
    customer_first_name: 'John',
    customer_last_name: 'Smith',
    customer_email: 'john.smith@example.com',
    customer_phone: '(555) 123-4567',
    property_address: '123 Main St, Tupelo, MS 38801',
    property_city: 'Tupelo',
    property_state: 'MS',
    property_zip: '38801',
    estimate_total: '$12,500',
    estimate_low: '$11,000',
    estimate_high: '$14,000',
    estimate_link: 'https://example.com/estimate/abc123',
    appointment_date: 'Monday, March 15, 2026',
    appointment_time: '10:00 AM',
    company_name: 'Example Roofing Co.',
    company_phone: '(555) 987-6543',
    company_email: 'info@example.com',
    company_address: '456 Business Ave, Tupelo, MS 38801',
    review_link: 'https://g.page/example-roofing/review',
    portal_link: 'https://example.com/portal',
  }

  return {
    subject: template.subject ? renderTemplate(template.subject, sampleVariables) : null,
    body: renderTemplate(template.body, sampleVariables),
  }
}

/**
 * Validate template body for required variables
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g) || []
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
}

/**
 * Check if all required variables are provided
 */
export function validateVariables(
  template: string,
  variables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const required = extractVariables(template)
  const missing = required.filter(v => !variables[v])

  return {
    valid: missing.length === 0,
    missing,
  }
}
