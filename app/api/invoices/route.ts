import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireAdminMutation, parsePagination } from '@/lib/api/auth'
import { ActivityLogger } from '@/lib/team/activity-logger'
import { createInvoice } from '@/lib/invoices/create'
import { moneySchema, quantitySchema, percentSchema, taxRateSchema } from '@/lib/validation/schemas'
import { z } from 'zod'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'
import { notifyAdmins } from '@/lib/notifications'
import { logger } from '@/lib/logger'

// Schema for creating an invoice
const createInvoiceSchema = z.object({
  leadId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  estimateId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  paymentType: z.enum(['deposit', 'progress', 'final', 'adjustment']).default('deposit'),
  dueDate: z.string().optional(),
  taxRate: taxRateSchema.default(0),
  discountPercent: percentSchema.default(0),
  notes: z.string().max(5000).optional(),
  terms: z.string().max(5000).optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: quantitySchema.default(1),
    unitPrice: moneySchema,
    isTaxable: z.boolean().default(true),
  })).min(1).max(200),
})

// GET - List invoices (admin only)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const leadId = searchParams.get('leadId')
    const customerId = searchParams.get('customerId')
    const jobId = searchParams.get('jobId')
    const { limit, offset } = parsePagination(searchParams)

    let query = supabase
      .from('invoices')
      .select(`
        *,
        leads:lead_id(
          id,
          contacts(first_name, last_name, email, phone),
          properties(street_address, city, state, zip_code)
        ),
        invoice_line_items(*),
        invoice_payments(*)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (leadId) {
      query = query.eq('lead_id', leadId)
    }
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }
    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data: invoices, error, count } = await query

    if (error) {
      logger.error('Error fetching invoices', { error: String(error) })
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { invoices, total: count },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    logger.error('Invoices fetch error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new invoice (admin only)
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdminMutation(request)
    if (authError) return authError

    const body = await request.json()
    const parsed = createInvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const result = await createInvoice(supabase, {
      leadId: parsed.data.leadId,
      customerId: parsed.data.customerId ?? null,
      estimateId: parsed.data.estimateId ?? null,
      jobId: parsed.data.jobId ?? null,
      paymentType: parsed.data.paymentType,
      dueDate: parsed.data.dueDate ?? null,
      taxRate: parsed.data.taxRate,
      discountPercent: parsed.data.discountPercent,
      notes: parsed.data.notes ?? null,
      terms: parsed.data.terms ?? null,
      createdBy: user!.id,
      lineItems: parsed.data.lineItems,
    })

    if (result.error === 'lead_not_found') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    if (!result.invoice || result.error) {
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    const invoice = result.invoice

    // Fetch line items for response (helper returns the summary row only).
    const { data: completeInvoice } = await supabase
      .from('invoices')
      .select('*, invoice_line_items(*)')
      .eq('id', invoice.id)
      .single()

    notifyAdmins(
      'invoice_created',
      `New Invoice: ${invoice.invoice_number}`,
      `$${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} for ${invoice.bill_to_name ?? 'Customer'}`,
      '/invoices'
    ).catch(err => logger.error('Failed to notify admins of invoice creation', { error: String(err) }))

    if (user) {
      ActivityLogger.invoiceCreated(user, invoice.id, invoice.invoice_number, invoice.total, parsed.data.leadId)
    }

    return NextResponse.json(
      { invoice: completeInvoice },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Invoice creation error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
