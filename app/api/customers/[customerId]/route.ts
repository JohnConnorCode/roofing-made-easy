import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const updateCustomerSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Get customer with all related data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      throw customerError
    }

    // Get linked leads
    const { data: customerLeads } = await supabase
      .from('customer_leads' as never)
      .select(`
        id,
        is_primary,
        nickname,
        linked_at,
        lead:leads(
          id,
          status,
          source,
          created_at,
          contacts(first_name, last_name, email, phone),
          properties(street_address, city, state, zip_code),
          intakes(job_type, timeline_urgency, roof_size_sqft),
          estimates(price_likely, price_low, price_high)
        )
      `)
      .eq('customer_id', customerId)
      .order('linked_at', { ascending: false }) as { data: Array<{ id: string; is_primary: boolean; nickname: string; linked_at: string; lead: Record<string, unknown> }> | null }

    // Get financing applications
    const { data: financingApplications } = await supabase
      .from('financing_applications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Get insurance claims
    const { data: insuranceClaims } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      customer: {
        ...(customer as Record<string, unknown>),
        leads: customerLeads?.map(cl => ({
          ...(cl.lead as Record<string, unknown>),
          is_primary: cl.is_primary,
          nickname: cl.nickname,
          linked_at: cl.linked_at
        })) || [],
        financing_applications: financingApplications || [],
        insurance_claims: insuranceClaims || []
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const parsed = updateCustomerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ customer })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
