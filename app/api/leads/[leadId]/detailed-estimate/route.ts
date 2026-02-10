import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'

const variablesSchema = z.object({
  SQ: z.number(),
  SF: z.number(),
  P: z.number(),
  EAVE: z.number(),
  R: z.number(),
  VAL: z.number(),
  HIP: z.number(),
  RAKE: z.number(),
  SKYLIGHT_COUNT: z.number(),
  CHIMNEY_COUNT: z.number(),
  PIPE_COUNT: z.number(),
  VENT_COUNT: z.number(),
  GUTTER_LF: z.number(),
  DS_COUNT: z.number(),
  slopes: z.record(z.string(), z.object({
    SQ: z.number(),
    SF: z.number(),
    PITCH: z.number(),
    EAVE: z.number(),
    RIDGE: z.number(),
    VALLEY: z.number(),
    HIP: z.number(),
    RAKE: z.number(),
  })).optional(),
})

const createEstimateSchema = z.object({
  name: z.string().default('Estimate'),
  sketch_id: z.string().uuid().optional(),
  variables: variablesSchema,
  geographic_pricing_id: z.string().uuid().optional(),
  overhead_percent: z.number().min(0).max(50).default(10),
  profit_percent: z.number().min(0).max(50).default(15),
  tax_percent: z.number().min(0).max(20).default(0),
  internal_notes: z.string().optional(),
  customer_notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { leadId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const includeLineItems = searchParams.get('include_line_items') !== 'false'
    const status = searchParams.get('status')

    let query = supabase
      .from('detailed_estimates')
      .select(includeLineItems
        ? `*, line_items:estimate_line_items(*), sketch:roof_sketches(*)`
        : '*'
      )
      .eq('lead_id', leadId)
      .eq('is_superseded', false)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: estimates, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch estimates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ estimates })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { leadId } = await params
    const body = await request.json()
    const parsed = createEstimateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if lead exists
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Fetch geographic pricing if specified
    type GeoPricing = {
      material_multiplier?: number
      labor_multiplier?: number
      equipment_multiplier?: number
    }
    let geographicPricing: GeoPricing | null = null
    if (parsed.data.geographic_pricing_id) {
      const { data } = await supabase
        .from('geographic_pricing')
        .select('*')
        .eq('id', parsed.data.geographic_pricing_id)
        .single()
      geographicPricing = data as GeoPricing | null
    }

    const geoMultipliers = {
      material: (geographicPricing as GeoPricing | null)?.material_multiplier || 1,
      labor: (geographicPricing as GeoPricing | null)?.labor_multiplier || 1,
      equipment: (geographicPricing as GeoPricing | null)?.equipment_multiplier || 1,
    }

    // Count existing estimates for versioning
    const { count } = await supabase
      .from('detailed_estimates')
      .select('*', { count: 'exact', head: true })
      .eq('lead_id', leadId)

    const { data: estimate, error } = await supabase
      .from('detailed_estimates')
      .insert({
        lead_id: leadId,
        name: parsed.data.name,
        version: (count || 0) + 1,
        sketch_id: parsed.data.sketch_id || null,
        variables: parsed.data.variables,
        overhead_percent: parsed.data.overhead_percent,
        profit_percent: parsed.data.profit_percent,
        tax_percent: parsed.data.tax_percent,
        geographic_pricing_id: parsed.data.geographic_pricing_id || null,
        geographic_adjustment: (geoMultipliers.material + geoMultipliers.labor + geoMultipliers.equipment) / 3,
        internal_notes: parsed.data.internal_notes || null,
        customer_notes: parsed.data.customer_notes || null,
        status: 'draft',
        // Totals start at 0, will be calculated when line items are added
        total_material: 0,
        total_labor: 0,
        total_equipment: 0,
        subtotal: 0,
        overhead_amount: 0,
        profit_amount: 0,
        taxable_amount: 0,
        tax_amount: 0,
        price_low: 0,
        price_likely: 0,
        price_high: 0,
      } as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create estimate' },
        { status: 500 }
      )
    }

    return NextResponse.json({ estimate }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
