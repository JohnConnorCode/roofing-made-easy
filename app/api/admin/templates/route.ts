/**
 * Message Templates API
 * GET - List templates
 * POST - Create template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import type { MessageChannel, CreateTemplateRequest } from '@/lib/communication/types'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['email', 'sms']),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(10000),
  variables: z.array(z.string()).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/admin/templates - List templates
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type') as MessageChannel | null
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const includeInactive = searchParams.get('include_inactive') === 'true'

    let query = supabase
      .from('message_templates')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: templates, error, count } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // Get unique categories
    const { data: categories } = await supabase
      .from('message_templates')
      .select('category')
      .not('category', 'is', null)

    const categoryList = categories as { category: string }[] | null
    const uniqueCategories = [...new Set((categoryList || []).map(c => c.category))].filter(Boolean)

    return NextResponse.json({
      templates,
      total: count,
      categories: uniqueCategories,
    })
  } catch (error) {
    console.error('Templates GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/templates - Create template
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const templateData = parsed.data as CreateTemplateRequest
    const supabase = await createClient()

    // Validate: SMS templates shouldn't have subject
    if (templateData.type === 'sms' && templateData.subject) {
      return NextResponse.json(
        { error: 'SMS templates cannot have a subject' },
        { status: 400 }
      )
    }

    // Validate: Email templates should have subject
    if (templateData.type === 'email' && !templateData.subject) {
      return NextResponse.json(
        { error: 'Email templates must have a subject' },
        { status: 400 }
      )
    }

    // Extract variables from body
    const extractedVars = extractVariables(templateData.body)
    if (templateData.subject) {
      extractedVars.push(...extractVariables(templateData.subject))
    }
    const uniqueVars = [...new Set(extractedVars)]

    const { data: template, error: createError } = await supabase
      .from('message_templates')
      .insert({
        name: templateData.name,
        description: templateData.description || null,
        type: templateData.type,
        subject: templateData.subject || null,
        body: templateData.body,
        variables: templateData.variables || uniqueVars,
        category: templateData.category || 'general',
        tags: templateData.tags || [],
        created_by: user.id,
      } as never)
      .select()
      .single()

    if (createError || !template) {
      console.error('Error creating template:', createError)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Templates POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g) || []
  return matches.map(m => m.replace(/\{\{|\}\}/g, ''))
}
