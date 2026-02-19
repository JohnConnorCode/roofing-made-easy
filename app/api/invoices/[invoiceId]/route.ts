import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'
import { logger } from '@/lib/logger'

// Schema for updating an invoice
const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded']).optional(),
  paymentType: z.enum(['deposit', 'progress', 'final', 'adjustment']).optional(),
  dueDate: z.string().nullable().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  notes: z.string().nullable().optional(),
  internalNotes: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  billToName: z.string().nullable().optional(),
  billToEmail: z.string().email().nullable().optional(),
  billToPhone: z.string().nullable().optional(),
  billToAddress: z.string().nullable().optional(),
})

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// GET - Get a single invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { invoiceId } = await params
    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        leads:lead_id(
          id,
          status,
          contacts(first_name, last_name, email, phone),
          properties(street_address, city, state, zip_code)
        ),
        customers:customer_id(id, first_name, last_name, email, phone),
        detailed_estimates:estimate_id(id, name, price_likely),
        invoice_line_items(*),
        invoice_payments(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    logger.error('Invoice fetch error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update an invoice
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { invoiceId } = await params
    const body = await request.json()
    const parsed = updateInvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check invoice exists and get current status
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status
      // Set paid_at if marking as paid
      if (parsed.data.status === 'paid') {
        updateData.paid_at = new Date().toISOString()
      }
    }
    if (parsed.data.paymentType !== undefined) updateData.payment_type = parsed.data.paymentType
    if (parsed.data.dueDate !== undefined) updateData.due_date = parsed.data.dueDate
    if (parsed.data.taxRate !== undefined) updateData.tax_rate = parsed.data.taxRate
    if (parsed.data.discountPercent !== undefined) updateData.discount_percent = parsed.data.discountPercent
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes
    if (parsed.data.internalNotes !== undefined) updateData.internal_notes = parsed.data.internalNotes
    if (parsed.data.terms !== undefined) updateData.terms = parsed.data.terms
    if (parsed.data.billToName !== undefined) updateData.bill_to_name = parsed.data.billToName
    if (parsed.data.billToEmail !== undefined) updateData.bill_to_email = parsed.data.billToEmail
    if (parsed.data.billToPhone !== undefined) updateData.bill_to_phone = parsed.data.billToPhone
    if (parsed.data.billToAddress !== undefined) updateData.bill_to_address = parsed.data.billToAddress

    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData as never)
      .eq('id', invoiceId)
      .select(`
        *,
        invoice_line_items(*),
        invoice_payments(*)
      `)
      .single()

    if (updateError || !invoice) {
      logger.error('Error updating invoice', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    logger.error('Invoice update error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an invoice (only drafts can be deleted)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { invoiceId } = await params
    const supabase = await createClient()

    // Check invoice exists and is a draft
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoiceData = invoice as { status: string }
    if (invoiceData.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)

    if (deleteError) {
      logger.error('Error deleting invoice', { error: String(deleteError) })
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Invoice delete error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
