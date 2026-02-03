import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

interface PipelineStage {
  id: string
  name: string
  slug: string
  color: string
  position: number
  is_system: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = await createClient()

  const { data, error: fetchError } = await supabase
    .from('custom_pipeline_stages' as never)
    .select('*')
    .order('position', { ascending: true })

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch pipeline stages' },
      { status: 500 }
    )
  }

  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: Partial<PipelineStage>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  if (!body.name || !body.slug) {
    return NextResponse.json(
      { error: 'Name and slug are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Get max position for ordering
  const { data: maxPos } = await supabase
    .from('custom_pipeline_stages' as never)
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = ((maxPos as { position: number } | null)?.position ?? -1) + 1

  const { data, error: insertError } = await supabase
    .from('custom_pipeline_stages' as never)
    .insert({
      name: body.name,
      slug: body.slug,
      color: body.color || '#6B7280',
      position: body.position ?? nextPosition,
      is_system: false,
      is_visible: body.is_visible ?? true
    } as never)
    .select()
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'A stage with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create pipeline stage' },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: { stages: Array<{ id: string; position: number }> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  if (!Array.isArray(body.stages)) {
    return NextResponse.json(
      { error: 'stages array is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Update positions in bulk
  const updates = body.stages.map(({ id, position }) =>
    supabase
      .from('custom_pipeline_stages' as never)
      .update({ position, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
  )

  await Promise.all(updates)

  // Fetch updated stages
  const { data, error: fetchError } = await supabase
    .from('custom_pipeline_stages' as never)
    .select('*')
    .order('position', { ascending: true })

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to reorder pipeline stages' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
