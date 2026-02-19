import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, parsePagination } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const { limit, offset } = parsePagination(searchParams)

    // Get customers with their lead counts
    let query = supabase
      .from('customers')
      .select(`
        *,
        customer_leads(
          id,
          lead:leads(
            id,
            status,
            created_at,
            contacts(first_name, last_name),
            estimates(price_likely)
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter - sanitize input to prevent injection
    if (search) {
      // Remove SQL wildcards and special characters from search input
      const sanitizedSearch = search.replace(/[%_'"\\]/g, '').trim()
      if (sanitizedSearch.length > 0) {
        query = query.or(`email.ilike.%${sanitizedSearch}%,first_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%,phone.ilike.%${sanitizedSearch}%`)
      }
    }

    const { data: customers, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    // Transform data to include computed fields
    const transformedCustomers = (customers as Record<string, unknown>[] | null)?.map(customer => {
      const customerLeads = (customer.customer_leads as Array<{ lead: Record<string, unknown> }>) || []
      const leads = customerLeads.map(cl => cl.lead).filter(Boolean)

      const totalValue = leads.reduce((sum, lead) => {
        const estimates = lead.estimates as { price_likely: number }[] | null
        return sum + (estimates?.[0]?.price_likely || 0)
      }, 0)

      const wonLeads = leads.filter(lead => lead.status === 'won').length
      const activeLeads = leads.filter(lead => !['won', 'lost', 'archived'].includes(lead.status as string)).length

      return {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        role: customer.role,
        email_verified: customer.email_verified,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
        leads_count: leads.length,
        active_leads: activeLeads,
        won_leads: wonLeads,
        total_value: totalValue
      }
    }) || []

    // Compute global aggregate stats (not limited to current page)
    const { data: allCustomers } = await supabase
      .from('customers')
      .select(`
        customer_leads(
          lead:leads(
            status,
            estimates(price_likely)
          )
        )
      `)

    let globalTotalLeads = 0
    let globalTotalValue = 0
    let globalWonDeals = 0

    if (allCustomers) {
      for (const c of allCustomers as Array<{ customer_leads: Array<{ lead: { status: string; estimates: { price_likely: number }[] | null } }> }>) {
        const leads = (c.customer_leads || []).map(cl => cl.lead).filter(Boolean)
        globalTotalLeads += leads.length
        for (const lead of leads) {
          globalTotalValue += lead.estimates?.[0]?.price_likely || 0
          if (lead.status === 'won') globalWonDeals++
        }
      }
    }

    return NextResponse.json({
      customers: transformedCustomers,
      total: count || 0,
      globalStats: {
        totalLeads: globalTotalLeads,
        totalValue: globalTotalValue,
        wonDeals: globalWonDeals,
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
