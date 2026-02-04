import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'

const createMacroSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  roof_type: z.enum([
    'asphalt_shingle', 'metal_standing_seam', 'metal_corrugated',
    'tile_concrete', 'tile_clay', 'slate', 'wood_shake',
    'flat_tpo', 'flat_epdm', 'flat_modified_bitumen', 'any'
  ]).default('any'),
  job_type: z.enum([
    'full_replacement', 'repair', 'overlay', 'partial_replacement',
    'storm_damage', 'insurance_claim', 'maintenance', 'gutter_only', 'any'
  ]).default('any'),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
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

    const roofType = searchParams.get('roof_type')
    const jobType = searchParams.get('job_type')
    const activeOnly = searchParams.get('active') !== 'false'
    const includeLineItems = searchParams.get('include_line_items') === 'true'

    let query = supabase
      .from('estimate_macros')
      .select(includeLineItems
        ? `*, line_items:macro_line_items(*, line_item:line_items(*))`
        : '*'
      )
      .order('is_default', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (roofType && roofType !== 'any') {
      query = query.or(`roof_type.eq.${roofType},roof_type.eq.any`)
    }

    if (jobType && jobType !== 'any') {
      query = query.or(`job_type.eq.${jobType},job_type.eq.any`)
    }

    const { data: macros, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch macros' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { macros },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    const body = await request.json()
    const parsed = createMacroSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // If setting as default, unset any existing default for this roof/job type
    if (parsed.data.is_default) {
      await supabase
        .from('estimate_macros')
        .update({ is_default: false } as never)
        .eq('roof_type', parsed.data.roof_type)
        .eq('job_type', parsed.data.job_type)
        .eq('is_default', true)
    }

    const { data: macro, error } = await supabase
      .from('estimate_macros')
      .insert(parsed.data as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create macro' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { macro },
      { status: 201, headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
