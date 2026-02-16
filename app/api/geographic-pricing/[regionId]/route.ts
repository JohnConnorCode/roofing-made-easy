import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'

// Validation schema for updates
const updateGeoPricingSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  material_multiplier: z.number().min(0.5).max(3.0).optional(),
  labor_multiplier: z.number().min(0.5).max(3.0).optional(),
  equipment_multiplier: z.number().min(0.5).max(3.0).optional(),
  zip_codes: z.array(z.string().regex(/^\d{5}$/, 'Invalid ZIP code format')).optional(),
  county: z.string().max(100).nullable().optional(),
  is_active: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
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
    const { regionId } = await params

    const { data, error } = await supabase
      .from('geographic_pricing')
      .select('*')
      .eq('id', regionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 })
      }
      console.error('Geographic pricing fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch pricing region' }, { status: 500 })
    }

    return NextResponse.json(
      { region: data },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
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
    const { regionId } = await params
    const body = await request.json()

    // Validate with Zod schema
    const parsed = updateGeoPricingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Build update object from validated data
    const updates: Record<string, unknown> = {}

    if (parsed.data.name !== undefined) updates.name = parsed.data.name
    if (parsed.data.material_multiplier !== undefined)
      updates.material_multiplier = parsed.data.material_multiplier
    if (parsed.data.labor_multiplier !== undefined)
      updates.labor_multiplier = parsed.data.labor_multiplier
    if (parsed.data.equipment_multiplier !== undefined)
      updates.equipment_multiplier = parsed.data.equipment_multiplier
    if (parsed.data.zip_codes !== undefined) updates.zip_codes = parsed.data.zip_codes
    if (parsed.data.county !== undefined) updates.county = parsed.data.county
    if (parsed.data.is_active !== undefined) updates.is_active = parsed.data.is_active

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('geographic_pricing' as never)
      .update(updates as never)
      .eq('id', regionId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 })
      }
      console.error('Geographic pricing update error:', error)
      return NextResponse.json({ error: 'Failed to update pricing region' }, { status: 500 })
    }

    return NextResponse.json(
      { region: data },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
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
    const { regionId } = await params

    const { error } = await supabase
      .from('geographic_pricing')
      .delete()
      .eq('id', regionId)

    if (error) {
      console.error('Geographic pricing delete error:', error)
      return NextResponse.json({ error: 'Failed to delete pricing region' }, { status: 500 })
    }

    return NextResponse.json(
      { success: true },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
