import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema for customer registration
const registerSchema = z.object({
  authUserId: z.string().uuid('Invalid auth user ID'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  consentMarketing: z.boolean().optional(),
  leadId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'auth')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const {
      authUserId,
      email,
      firstName,
      lastName,
      phone,
      consentMarketing,
      leadId,
    } = validation.data

    // Security: Verify the authUserId matches the authenticated user
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()

    if (!user || user.id !== authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createAdminClient()

    // Type for customer record
    interface CustomerRecord {
      id: string
      auth_user_id: string
      email: string
      first_name: string | null
      last_name: string | null
      phone: string | null
    }

    // Create customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers' as never)
      .insert({
        auth_user_id: authUserId,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        notification_preferences: {
          email: consentMarketing ?? true,
          sms: false,
        },
      } as never)
      .select()
      .single()

    const customer = customerData as CustomerRecord | null

    if (customerError) {
      return NextResponse.json(
        { error: 'Failed to create customer record' },
        { status: 500 }
      )
    }

    // If leadId provided, link the lead to this customer
    if (leadId && !leadId.startsWith('demo-') && customer) {
      const { error: linkError } = await supabase
        .from('customer_leads' as never)
        .insert({
          customer_id: customer.id,
          lead_id: leadId,
          is_primary: true,
        } as never)

      if (linkError) {
        // Don't fail the registration - lead link will be retried later
      }
    }

    return NextResponse.json({ customer }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
