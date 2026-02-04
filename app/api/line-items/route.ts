import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'

const createLineItemSchema = z.object({
  item_code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum([
    'tear_off', 'underlayment', 'shingles', 'metal_roofing', 'tile_roofing',
    'flat_roofing', 'flashing', 'ventilation', 'gutters', 'skylights',
    'chimneys', 'decking', 'insulation', 'labor', 'equipment', 'disposal',
    'permits', 'miscellaneous'
  ]),
  unit_type: z.enum(['SQ', 'SF', 'LF', 'EA', 'HR', 'DAY', 'TON', 'GAL', 'BDL', 'RL']).default('SQ'),
  base_material_cost: z.number().min(0).default(0),
  base_labor_cost: z.number().min(0).default(0),
  base_equipment_cost: z.number().min(0).default(0),
  quantity_formula: z.string().optional(),
  default_waste_factor: z.number().min(1).max(2).default(1),
  is_active: z.boolean().default(true),
  is_taxable: z.boolean().default(true),
  sort_order: z.number().int().default(0),
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

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const activeOnly = searchParams.get('active') !== 'false'

    let query = supabase
      .from('line_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('item_code', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,item_code.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: lineItems, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch line items' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { lineItems },
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
    const parsed = createLineItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: lineItem, error } = await supabase
      .from('line_items')
      .insert(parsed.data as never)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Item code already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create line item' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { lineItem },
      { status: 201, headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
