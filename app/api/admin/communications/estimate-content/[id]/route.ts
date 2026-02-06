/**
 * Individual Estimate Content API
 * GET - Get content by ID
 * PUT - Update content
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/team/permissions'
import {
  getEstimateContentById,
  updateEstimateContent,
} from '@/lib/communications/estimate-content-service'
import { z } from 'zod'

const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/communications/estimate-content/[id]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const content = await getEstimateContentById(id)

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Estimate content GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/communications/estimate-content/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError

    const body = await request.json()
    const parsed = updateContentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parsed.data
    const updatedContent = await updateEstimateContent(id, {
      title: updates.title,
      content: updates.content,
      is_active: updates.is_active,
      display_order: updates.display_order,
    })

    if (!updatedContent) {
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content: updatedContent })
  } catch (error) {
    console.error('Estimate content PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
