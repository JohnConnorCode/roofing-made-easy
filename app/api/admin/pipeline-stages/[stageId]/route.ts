import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ stageId: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin()
  if (error) return error

  const { stageId } = await params

  let body: { name?: string; color?: string; is_visible?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Build update object with only provided fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) updates.name = body.name
  if (body.color !== undefined) updates.color = body.color
  if (body.is_visible !== undefined) updates.is_visible = body.is_visible

  const { data, error: updateError } = await supabase
    .from('custom_pipeline_stages' as never)
    .update(updates as never)
    .eq('id', stageId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update pipeline stage' },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Pipeline stage not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin()
  if (error) return error

  const { stageId } = await params

  const supabase = await createClient()

  // Check if stage is a system stage (cannot delete)
  const { data: stage } = await supabase
    .from('custom_pipeline_stages' as never)
    .select('is_system')
    .eq('id', stageId)
    .single()

  if (!stage) {
    return NextResponse.json(
      { error: 'Pipeline stage not found' },
      { status: 404 }
    )
  }

  if ((stage as { is_system: boolean }).is_system) {
    return NextResponse.json(
      { error: 'Cannot delete system stages' },
      { status: 403 }
    )
  }

  const { error: deleteError } = await supabase
    .from('custom_pipeline_stages' as never)
    .delete()
    .eq('id', stageId)

  if (deleteError) {
    return NextResponse.json(
      { error: 'Failed to delete pipeline stage' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
