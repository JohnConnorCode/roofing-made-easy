import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  nickname: z.string().optional(),
  isPrimary: z.boolean().optional(),
})

// Type for customer record
interface CustomerRecord {
  id: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers' as never)
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData as CustomerRecord | null

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verify customer owns this lead link
    const { data: existingLink, error: linkError } = await supabase
      .from('customer_leads' as never)
      .select('*')
      .eq('id', linkId)
      .eq('customer_id', customer.id)
      .single()

    if (linkError || !existingLink) {
      return NextResponse.json(
        { error: 'Lead link not found or not authorized' },
        { status: 404 }
      )
    }

    // Validate request body
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { nickname, isPrimary } = parsed.data

    // Build update object
    const updates: Record<string, unknown> = {}
    if (nickname !== undefined) updates.nickname = nickname
    if (isPrimary !== undefined) updates.is_primary = isPrimary

    // If setting as primary, unset other primaries first
    if (isPrimary) {
      await supabase
        .from('customer_leads' as never)
        .update({ is_primary: false } as never)
        .eq('customer_id', customer.id)
        .neq('id', linkId)
    }

    const { data: link, error: updateError } = await supabase
      .from('customer_leads' as never)
      .update(updates as never)
      .eq('id', linkId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(link)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer record
    const { data: customerData2, error: customerError } = await supabase
      .from('customers' as never)
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData2 as CustomerRecord | null

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Delete the link
    const { error: deleteError } = await supabase
      .from('customer_leads' as never)
      .delete()
      .eq('id', linkId)
      .eq('customer_id', customer.id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
