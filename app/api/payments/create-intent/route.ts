import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent, isStripeConfigured } from '@/lib/stripe'
import { z } from 'zod'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/api/auth'

// Validation schema
const createIntentSchema = z.object({
  leadId: z.string().uuid(),
  estimateId: z.string().uuid().optional(),
  amount: z.number().positive().min(100), // minimum $1.00 (100 cents)
  description: z.string().max(500).optional(),
})

// Type for lead with contacts relation
interface LeadWithContacts {
  id: string
  contacts: Array<{ email: string; first_name?: string; last_name?: string }> | { email: string; first_name?: string; last_name?: string } | null
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication - only authenticated users can create payment intents
    const { error: authError } = await requireAuth()
    if (authError) return authError

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment service not available' },
        { status: 503 }
      )
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Parse and validate request
    const body = await request.json()
    const validation = createIntentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { leadId, estimateId, amount, description } = validation.data

    // Fetch lead and contact info
    const supabase = await createClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        id,
        contacts (
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const leadData = lead as LeadWithContacts
    const contact = Array.isArray(leadData.contacts) ? leadData.contacts[0] : leadData.contacts
    if (!contact?.email) {
      return NextResponse.json(
        { error: 'Lead has no contact email' },
        { status: 400 }
      )
    }

    const customerName = contact.first_name
      ? contact.last_name
        ? `${contact.first_name} ${contact.last_name}`
        : contact.first_name
      : undefined

    // Create payment intent
    const result = await createPaymentIntent({
      amount,
      leadId,
      estimateId,
      customerEmail: contact.email,
      customerName,
      description: description || 'Roofing project deposit',
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Save pending payment record
    await supabase.from('payments').insert({
      lead_id: leadId,
      estimate_id: estimateId || null,
      stripe_payment_intent_id: result.paymentIntentId,
      amount: amount / 100, // convert cents to dollars
      currency: 'USD',
      status: 'pending',
      type: 'deposit',
      payer_email: contact.email,
      payer_name: customerName,
    } as never)

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
