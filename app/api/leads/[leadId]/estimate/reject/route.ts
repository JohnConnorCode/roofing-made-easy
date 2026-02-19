import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireLeadOwnership } from '@/lib/api/auth'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { escapeHtml } from '@/lib/communication/template-renderer'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ leadId: string }>
}

// Schema for quote rejection
const rejectQuoteSchema = z.object({
  estimateId: z.string().uuid().optional(), // If not provided, rejects most recent
  reason: z.string().min(1, 'Please provide a reason for declining'),
  rejectedByName: z.string().min(1).optional(),
  rejectedByEmail: z.string().email().optional(),
})

// POST - Reject a quote
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { leadId } = await params

    // Require authenticated user who owns this lead (or admin)
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    const body = await request.json()
    const parsed = rejectQuoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Get the estimate to reject
    let estimateQuery = supabase
      .from('detailed_estimates')
      .select('*')
      .eq('lead_id', leadId)
      .not('status', 'in', '("accepted","rejected","expired")')

    if (parsed.data.estimateId) {
      estimateQuery = estimateQuery.eq('id', parsed.data.estimateId)
    } else {
      // Get most recent non-rejected estimate
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
          { error: 'No quote found to decline' },
          { status: 404 }
        )
      }

      // Reject basic estimate with concurrency guard
      const estimate = basicEstimates[0] as { id: string }
      const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

      const { data: updatedRows, error: updateError } = await supabase
        .from('estimates')
        .update({
          estimate_status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: parsed.data.reason,
          rejected_by_name: parsed.data.rejectedByName || null,
          rejected_by_email: parsed.data.rejectedByEmail || null,
        } as never)
        .eq('id', estimate.id)
        .not('estimate_status', 'in', '("accepted","rejected","expired")')
        .select('id')

      if (updateError) {
        logger.error('Error rejecting quote', { error: String(updateError) })
        return NextResponse.json(
          { error: 'Failed to decline quote' },
          { status: 500 }
        )
      }

      if (!updatedRows || updatedRows.length === 0) {
        return NextResponse.json(
          { error: 'This quote has already been responded to or is no longer available' },
          { status: 409 }
        )
      }

      // Log quote event
      await supabase.from('estimate_events').insert({
        estimate_id: estimate.id,
        event_type: 'rejected',
        event_data: { reason: parsed.data.reason },
        actor_type: 'customer',
        actor_name: parsed.data.rejectedByName || null,
        actor_email: parsed.data.rejectedByEmail || null,
        actor_ip: clientIP,
      } as never)

      // Update lead status
      await supabase
        .from('leads')
        .update({ status: 'lost' } as never)
        .eq('id', leadId)

      // Send notification to admin
      await sendAdminNotification(
        supabase,
        leadId,
        parsed.data.rejectedByName || 'Customer',
        parsed.data.reason
      )

      return NextResponse.json({
        success: true,
        message: 'Quote declined',
        estimateId: estimate.id,
      })
    }

    // Reject detailed estimate with concurrency guard
    const estimate = estimates[0] as { id: string }
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

    const { data: updatedDetailedRows, error: updateError } = await supabase
      .from('detailed_estimates')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: parsed.data.reason,
        rejected_by_name: parsed.data.rejectedByName || null,
        rejected_by_email: parsed.data.rejectedByEmail || null,
      } as never)
      .eq('id', estimate.id)
      .not('status', 'in', '("accepted","rejected","expired")')
      .select('id')

    if (updateError) {
      logger.error('Error rejecting quote', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to decline quote' },
        { status: 500 }
      )
    }

    if (!updatedDetailedRows || updatedDetailedRows.length === 0) {
      return NextResponse.json(
        { error: 'This quote has already been responded to or is no longer available' },
        { status: 409 }
      )
    }

    // Log quote event
    await supabase.from('estimate_events').insert({
      detailed_estimate_id: estimate.id,
      event_type: 'rejected',
      event_data: { reason: parsed.data.reason },
      actor_type: 'customer',
      actor_name: parsed.data.rejectedByName || null,
      actor_email: parsed.data.rejectedByEmail || null,
      actor_ip: clientIP,
    } as never)

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'lost' } as never)
      .eq('id', leadId)

    // Send notification to admin
    await sendAdminNotification(
      supabase,
      leadId,
      parsed.data.rejectedByName || 'Customer',
      parsed.data.reason
    )

    return NextResponse.json({
      success: true,
      message: 'Quote declined',
      estimateId: estimate.id,
    })
  } catch (error) {
    logger.error('Quote rejection error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper to send admin notification
async function sendAdminNotification(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  leadId: string,
  customerName: string,
  reason: string
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
      const leadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${leadId}`

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
              .content { padding: 30px; background: #f5f5f5; border-radius: 0 0 6px 6px; }
              .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .reason { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
              .button { display: inline-block; background: #c9a25c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Quote Declined</h1>
              </div>
              <div class="content">
                <p><strong>${escapeHtml(customerName)}</strong> has declined a quote.</p>
                <div class="details">
                  <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
                  <p><strong>Email:</strong> ${escapeHtml(contact?.email || 'Unknown')}</p>
                  <p><strong>Phone:</strong> ${escapeHtml(contact?.phone || 'Unknown')}</p>
                  <p><strong>Address:</strong> ${escapeHtml(address)}</p>
                </div>
                <div class="reason">
                  <p style="margin: 0;"><strong>Reason for declining:</strong></p>
                  <p style="margin: 10px 0 0 0;">${escapeHtml(reason)}</p>
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
        subject: `Quote Declined: ${customerName}`,
        html,
      })
    }
  } catch (error) {
    logger.error('Failed to send admin notification', { error: String(error) })
  }
}
