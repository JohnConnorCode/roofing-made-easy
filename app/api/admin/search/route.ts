/**
 * Global Admin Search API
 * GET - Search across leads, jobs, invoices, customers
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'

interface SearchResult {
  type: 'lead' | 'job' | 'invoice' | 'customer'
  id: string
  title: string
  subtitle: string
  url: string
}

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabase = await createClient()
    const results: SearchResult[] = []
    const searchPattern = `%${q}%`

    // Search contacts (linked to leads)
    const { data: contacts } = await supabase
      .from('contacts')
      .select('lead_id, first_name, last_name, email, phone')
      .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
      .limit(limit)

    if (contacts) {
      for (const c of contacts) {
        const contact = c as { lead_id: string; first_name: string; last_name: string; email: string; phone: string }
        const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown'
        results.push({
          type: 'lead',
          id: contact.lead_id,
          title: name,
          subtitle: contact.email || contact.phone || 'No contact info',
          url: `/leads/${contact.lead_id}`,
        })
      }
    }

    // Search jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, job_number, property_address, property_city, status')
      .or(`job_number.ilike.${searchPattern},property_address.ilike.${searchPattern},property_city.ilike.${searchPattern}`)
      .limit(limit)

    if (jobs) {
      for (const j of jobs) {
        const job = j as { id: string; job_number: string; property_address: string; property_city: string; status: string }
        results.push({
          type: 'job',
          id: job.id,
          title: job.job_number,
          subtitle: job.property_address ? `${job.property_address}, ${job.property_city || ''}` : job.status,
          url: `/jobs/${job.id}`,
        })
      }
    }

    // Search invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, bill_to_name, total, status')
      .or(`invoice_number.ilike.${searchPattern},bill_to_name.ilike.${searchPattern}`)
      .limit(limit)

    if (invoices) {
      for (const inv of invoices) {
        const invoice = inv as { id: string; invoice_number: string; bill_to_name: string; total: number; status: string }
        results.push({
          type: 'invoice',
          id: invoice.id,
          title: invoice.invoice_number || 'Draft Invoice',
          subtitle: `${invoice.bill_to_name || 'Customer'} — $${invoice.total?.toLocaleString() || '0'}`,
          url: `/invoices/${invoice.id}`,
        })
      }
    }

    // Search customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone')
      .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
      .limit(limit)

    if (customers) {
      for (const c of customers) {
        const cust = c as { id: string; first_name: string; last_name: string; email: string; phone: string }
        const name = `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'Unknown'
        results.push({
          type: 'customer',
          id: cust.id,
          title: name,
          subtitle: cust.email || cust.phone || 'No contact info',
          url: `/customers/${cust.id}`,
        })
      }
    }

    // Trim total results
    return NextResponse.json({ results: results.slice(0, limit) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
