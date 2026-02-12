import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

// Settings schema for validation
const settingsSchema = z.object({
  company: z.object({
    name: z.string().min(1),
    legalName: z.string().optional(),
    tagline: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
  hours: z.object({
    weekdaysOpen: z.string().optional(),
    weekdaysClose: z.string().optional(),
    saturdayOpen: z.string().optional(),
    saturdayClose: z.string().optional(),
    sundayOpen: z.string().optional(),
    sundayClose: z.string().optional(),
    emergencyAvailable: z.boolean().optional(),
  }).optional(),
  pricing: z.object({
    overheadPercent: z.number().min(0).max(100).optional(),
    profitMarginPercent: z.number().min(0).max(100).optional(),
    taxRate: z.number().min(0).max(100).optional(),
  }).optional(),
  notifications: z.object({
    newLeadEmail: z.boolean().optional(),
    estimateEmail: z.boolean().optional(),
    dailyDigest: z.boolean().optional(),
    emailRecipients: z.array(z.string().email()).optional(),
  }).optional(),
  leadSources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
  })).optional(),
})

// Database row type
interface SettingsRow {
  company_name: string
  company_legal_name: string | null
  company_tagline: string | null
  company_phone: string | null
  company_email: string | null
  company_website: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  hours_weekdays_open: string | null
  hours_weekdays_close: string | null
  hours_saturday_open: string | null
  hours_saturday_close: string | null
  hours_sunday_open: string | null
  hours_sunday_close: string | null
  hours_emergency_available: boolean | null
  pricing_overhead_percent: number | null
  pricing_profit_margin_percent: number | null
  pricing_tax_rate: number | null
  notifications_new_lead_email: boolean | null
  notifications_estimate_email: boolean | null
  notifications_daily_digest: boolean | null
  notifications_email_recipients: string[] | null
  lead_sources: Array<{ id: string; name: string; enabled: boolean }> | null
}

// Transform database row to API response format
function transformRowToSettings(row: SettingsRow) {
  return {
    company: {
      name: row.company_name,
      legalName: row.company_legal_name ?? undefined,
      tagline: row.company_tagline ?? undefined,
      phone: row.company_phone ?? undefined,
      email: row.company_email ?? undefined,
      website: row.company_website ?? undefined,
    },
    address: {
      street: row.address_street ?? undefined,
      city: row.address_city ?? undefined,
      state: row.address_state ?? undefined,
      zip: row.address_zip ?? undefined,
    },
    hours: {
      weekdaysOpen: row.hours_weekdays_open ?? undefined,
      weekdaysClose: row.hours_weekdays_close ?? undefined,
      saturdayOpen: row.hours_saturday_open ?? undefined,
      saturdayClose: row.hours_saturday_close ?? undefined,
      sundayOpen: row.hours_sunday_open ?? undefined,
      sundayClose: row.hours_sunday_close ?? undefined,
      emergencyAvailable: row.hours_emergency_available ?? undefined,
    },
    pricing: {
      overheadPercent: row.pricing_overhead_percent ?? undefined,
      profitMarginPercent: row.pricing_profit_margin_percent ?? undefined,
      taxRate: row.pricing_tax_rate ?? undefined,
    },
    notifications: {
      newLeadEmail: row.notifications_new_lead_email ?? undefined,
      estimateEmail: row.notifications_estimate_email ?? undefined,
      dailyDigest: row.notifications_daily_digest ?? undefined,
      emailRecipients: row.notifications_email_recipients ?? undefined,
    },
    leadSources: row.lead_sources ?? [],
  }
}

// Default settings for fallback
const defaultSettings = {
  company: {
    name: 'Farrell Roofing',
    legalName: 'Farrell Roofing LLC',
    tagline: "Northeast Mississippi's Trusted Roofing Experts",
    phone: '(662) 555-0123',
    email: 'info@smartroofpricing.com',
  },
  address: {
    street: '123 Main Street',
    city: 'Tupelo',
    state: 'MS',
    zip: '38801',
  },
  hours: {
    weekdaysOpen: '07:00',
    weekdaysClose: '18:00',
    saturdayOpen: '08:00',
    saturdayClose: '14:00',
    sundayOpen: '',
    sundayClose: '',
    emergencyAvailable: true,
  },
  pricing: {
    overheadPercent: 15,
    profitMarginPercent: 20,
    taxRate: 7,
  },
  notifications: {
    newLeadEmail: true,
    estimateEmail: true,
    dailyDigest: false,
    emailRecipients: ['admin@smartroofpricing.com'],
  },
  leadSources: [
    { id: 'web_funnel', name: 'Web Funnel', enabled: true },
    { id: 'google', name: 'Google Ads', enabled: true },
    { id: 'facebook', name: 'Facebook', enabled: true },
    { id: 'referral', name: 'Referral', enabled: true },
    { id: 'phone', name: 'Phone Call', enabled: true },
    { id: 'walk_in', name: 'Walk In', enabled: false },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Fetch settings from database (single row with id=1)
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      // If table doesn't exist or no row, return defaults
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({ settings: defaultSettings })
      }
      throw error
    }

    const settings = transformRowToSettings(data as SettingsRow)
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}

    if (data.company) {
      if (data.company.name !== undefined) updateData.company_name = data.company.name
      if (data.company.legalName !== undefined) updateData.company_legal_name = data.company.legalName
      if (data.company.tagline !== undefined) updateData.company_tagline = data.company.tagline
      if (data.company.phone !== undefined) updateData.company_phone = data.company.phone
      if (data.company.email !== undefined) updateData.company_email = data.company.email
      if (data.company.website !== undefined) updateData.company_website = data.company.website
    }

    if (data.address) {
      if (data.address.street !== undefined) updateData.address_street = data.address.street
      if (data.address.city !== undefined) updateData.address_city = data.address.city
      if (data.address.state !== undefined) {
        updateData.address_state = data.address.state
        // Admin enters abbreviation (e.g. "MS"), keep state_code in sync
        updateData.address_state_code = data.address.state
      }
      if (data.address.zip !== undefined) updateData.address_zip = data.address.zip
    }

    if (data.hours) {
      if (data.hours.weekdaysOpen !== undefined) updateData.hours_weekdays_open = data.hours.weekdaysOpen
      if (data.hours.weekdaysClose !== undefined) updateData.hours_weekdays_close = data.hours.weekdaysClose
      if (data.hours.saturdayOpen !== undefined) updateData.hours_saturday_open = data.hours.saturdayOpen
      if (data.hours.saturdayClose !== undefined) updateData.hours_saturday_close = data.hours.saturdayClose
      if (data.hours.sundayOpen !== undefined) updateData.hours_sunday_open = data.hours.sundayOpen
      if (data.hours.sundayClose !== undefined) updateData.hours_sunday_close = data.hours.sundayClose
      if (data.hours.emergencyAvailable !== undefined) updateData.hours_emergency_available = data.hours.emergencyAvailable
    }

    if (data.pricing) {
      if (data.pricing.overheadPercent !== undefined) updateData.pricing_overhead_percent = data.pricing.overheadPercent
      if (data.pricing.profitMarginPercent !== undefined) updateData.pricing_profit_margin_percent = data.pricing.profitMarginPercent
      if (data.pricing.taxRate !== undefined) updateData.pricing_tax_rate = data.pricing.taxRate
    }

    if (data.notifications) {
      if (data.notifications.newLeadEmail !== undefined) updateData.notifications_new_lead_email = data.notifications.newLeadEmail
      if (data.notifications.estimateEmail !== undefined) updateData.notifications_estimate_email = data.notifications.estimateEmail
      if (data.notifications.dailyDigest !== undefined) updateData.notifications_daily_digest = data.notifications.dailyDigest
      if (data.notifications.emailRecipients !== undefined) updateData.notifications_email_recipients = data.notifications.emailRecipients
    }

    if (data.leadSources !== undefined) {
      updateData.lead_sources = data.leadSources
    }

    // Upsert the settings row (insert if not exists, update if exists)
    const { data: updatedRow, error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...updateData } as never, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    // Bust the server-side cache so the new phone/config shows immediately
    revalidateTag('business-config', { expire: 300 })

    const settings = transformRowToSettings(updatedRow as SettingsRow)
    return NextResponse.json({ success: true, settings })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
