import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const estimateFiltersSchema = z.object({
  status: z.enum(['draft', 'sent', 'accepted', 'expired']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  leadId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['created_at', 'price_likely', 'valid_until']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)

  // Parse and validate filters with Zod
  const rawFilters: Record<string, string | undefined> = {}
  for (const key of ['status', 'dateFrom', 'dateTo', 'priceMin', 'priceMax', 'leadId', 'search', 'sortBy', 'sortOrder', 'page', 'limit']) {
    const value = searchParams.get(key)
    if (value !== null) {
      rawFilters[key] = value
    }
  }

  const parseResult = estimateFiltersSchema.safeParse(rawFilters)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const filters = parseResult.data
  const supabase = await createClient()

  // Build query with count option in the first .select() call
  // This avoids the bug where a second .select() would overwrite the joins
  let query = supabase
    .from('estimates' as never)
    .select(`
      *,
      lead:leads!inner(
        id,
        status,
        created_at,
        contact:contacts(first_name, last_name, email, phone),
        property:properties(street_address, city, state, zip_code),
        intake:intakes(job_type, timeline_urgency, has_insurance_claim)
      )
    `, { count: 'exact' })

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  if (filters.priceMin !== undefined) {
    query = query.gte('price_likely', filters.priceMin)
  }

  if (filters.priceMax !== undefined) {
    query = query.lte('price_likely', filters.priceMax)
  }

  if (filters.leadId) {
    query = query.eq('lead_id', filters.leadId)
  }

  // Pagination
  const page = filters.page
  const limit = filters.limit
  const offset = (page - 1) * limit

  // Apply sorting
  const ascending = filters.sortOrder === 'asc'
  query = query.order(filters.sortBy, { ascending })

  // Execute with pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error: fetchError, count } = await query as {
    data: unknown[] | null
    error: { message: string } | null
    count: number | null
  }

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch estimates' },
      { status: 500 }
    )
  }

  // Get aggregate stats using parallel count queries with head: true
  // This is more efficient than fetching all estimates to count in JS
  const [totalRes, draftRes, sentRes, acceptedRes, expiredRes] = await Promise.all([
    supabase.from('estimates' as never).select('*', { count: 'exact', head: true }),
    supabase.from('estimates' as never).select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('estimates' as never).select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('estimates' as never).select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('estimates' as never).select('*', { count: 'exact', head: true }).eq('status', 'expired'),
  ])

  const aggregates = {
    total: totalRes.count || 0,
    totalValue: 0, // Computing sum would require an RPC function for efficiency
    byStatus: {
      draft: draftRes.count || 0,
      sent: sentRes.count || 0,
      accepted: acceptedRes.count || 0,
      expired: expiredRes.count || 0
    }
  }

  return NextResponse.json({
    estimates: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    },
    aggregates
  })
}
