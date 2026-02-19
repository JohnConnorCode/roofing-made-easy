import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, parsePagination } from '@/lib/api/auth'
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
  taxRate: z.number().min(0).max(1).default(0),
  discountPercent: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive().default(1),
    unitPrice: z.number().min(0),
    isTaxable: z.boolean().default(true),
  })).min(1),
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
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { user, error: authError } = await requireAdmin()
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

    // Get lead and contact info for bill_to fields
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        id,
        contacts(first_name, last_name, email, phone),
        properties(street_address, city, state, zip_code)
      `)
      .eq('id', parsed.data.leadId)
      .single()

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const contact = (lead as { contacts: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }> }).contacts?.[0]
    const property = (lead as { properties: Array<{ street_address?: string; city?: string; state?: string; zip_code?: string }> }).properties?.[0]

    // Calculate line item totals
    const lineItems = parsed.data.lineItems.map((item, index) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
      is_taxable: item.isTaxable,
      sort_order: index,
    }))

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
    const taxableAmount = lineItems
      .filter(item => item.is_taxable)
      .reduce((sum, item) => sum + item.total, 0)

    const discountAmount = subtotal * (parsed.data.discountPercent / 100)
    const taxAmount = (taxableAmount - (taxableAmount * parsed.data.discountPercent / 100)) * parsed.data.taxRate
    const total = subtotal - discountAmount + taxAmount

    // Create the invoice (invoice_number auto-generated via trigger)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        lead_id: parsed.data.leadId,
        customer_id: parsed.data.customerId || null,
        estimate_id: parsed.data.estimateId || null,
        job_id: parsed.data.jobId || null,
        payment_type: parsed.data.paymentType,
        due_date: parsed.data.dueDate || null,
        tax_rate: parsed.data.taxRate,
        discount_percent: parsed.data.discountPercent,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total,
        balance_due: total,
        notes: parsed.data.notes || null,
        terms: parsed.data.terms || null,
        bill_to_name: contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : null,
        bill_to_email: contact?.email || null,
        bill_to_phone: contact?.phone || null,
        bill_to_address: property
          ? `${property.street_address || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip_code || ''}`.trim()
          : null,
        created_by: user!.id,
      } as never)
      .select()
      .single()

    if (invoiceError || !invoice) {
      logger.error('Error creating invoice', { error: String(invoiceError) })
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    // Insert line items
    const invoiceId = (invoice as { id: string }).id
    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(
        lineItems.map(item => ({
          invoice_id: invoiceId,
          ...item,
        })) as never[]
      )

    if (lineItemsError) {
      logger.error('Error creating line items', { error: String(lineItemsError) })
      // Rollback invoice on line item failure
      await supabase.from('invoices').delete().eq('id', invoiceId)
      return NextResponse.json(
        { error: 'Failed to create invoice line items' },
        { status: 500 }
      )
    }

    // Fetch the complete invoice with line items
    const { data: completeInvoice } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single()

    // Fire-and-forget notification
    const inv = completeInvoice as { invoice_number?: string } | null
    const billName = contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : 'Customer'
    notifyAdmins(
      'invoice_created',
      `New Invoice: ${inv?.invoice_number || 'Draft'}`,
      `$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} for ${billName}`,
      '/invoices'
    ).catch(err => logger.error('Failed to notify admins of invoice creation', { error: String(err) }))

    return NextResponse.json(
      { invoice: completeInvoice },
      { status: 201, headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    logger.error('Invoice creation error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
