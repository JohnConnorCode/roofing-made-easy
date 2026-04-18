/**
 * Auto-create a job when a customer accepts an estimate.
 *
 * Contract:
 *   - Runs after the estimate has been marked accepted and the lead is 'won'.
 *   - Skips if a job already exists for this lead (admin may have pre-created it).
 *   - Creates a job in status `pending_deposit` with `deposit_required = true`.
 *   - The payments webhook flips it to `pending_start` once the deposit lands.
 *
 * This is deliberately fire-and-forget from the caller's perspective — the
 * estimate acceptance must not fail if job creation hiccups. Errors are
 * logged and an admin notification is still sent so the gap is visible.
 */

import { logger } from '@/lib/logger'
import { createInvoice } from '@/lib/invoices/create'
import { sendInvoiceEmail } from '@/lib/invoices/send'
import type { SupabaseClient } from '@supabase/supabase-js'

// Percent of contract collected up-front. Industry standard for roofing is
// 30–50%. Most contractors configure this per-job; we default to 50% and
// let admin override on the job record before sending the deposit invoice.
const DEFAULT_DEPOSIT_PERCENT = 0.5

// How many days the customer has to pay the deposit before the invoice shows
// as past due. 7 days keeps urgency up without feeling pushy.
const DEPOSIT_DUE_DAYS = 7

export interface AutoCreateJobInput {
  leadId: string
  estimateId: string | null
  contractAmount: number
}

export interface AutoCreateJobResult {
  created: boolean
  jobId?: string
  reason?: string
}

export async function autoCreateJobFromAcceptance(
  supabase: SupabaseClient,
  input: AutoCreateJobInput
): Promise<AutoCreateJobResult> {
  try {
    // Skip if a job already exists for this lead. Admin-created jobs win.
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('lead_id', input.leadId)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return { created: false, reason: 'job_already_exists' }
    }

    // Pull the lead's customer_id so the customer portal can read this job.
    const { data: lead } = await supabase
      .from('leads')
      .select('id, customer_id, properties(street_address, city, state, zip_code)')
      .eq('id', input.leadId)
      .maybeSingle()

    if (!lead) {
      return { created: false, reason: 'lead_not_found' }
    }

    const leadRecord = lead as {
      id: string
      customer_id: string | null
      properties?: Array<{ street_address?: string; city?: string; state?: string; zip_code?: string }>
        | { street_address?: string; city?: string; state?: string; zip_code?: string }
        | null
    }

    const property = Array.isArray(leadRecord.properties)
      ? leadRecord.properties[0]
      : leadRecord.properties

    const depositAmount = Math.round(input.contractAmount * DEFAULT_DEPOSIT_PERCENT * 100) / 100

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        lead_id: input.leadId,
        customer_id: leadRecord.customer_id,
        estimate_id: input.estimateId,
        status: 'pending_deposit',
        contract_amount: input.contractAmount,
        deposit_required: true,
        deposit_amount: depositAmount,
        property_address: property?.street_address ?? null,
        property_city: property?.city ?? null,
        property_state: property?.state ?? null,
        property_zip: property?.zip_code ?? null,
      } as never)
      .select('id')
      .single()

    if (error || !job) {
      logger.error('[auto-create-job] Failed to insert job', {
        leadId: input.leadId,
        error: String(error),
      })
      return { created: false, reason: 'insert_failed' }
    }

    const jobRow = job as { id: string }
    logger.info('[auto-create-job] Created pending_deposit job', {
      leadId: input.leadId,
      jobId: jobRow.id,
      contractAmount: input.contractAmount,
      depositAmount,
    })

    // Auto-create + send the deposit invoice so the customer can pay without
    // waiting for an admin to do it manually. If either step fails we still
    // return success on the job — admin will see the job exists without an
    // invoice and can create one manually.
    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + DEPOSIT_DUE_DAYS)

      const invoiceResult = await createInvoice(supabase, {
        leadId: input.leadId,
        customerId: leadRecord.customer_id,
        estimateId: input.estimateId,
        jobId: jobRow.id,
        paymentType: 'deposit',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'sent',
        lineItems: [
          {
            description: `Project deposit (${Math.round(DEFAULT_DEPOSIT_PERCENT * 100)}% of contract)`,
            quantity: 1,
            unitPrice: depositAmount,
            isTaxable: false,
          },
        ],
      })

      if (invoiceResult.invoice) {
        logger.info('[auto-create-job] Deposit invoice created', {
          jobId: jobRow.id,
          invoiceId: invoiceResult.invoice.id,
          invoiceNumber: invoiceResult.invoice.invoice_number,
        })

        // Fire-and-forget the customer email. Logged on failure; not awaited
        // because job creation must succeed even if email infra is down.
        sendInvoiceEmail(supabase, invoiceResult.invoice.id).catch((err) => {
          logger.error('[auto-create-job] Deposit invoice email failed', {
            invoiceId: invoiceResult.invoice?.id,
            error: err instanceof Error ? err.message : 'Unknown',
          })
        })
      } else {
        logger.error('[auto-create-job] Failed to create deposit invoice', {
          jobId: jobRow.id,
          reason: invoiceResult.error,
        })
      }
    } catch (invoiceErr) {
      logger.error('[auto-create-job] Deposit invoice flow threw', {
        jobId: jobRow.id,
        error: invoiceErr instanceof Error ? invoiceErr.message : 'Unknown',
      })
    }

    return { created: true, jobId: jobRow.id }
  } catch (err) {
    logger.error('[auto-create-job] Unexpected error', {
      leadId: input.leadId,
      error: err instanceof Error ? err.message : 'Unknown',
    })
    return { created: false, reason: 'unexpected_error' }
  }
}
