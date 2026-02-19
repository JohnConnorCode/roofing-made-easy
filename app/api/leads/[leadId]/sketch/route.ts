import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const sketchDataSchema = z.object({
  planes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    vertices: z.array(z.object({ x: z.number(), y: z.number() })),
    pitch: z.number(),
    area_sqft: z.number(),
    color: z.string().optional(),
  })).optional(),
  edges: z.array(z.object({
    id: z.string(),
    type: z.enum(['eave', 'ridge', 'valley', 'hip', 'rake']),
    start: z.object({ x: z.number(), y: z.number() }),
    end: z.object({ x: z.number(), y: z.number() }),
    length_lf: z.number(),
  })).optional(),
  features: z.array(z.object({
    id: z.string(),
    type: z.enum(['skylight', 'chimney', 'pipe_boot', 'vent', 'dormer', 'hvac']),
    position: z.object({ x: z.number(), y: z.number() }),
    dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
  })).optional(),
  imageUrl: z.string().optional(),
  scale: z.number().optional(),
  rotation: z.number().optional(),
})

const createSketchSchema = z.object({
  total_squares: z.number().min(0).default(0),
  total_sqft: z.number().min(0).default(0),
  total_perimeter_lf: z.number().min(0).default(0),
  total_eave_lf: z.number().min(0).default(0),
  total_ridge_lf: z.number().min(0).default(0),
  total_valley_lf: z.number().min(0).default(0),
  total_hip_lf: z.number().min(0).default(0),
  total_rake_lf: z.number().min(0).default(0),
  skylight_count: z.number().int().min(0).default(0),
  chimney_count: z.number().int().min(0).default(0),
  pipe_boot_count: z.number().int().min(0).default(0),
  vent_count: z.number().int().min(0).default(0),
  total_drip_edge_lf: z.number().min(0).default(0),
  total_fascia_lf: z.number().min(0).default(0),
  gutter_lf: z.number().min(0).default(0),
  downspout_count: z.number().int().min(0).default(0),
  existing_layers: z.number().int().min(1).max(5).default(1),
  sketch_data: sketchDataSchema.optional(),
  measurement_source: z.enum(['manual', 'ai_photo', 'eagleview', 'gaf', 'satellite']).default('manual'),
  measurement_date: z.string().optional(),
})

const updateSketchSchema = createSketchSchema.partial()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const supabase = await createClient()

    const { data: sketch, error } = await supabase
      .from('roof_sketches')
      .select(`
        *,
        slopes:roof_slopes(*)
      `)
      .eq('lead_id', leadId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { sketch: null, message: 'No sketch found for this lead' },
          { status: 200 }
        )
      }
      logger.error('Error fetching sketch', { error: String(error) })
      return NextResponse.json(
        { error: 'Failed to fetch sketch' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sketch })
  } catch (error) {
    logger.error('Error in GET /api/leads/[leadId]/sketch', { error: String(error) })
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
    const { leadId } = await params
    const body = await request.json()
    const parsed = createSketchSchema.safeParse(body)

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

    // Check for existing sketch
    const { data: existing } = await supabase
      .from('roof_sketches')
      .select('id')
      .eq('lead_id', leadId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Sketch already exists for this lead. Use PATCH to update.' },
        { status: 409 }
      )
    }

    const { data: sketch, error } = await supabase
      .from('roof_sketches')
      .insert({
        lead_id: leadId,
        ...parsed.data,
        sketch_data: parsed.data.sketch_data || {},
      } as never)
      .select()
      .single()

    if (error) {
      logger.error('Error creating sketch', { error: String(error) })
      return NextResponse.json(
        { error: 'Failed to create sketch' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sketch }, { status: 201 })
  } catch (error) {
    logger.error('Error in POST /api/leads/[leadId]/sketch', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const body = await request.json()
    const parsed = updateSketchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: sketch, error } = await supabase
      .from('roof_sketches')
      .update(parsed.data as never)
      .eq('lead_id', leadId)
      .select(`
        *,
        slopes:roof_slopes(*)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sketch not found' },
          { status: 404 }
        )
      }
      logger.error('Error updating sketch', { error: String(error) })
      return NextResponse.json(
        { error: 'Failed to update sketch' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sketch })
  } catch (error) {
    logger.error('Error in PATCH /api/leads/[leadId]/sketch', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
