/**
 * Customer-facing Estimate Content API
 * Returns active estimate content items grouped by type for display on quotes
 */

import { NextResponse } from 'next/server'
import { getGroupedEstimateContent } from '@/lib/communications/estimate-content-service'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const grouped = await getGroupedEstimateContent()

    // Return only active items with minimal data for display
    const items = [
      ...grouped.scope.filter(c => c.is_active).map(c => ({ title: c.title, type: c.content_type })),
      ...grouped.warranties.filter(c => c.is_active).map(c => ({ title: c.title, type: c.content_type })),
    ]

    return NextResponse.json({ items })
  } catch (error) {
    logger.error('Customer estimate content error', { error: String(error) })
    return NextResponse.json(
      { error: 'Failed to load estimate content', items: [] },
      { status: 500 }
    )
  }
}
