/**
 * Reset Template to Default API
 * POST - Reset template to its default content
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { extractAllVariables } from '@/lib/communication/utils'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/communications/templates/[id]/reset
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError

    const supabase = await createClient()

    // Get current template with default values
    const { data: template, error: fetchError } = await supabase
      .from('message_templates')
      .select('id, default_body, default_subject')
      .eq('id', id)
      .single() as { data: { id: string; default_body: string | null; default_subject: string | null } | null; error: unknown }

    if (fetchError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (!template.default_body) {
      return NextResponse.json(
        { error: 'No default content available for this template' },
        { status: 400 }
      )
    }

    // Reset to defaults and re-extract variables
    const updateData: Record<string, unknown> = {
      body: template.default_body,
      variables: extractAllVariables(template.default_body, template.default_subject),
      updated_at: new Date().toISOString(),
    }

    if (template.default_subject) {
      updateData.subject = template.default_subject
    }

    const { data: updatedTemplate, error: updateError } = await supabase
      .from('message_templates')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.error('Error resetting template', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to reset template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      template: updatedTemplate,
      message: 'Template reset to default successfully',
    })
  } catch (error) {
    logger.error('Template reset error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
