import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSlopeSchema = z.object({
  name: z.string().default('Main'),
  slope_number: z.number().int().min(1).default(1),
  squares: z.number().min(0).default(0),
  sqft: z.number().min(0).default(0),
  pitch: z.number().int().min(0).max(24).default(4),
  pitch_multiplier: z.number().min(1).max(2).default(1),
  eave_lf: z.number().min(0).default(0),
  ridge_lf: z.number().min(0).default(0),
  valley_lf: z.number().min(0).default(0),
  hip_lf: z.number().min(0).default(0),
  rake_lf: z.number().min(0).default(0),
  length_ft: z.number().min(0).nullable().optional(),
  width_ft: z.number().min(0).nullable().optional(),
  is_walkable: z.boolean().default(true),
  has_steep_charge: z.boolean().default(false),
  has_limited_access: z.boolean().default(false),
  notes: z.string().nullable().optional(),
})

const updateSlopeSchema = createSlopeSchema.partial().extend({
  id: z.string().uuid(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const supabase = await createClient()

    // Get sketch first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sketch } = await (supabase as any)
      .from('roof_sketches')
      .select('id')
      .eq('lead_id', leadId)
      .single()

    if (!sketch) {
      return NextResponse.json(
        { slopes: [], message: 'No sketch found for this lead' },
        { status: 200 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: slopes, error } = await (supabase as any)
      .from('roof_slopes')
      .select('*')
      .eq('sketch_id', (sketch as { id: string }).id)
      .order('slope_number', { ascending: true })

    if (error) {
      console.error('Error fetching slopes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch slopes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slopes })
  } catch (error) {
    console.error('Error in GET /api/leads/[leadId]/sketch/slopes:', error)
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
    const parsed = createSlopeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get or create sketch
    let { data: sketch } = await supabase
      .from('roof_sketches')
      .select('id')
      .eq('lead_id', leadId)
      .single()

    if (!sketch) {
      // Create sketch first
      const { data: newSketch, error: createError } = await supabase
        .from('roof_sketches')
        .insert({ lead_id: leadId } as never)
        .select()
        .single()

      if (createError) {
        console.error('Error creating sketch:', createError)
        return NextResponse.json(
          { error: 'Failed to create sketch' },
          { status: 500 }
        )
      }
      sketch = newSketch
    }

    // Calculate pitch multiplier if not provided
    const pitchMultipliers: Record<number, number> = {
      0: 1.00, 1: 1.003, 2: 1.014, 3: 1.031, 4: 1.054,
      5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.250,
      10: 1.302, 11: 1.357, 12: 1.414, 13: 1.474, 14: 1.537,
      15: 1.601, 16: 1.667, 17: 1.734, 18: 1.803,
    }
    const pitchMultiplier = parsed.data.pitch_multiplier !== 1
      ? parsed.data.pitch_multiplier
      : pitchMultipliers[Math.min(parsed.data.pitch, 18)] || 1

    // Determine steep charge
    const hassteepCharge = parsed.data.pitch >= 7

    if (!sketch) {
      return NextResponse.json(
        { error: 'Sketch not found' },
        { status: 404 }
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: slope, error } = await (supabase as any)
      .from('roof_slopes')
      .insert({
        sketch_id: (sketch as { id: string }).id,
        ...parsed.data,
        pitch_multiplier: pitchMultiplier,
        has_steep_charge: hassteepCharge,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Slope number already exists for this sketch' },
          { status: 409 }
        )
      }
      console.error('Error creating slope:', error)
      return NextResponse.json(
        { error: 'Failed to create slope' },
        { status: 500 }
      )
    }

    // The trigger will auto-recalculate sketch totals

    return NextResponse.json({ slope }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/leads/[leadId]/sketch/slopes:', error)
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
    const parsed = updateSlopeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updates } = parsed.data
    const supabase = await createClient()

    // Recalculate pitch multiplier if pitch changed
    if (updates.pitch !== undefined) {
      const pitchMultipliers: Record<number, number> = {
        0: 1.00, 1: 1.003, 2: 1.014, 3: 1.031, 4: 1.054,
        5: 1.083, 6: 1.118, 7: 1.158, 8: 1.202, 9: 1.250,
        10: 1.302, 11: 1.357, 12: 1.414, 13: 1.474, 14: 1.537,
        15: 1.601, 16: 1.667, 17: 1.734, 18: 1.803,
      }
      updates.pitch_multiplier = pitchMultipliers[Math.min(updates.pitch, 18)] || 1
      updates.has_steep_charge = updates.pitch >= 7
    }

    const { data: slope, error } = await supabase
      .from('roof_slopes')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Slope not found' },
          { status: 404 }
        )
      }
      console.error('Error updating slope:', error)
      return NextResponse.json(
        { error: 'Failed to update slope' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slope })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[leadId]/sketch/slopes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const slopeId = searchParams.get('id')

    if (!slopeId) {
      return NextResponse.json(
        { error: 'Slope ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('roof_slopes')
      .delete()
      .eq('id', slopeId)

    if (error) {
      console.error('Error deleting slope:', error)
      return NextResponse.json(
        { error: 'Failed to delete slope' },
        { status: 500 }
      )
    }

    // The trigger will auto-recalculate sketch totals

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/leads/[leadId]/sketch/slopes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
