import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

interface AdminPreferences {
  id: string
  user_id: string
  pipeline_columns: string[]
  pipeline_card_fields: string[]
  dashboard_widgets: string[]
  created_at: string
  updated_at: string
}

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error) return error

  const supabase = await createClient()

  const { data, error: fetchError } = await supabase
    .from('admin_preferences' as never)
    .select('*')
    .eq('user_id', user!.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }

  // Return defaults if no preferences exist
  if (!data) {
    return NextResponse.json({
      pipeline_columns: [],
      pipeline_card_fields: ['name', 'estimate', 'location', 'job_type', 'urgency'],
      dashboard_widgets: []
    })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireAdmin()
  if (error) return error

  let body: Partial<AdminPreferences>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Upsert preferences
  const { data, error: upsertError } = await supabase
    .from('admin_preferences' as never)
    .upsert(
      {
        user_id: user!.id,
        pipeline_columns: body.pipeline_columns,
        pipeline_card_fields: body.pipeline_card_fields,
        dashboard_widgets: body.dashboard_widgets,
        updated_at: new Date().toISOString()
      } as never,
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (upsertError) {
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
