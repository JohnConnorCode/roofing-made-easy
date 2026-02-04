import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { GeographicPricing } from '@/lib/supabase/types'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'

// Validation schema for geographic pricing
const geoPricingSchema = z.object({
  state: z.string().length(2, 'State must be 2-letter code'),
  county: z.string().max(100).optional().nullable(),
  zip_codes: z.array(z.string().regex(/^\d{5}$/, 'Invalid ZIP code format')).optional().default([]),
  name: z.string().min(1, 'Name is required').max(100),
  material_multiplier: z.number().min(0.5).max(3.0).default(1.0),
  labor_multiplier: z.number().min(0.5).max(3.0).default(1.0),
  equipment_multiplier: z.number().min(0.5).max(3.0).default(1.0),
  is_active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const state = searchParams.get('state')
    const zipCode = searchParams.get('zip_code')

    let query = supabase
      .from('geographic_pricing')
      .select('*')
      .order('state', { ascending: true })
      .order('name', { ascending: true })

    if (state) {
      query = query.eq('state', state)
    }

    if (zipCode) {
      query = query.contains('zip_codes', [zipCode])
    }

    const { data, error } = await query

    if (error) {
      console.error('Geographic pricing fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch pricing regions' }, { status: 500 })
    }

    return NextResponse.json(
      { regions: data || [] },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    // Validate with Zod schema
    const parsed = geoPricingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const newRegion: Partial<GeographicPricing> = {
      state: parsed.data.state,
      name: parsed.data.name,
      material_multiplier: parsed.data.material_multiplier,
      labor_multiplier: parsed.data.labor_multiplier,
      equipment_multiplier: parsed.data.equipment_multiplier,
      zip_codes: parsed.data.zip_codes,
      county: parsed.data.county || null,
      is_active: parsed.data.is_active,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('geographic_pricing')
      .insert(newRegion)
      .select()
      .single()

    if (error) {
      console.error('Geographic pricing create error:', error)
      return NextResponse.json({ error: 'Failed to create pricing region' }, { status: 500 })
    }

    return NextResponse.json(
      { region: data },
      { status: 201, headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
