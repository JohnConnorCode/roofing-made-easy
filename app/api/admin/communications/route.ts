/**
 * Communications Log API
 * GET - List communication history
 * POST - Send a message manually
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { parsePagination } from '@/lib/api/auth'
import { sendEmail } from '@/lib/communication/send-email'
import { sendSMS } from '@/lib/communication/send-sms'
import { renderTemplate, getLeadVariables, getCompanyVariables } from '@/lib/communication/template-renderer'
import type { MessageChannel, MessageDirection, SendMessageRequest } from '@/lib/communication/types'
import { z } from 'zod'

const sendMessageSchema = z.object({
  channel: z.enum(['email', 'sms']),
  to: z.string().min(1),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(10000),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
})

// GET /api/admin/communications - List communication history
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('leads', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const channel = searchParams.get('channel') as MessageChannel | null
    const direction = searchParams.get('direction') as MessageDirection | null
    const leadId = searchParams.get('lead_id')
    const customerId = searchParams.get('customer_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const { limit, offset } = parsePagination(searchParams)

    let query = supabase
      .from('communication_logs')
      .select(`
        *,
        workflow:workflow_id(
          id,
          name
        ),
        template:template_id(
          id,
          name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (channel) {
      query = query.eq('channel', channel)
    }

    if (direction) {
      query = query.eq('direction', direction)
    }

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Error fetching communication logs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch communication logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      logs,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Communications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/communications - Send a message manually
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('leads', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const messageData = parsed.data as SendMessageRequest
    const supabase = await createClient()

    // Validate channel-specific requirements
    if (messageData.channel === 'email' && !messageData.subject) {
      return NextResponse.json(
        { error: 'Email messages require a subject' },
        { status: 400 }
      )
    }

    // Validate email format
    if (messageData.channel === 'email' && !isValidEmail(messageData.to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (messageData.channel === 'sms' && !isValidPhone(messageData.to)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Get variables for template rendering (if lead_id provided)
    let variables = await getCompanyVariables()
    if (messageData.lead_id) {
      variables = await getLeadVariables(messageData.lead_id)
    }

    // Render the message (escape values for HTML email context)
    const renderedBody = renderTemplate(messageData.body, variables, { escapeValues: true })
    const renderedSubject = messageData.subject
      ? renderTemplate(messageData.subject, variables)
      : undefined

    // Send the message
    let result
    if (messageData.channel === 'email') {
      result = await sendEmail({
        to: messageData.to,
        subject: renderedSubject!,
        body: renderedBody,
        leadId: messageData.lead_id,
        customerId: messageData.customer_id,
        templateId: messageData.template_id,
        sentBy: user.id,
      })
    } else {
      result = await sendSMS({
        to: messageData.to,
        body: renderedBody,
        leadId: messageData.lead_id,
        customerId: messageData.customer_id,
        templateId: messageData.template_id,
        sentBy: user.id,
      })
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      )
    }

    // Update template usage count + last_used_at
    if (messageData.template_id) {
      const { data: tpl } = await supabase
        .from('message_templates')
        .select('usage_count')
        .eq('id', messageData.template_id)
        .single()
      const currentCount = (tpl as { usage_count: number } | null)?.usage_count || 0
      await supabase
        .from('message_templates')
        .update({
          usage_count: currentCount + 1,
          last_used_at: new Date().toISOString(),
        } as never)
        .eq('id', messageData.template_id)
    }

    return NextResponse.json({
      success: true,
      externalId: result.externalId,
      status: result.status,
    })
  } catch (error) {
    console.error('Communications POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}
