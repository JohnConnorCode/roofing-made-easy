import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

interface RouteParams {
  params: Promise<{ leadId: string }>
}

// Schema for quote acceptance
const acceptQuoteSchema = z.object({
  estimateId: z.string().uuid().optional(), // If not provided, accepts most recent
  signature: z.string().min(1, 'Signature is required'),
  acceptedByName: z.string().min(1, 'Name is required'),
  acceptedByEmail: z.string().email('Valid email is required'),
  termsVersion: z.string().default('1.0'),
})

// POST - Accept a quote
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { leadId } = await params
    const body = await request.json()
    const parsed = acceptQuoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the estimate to accept
    let estimateQuery = supabase
      .from('detailed_estimates')
      .select('*')
      .eq('lead_id', leadId)
      .not('status', 'in', '("accepted","rejected","expired")')

    if (parsed.data.estimateId) {
      estimateQuery = estimateQuery.eq('id', parsed.data.estimateId)
    } else {
      // Get most recent non-accepted estimate
      estimateQuery = estimateQuery.order('created_at', { ascending: false }).limit(1)
    }

    const { data: estimates, error: fetchError } = await estimateQuery

    if (fetchError || !estimates || estimates.length === 0) {
      // Try basic estimates table
      let basicQuery = supabase
        .from('estimates')
        .select('*')
        .eq('lead_id', leadId)
        .not('estimate_status', 'in', '("accepted","rejected","expired")')

      if (parsed.data.estimateId) {
        basicQuery = basicQuery.eq('id', parsed.data.estimateId)
      } else {
        basicQuery = basicQuery.order('created_at', { ascending: false }).limit(1)
      }

      const { data: basicEstimates, error: basicError } = await basicQuery

      if (basicError || !basicEstimates || basicEstimates.length === 0) {
        return NextResponse.json(
          { error: 'No quote found to accept' },
          { status: 404 }
        )
      }

      // Accept basic estimate
      const estimate = basicEstimates[0] as { id: string; price_likely: number }
      const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          estimate_status: 'accepted',
          accepted_at: new Date().toISOString(),
          acceptance_signature: parsed.data.signature,
          accepted_by_name: parsed.data.acceptedByName,
          accepted_by_email: parsed.data.acceptedByEmail,
          accepted_by_ip: clientIP,
        } as never)
        .eq('id', estimate.id)

      if (updateError) {
        console.error('Error accepting quote:', updateError)
        return NextResponse.json(
          { error: 'Failed to accept quote' },
          { status: 500 }
        )
      }

      // Log quote event
      await supabase.from('estimate_events').insert({
        estimate_id: estimate.id,
        event_type: 'accepted',
        event_data: {
          signature: parsed.data.signature,
          terms_version: parsed.data.termsVersion,
        },
        actor_type: 'customer',
        actor_name: parsed.data.acceptedByName,
        actor_email: parsed.data.acceptedByEmail,
        actor_ip: clientIP,
      } as never)

      // Update lead status
      await supabase
        .from('leads')
        .update({ status: 'won' } as never)
        .eq('id', leadId)

      // Send notification to admin
      await sendAdminNotification(supabase, leadId, parsed.data.acceptedByName, estimate.price_likely)

      return NextResponse.json({
        success: true,
        message: 'Quote accepted successfully',
        estimateId: estimate.id,
      })
    }

    // Accept detailed estimate
    const estimate = estimates[0] as {
      id: string
      price_likely: number
      adjusted_price_likely?: number
    }
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

    const { error: updateError } = await supabase
      .from('detailed_estimates')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        acceptance_signature: parsed.data.signature,
        accepted_by_name: parsed.data.acceptedByName,
        accepted_by_email: parsed.data.acceptedByEmail,
        accepted_by_ip: clientIP,
        accepted_terms_version: parsed.data.termsVersion,
      } as never)
      .eq('id', estimate.id)

    if (updateError) {
      console.error('Error accepting quote:', updateError)
      return NextResponse.json(
        { error: 'Failed to accept quote' },
        { status: 500 }
      )
    }

    // Log quote event
    await supabase.from('estimate_events').insert({
      detailed_estimate_id: estimate.id,
      event_type: 'accepted',
      event_data: {
        signature: parsed.data.signature,
        terms_version: parsed.data.termsVersion,
      },
      actor_type: 'customer',
      actor_name: parsed.data.acceptedByName,
      actor_email: parsed.data.acceptedByEmail,
      actor_ip: clientIP,
    } as never)

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'won' } as never)
      .eq('id', leadId)

    // Send notification to admin
    const quotePrice = estimate.adjusted_price_likely || estimate.price_likely
    await sendAdminNotification(supabase, leadId, parsed.data.acceptedByName, quotePrice)

    return NextResponse.json({
      success: true,
      message: 'Quote accepted successfully',
      estimateId: estimate.id,
    })
  } catch (error) {
    console.error('Quote acceptance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper to send admin notification
async function sendAdminNotification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  leadId: string,
  customerName: string,
  quotePrice: number
) {
  try {
    // Get lead info
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        id,
        contacts(first_name, last_name, email, phone),
        properties(street_address, city, state)
      `)
      .eq('id', leadId)
      .single()

    if (!lead) return

    const leadData = lead as {
      id: string
      contacts: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }>
      properties: Array<{ street_address?: string; city?: string; state?: string }>
    }

    const contact = leadData.contacts?.[0]
    const property = leadData.properties?.[0]
    const address = property
      ? `${property.street_address || ''}, ${property.city || ''}, ${property.state || ''}`
      : 'Unknown address'

    // Get admin email from settings
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notification_email')
      .single()

    const adminEmail = (settings as { value: string } | null)?.value || process.env.ADMIN_EMAIL

    if (adminEmail) {
      const quoteAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quotePrice)
      const leadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${leadId}`

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
              .content { padding: 30px; background: #f5f5f5; border-radius: 0 0 6px 6px; }
              .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .button { display: inline-block; background: #c9a25c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Quote Accepted!</h1>
              </div>
              <div class="content">
                <p><strong>${customerName}</strong> has accepted a quote.</p>
                <div class="details">
                  <p><strong>Customer:</strong> ${customerName}</p>
                  <p><strong>Email:</strong> ${contact?.email || 'Unknown'}</p>
                  <p><strong>Phone:</strong> ${contact?.phone || 'Unknown'}</p>
                  <p><strong>Address:</strong> ${address}</p>
                  <p><strong>Quote Amount:</strong> ${quoteAmount}</p>
                </div>
                <p style="text-align: center;">
                  <a href="${leadUrl}" class="button">View Lead Details</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      await sendEmail({
        to: adminEmail,
        subject: `🎉 Quote Accepted: ${customerName}`,
        html,
      })
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}
