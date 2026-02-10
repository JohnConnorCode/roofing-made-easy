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

  // Get aggregate stats using a single RPC call instead of 5 separate queries
  const { data: statusCounts } = await supabase.rpc('get_estimate_status_counts')

  const counts = (statusCounts as { total: number; draft: number; sent: number; accepted: number; expired: number; total_value: number } | null) || {
    total: 0, draft: 0, sent: 0, accepted: 0, expired: 0, total_value: 0
  }

  const aggregates = {
    total: counts.total,
    totalValue: counts.total_value,
    byStatus: {
      draft: counts.draft,
      sent: counts.sent,
      accepted: counts.accepted,
      expired: counts.expired,
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
