/**
 * Individual Template API
 * GET - Get template by ID
 * PATCH - Update template
 * DELETE - Delete template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { previewTemplate } from '@/lib/communication/template-renderer'
import type { UpdateTemplateRequest, MessageTemplate } from '@/lib/communication/types'
import { extractAllVariables } from '@/lib/communication/utils'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  variables: z.array(z.string()).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ templateId: string }>
}

// GET /api/admin/templates/[templateId]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { templateId } = await params
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includePreview = searchParams.get('preview') === 'true'

    const { data: template, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Get workflows using this template
    const { data: workflows } = await supabase
      .from('automation_workflows')
      .select('id, name, trigger_event, is_active')
      .eq('template_id', templateId)

    // Generate preview if requested
    let preview = null
    if (includePreview) {
      preview = previewTemplate(template as MessageTemplate)
    }

    return NextResponse.json({
      template,
      workflows: workflows || [],
      preview,
    })
  } catch (error) {
    console.error('Template GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/templates/[templateId]
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { templateId } = await params
    const { error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError

    const body = await request.json()
    const parsed = updateTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parsed.data as UpdateTemplateRequest
    const supabase = await createClient()

    // Get current template
    const { data: currentTemplate } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (!currentTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // System templates: allow subject, body, is_active edits; block metadata changes
    if ((currentTemplate as MessageTemplate).is_system) {
      const blockedFields: (keyof typeof updates)[] = ['name', 'description', 'category', 'tags']
      const hasBlockedEdit = blockedFields.some(k => updates[k] !== undefined)
      if (hasBlockedEdit) {
        return NextResponse.json(
          { error: 'System template metadata (name, description, category, tags) cannot be modified' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const templateUpdate: Record<string, unknown> = {}
    if (updates.name !== undefined) templateUpdate.name = updates.name
    if (updates.description !== undefined) templateUpdate.description = updates.description
    if (updates.subject !== undefined) templateUpdate.subject = updates.subject
    if (updates.body !== undefined) templateUpdate.body = updates.body
    if (updates.variables !== undefined) templateUpdate.variables = updates.variables
    if (updates.category !== undefined) templateUpdate.category = updates.category
    if (updates.tags !== undefined) templateUpdate.tags = updates.tags
    if (updates.is_active !== undefined) templateUpdate.is_active = updates.is_active

    // Auto-extract variables if body or subject changed
    if (updates.body || updates.subject) {
      const finalBody = updates.body ?? (currentTemplate as MessageTemplate).body
      const finalSubject = updates.subject ?? (currentTemplate as MessageTemplate).subject
      templateUpdate.variables = extractAllVariables(finalBody, finalSubject)
    }

    const { error: updateError } = await supabase
      .from('message_templates')
      .update(templateUpdate as never)
      .eq('id', templateId)

    if (updateError) {
      console.error('Error updating template:', updateError)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    // Get updated template
    const { data: updatedTemplate } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error('Template PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/templates/[templateId]
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { templateId } = await params
    const { error: authError } = await requirePermission('settings', 'delete')
    if (authError) return authError

    const supabase = await createClient()

    // Check if template exists and is not a system template
    const { data: template } = await supabase
      .from('message_templates')
      .select('is_system, name')
      .eq('id', templateId)
      .single()

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if ((template as { is_system: boolean }).is_system) {
      return NextResponse.json(
        { error: 'System templates cannot be deleted' },
        { status: 400 }
      )
    }

    // Check if any workflows are using this template
    const { data: workflows, count } = await supabase
      .from('automation_workflows')
      .select('id', { count: 'exact' })
      .eq('template_id', templateId)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Template is used by ${count} workflow(s). Please update or delete those workflows first.` },
        { status: 400 }
      )
    }

    // Delete template
    const { error: deleteError } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', templateId)

    if (deleteError) {
      console.error('Error deleting template:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Template DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

