/**
 * Shared invoice creation — used by the admin API and by auto-create flows
 * (e.g. deposit invoices from estimate acceptance). The HTTP route wraps this
 * with auth, validation, and notifications; non-HTTP callers (like auto-job)
 * use it directly.
 *
 * Server-side totals — never trust a client-supplied `total`. Every sum
 * rounds to cents so downstream DB triggers and UI displays match.
 */

import { computeLineItemTotal } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface CreateInvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  isTaxable?: boolean
}

export interface CreateInvoiceInput {
  leadId: string
  customerId?: string | null
  estimateId?: string | null
  jobId?: string | null
  paymentType?: 'deposit' | 'progress' | 'final' | 'adjustment'
  dueDate?: string | null
  taxRate?: number
  discountPercent?: number
  notes?: string | null
  terms?: string | null
  status?: 'draft' | 'sent'
  createdBy?: string | null
  lineItems: CreateInvoiceLineItem[]
}

export interface CreateInvoiceResult {
  invoice: {
    id: string
    invoice_number: string
    total: number
    balance_due: number
    status: string
    bill_to_name: string | null
    bill_to_email: string | null
  } | null
  error?: string
}

export async function createInvoice(
  supabase: SupabaseClient,
  input: CreateInvoiceInput
): Promise<CreateInvoiceResult> {
  const round = (n: number) => Math.round(n * 100) / 100
  const taxRate = input.taxRate ?? 0
  const discountPercent = input.discountPercent ?? 0
  const paymentType = input.paymentType ?? 'deposit'

  // Fetch lead + contact + property for bill_to fields.
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      id,
      contacts(first_name, last_name, email, phone),
      properties(street_address, city, state, zip_code)
    `)
    .eq('id', input.leadId)
    .single()

  if (!lead) {
    return { invoice: null, error: 'lead_not_found' }
  }

  const leadRow = lead as {
    contacts?: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }>
      | { first_name?: string; last_name?: string; email?: string; phone?: string }
    properties?: Array<{ street_address?: string; city?: string; state?: string; zip_code?: string }>
      | { street_address?: string; city?: string; state?: string; zip_code?: string }
  }
  const contact = Array.isArray(leadRow.contacts) ? leadRow.contacts[0] : leadRow.contacts
  const property = Array.isArray(leadRow.properties) ? leadRow.properties[0] : leadRow.properties

  // Compute line items + invoice totals, server-side.
  const lineItems = input.lineItems.map((item, index) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: computeLineItemTotal(item.quantity, item.unitPrice),
    is_taxable: item.isTaxable ?? true,
    sort_order: index,
  }))

  const subtotal = round(lineItems.reduce((s, i) => s + i.total, 0))
  const taxableAmount = round(
    lineItems.filter(i => i.is_taxable).reduce((s, i) => s + i.total, 0)
  )
  const discountAmount = round(subtotal * (discountPercent / 100))
  const taxableAfterDiscount = round(taxableAmount - (taxableAmount * discountPercent / 100))
  const taxAmount = round(taxableAfterDiscount * taxRate)
  const total = round(subtotal - discountAmount + taxAmount)

  const sentAt = input.status === 'sent' ? new Date().toISOString() : null

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      lead_id: input.leadId,
      customer_id: input.customerId ?? null,
      estimate_id: input.estimateId ?? null,
      job_id: input.jobId ?? null,
      payment_type: paymentType,
      due_date: input.dueDate ?? null,
      tax_rate: taxRate,
      discount_percent: discountPercent,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
      balance_due: total,
      status: input.status ?? 'draft',
      sent_at: sentAt,
      notes: input.notes ?? null,
      terms: input.terms ?? null,
      bill_to_name: contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : null,
      bill_to_email: contact?.email || null,
      bill_to_phone: contact?.phone || null,
      bill_to_address: property
        ? `${property.street_address || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip_code || ''}`.trim()
        : null,
      created_by: input.createdBy ?? null,
    } as never)
    .select('id, invoice_number, total, balance_due, status, bill_to_name, bill_to_email')
    .single()

  if (invoiceError || !invoice) {
    logger.error('[createInvoice] insert failed', { error: String(invoiceError) })
    return { invoice: null, error: 'insert_failed' }
  }

  const invoiceRow = invoice as {
    id: string
    invoice_number: string
    total: number
    balance_due: number
    status: string
    bill_to_name: string | null
    bill_to_email: string | null
  }

  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(
      lineItems.map(item => ({
        invoice_id: invoiceRow.id,
        ...item,
      })) as never[]
    )

  if (lineItemsError) {
    logger.error('[createInvoice] line items insert failed, rolling back', {
      invoiceId: invoiceRow.id,
      error: String(lineItemsError),
    })
    await supabase.from('invoices').delete().eq('id', invoiceRow.id)
    return { invoice: null, error: 'line_items_failed' }
  }

  return { invoice: invoiceRow }
}
