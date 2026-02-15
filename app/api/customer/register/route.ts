import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { notifyAdmins } from '@/lib/notifications'
import { sendWelcomeEmail } from '@/lib/email/notifications'
import { logCommunication } from '@/lib/communication/log-direct-send'
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
  source: z.string().max(50).optional(),
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
      source,
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
          ...(source ? { signup_source: source } : {}),
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
    let leadLinked = true
    if (leadId && !leadId.startsWith('demo-') && customer) {
      const { error: linkError } = await supabase
        .from('customer_leads' as never)
        .insert({
          customer_id: customer.id,
          lead_id: leadId,
          is_primary: true,
        } as never)

      if (linkError) {
        leadLinked = false
        console.error('Failed to link customer to lead:', {
          customerId: customer.id,
          leadId,
          error: linkError.message,
          code: linkError.code,
        })
      }
    }

    // Fire-and-forget notifications
    const custName = `${firstName || ''} ${lastName || ''}`.trim() || email
    sendWelcomeEmail({ email, firstName: firstName || undefined, leadId: leadId || undefined })
      .then(() => {
        logCommunication({
          channel: 'email', to: email, subject: 'Welcome',
          leadId: leadId || undefined, category: 'welcome',
        }).catch(() => {})
      })
      .catch(err => console.error('Failed to send welcome email:', err))
    notifyAdmins(
      'customer_registered',
      'New Customer Registered',
      `${custName} (${email})`,
      '/customers'
    ).catch(err => console.error('Failed to notify admins of registration:', err))

    return NextResponse.json({ customer, leadLinked }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
