/**
 * Estimate Content Service
 * Manages editable content for estimates/quotes: warranties, scope, terms, payment terms
 * Database-first with fallback to hardcoded defaults
 */

import { createClient } from '@/lib/supabase/server'

export type EstimateContentType = 'warranty' | 'scope' | 'terms' | 'payment_terms'

export interface EstimateContent {
  id: string
  slug: string
  title: string
  content: string
  default_content: string
  content_type: EstimateContentType
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Hardcoded fallbacks in case database is unavailable
const DEFAULT_CONTENT: Record<string, { title: string; content: string; content_type: EstimateContentType; display_order: number }> = {
  'warranty-workmanship': {
    title: 'Workmanship Warranty',
    content: 'We stand behind our work with a 10-year workmanship warranty covering all labor and installation.',
    content_type: 'warranty',
    display_order: 1,
  },
  'warranty-materials': {
    title: 'Materials Warranty',
    content: 'All materials come with manufacturer warranties. Shingles typically carry 25-50 year coverage.',
    content_type: 'warranty',
    display_order: 2,
  },
  'scope-removal': {
    title: 'Removal & Disposal',
    content: 'Complete removal of existing roofing materials down to the deck. All debris hauled away and disposed of properly.',
    content_type: 'scope',
    display_order: 1,
  },
  'scope-installation': {
    title: 'Installation',
    content: 'Installation of new roofing system including underlayment, flashing, drip edge, and ridge vents per manufacturer specifications.',
    content_type: 'scope',
    display_order: 2,
  },
  'scope-cleanup': {
    title: 'Cleanup',
    content: 'Daily cleanup during project. Final magnetic sweep of property to collect any stray nails or debris.',
    content_type: 'scope',
    display_order: 3,
  },
  'terms-general': {
    title: 'General Terms',
    content: 'Estimate valid for 30 days. Prices subject to change based on material costs and unforeseen conditions.',
    content_type: 'terms',
    display_order: 1,
  },
  'terms-payment': {
    title: 'Payment Terms',
    content: '50% deposit required to schedule work. Balance due upon completion. We accept all major credit cards.',
    content_type: 'payment_terms',
    display_order: 1,
  },
}

/**
 * Get all estimate content items of a specific type
 */
export async function getEstimateContent(type: EstimateContentType): Promise<EstimateContent[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('estimate_content')
      .select('*')
      .eq('content_type', type)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching estimate content:', error)
      return getFallbackContent(type)
    }

    if (!data || data.length === 0) {
      return getFallbackContent(type)
    }

    return data as EstimateContent[]
  } catch (error) {
    console.error('Error in getEstimateContent:', error)
    return getFallbackContent(type)
  }
}

/**
 * Get all estimate content items for admin listing
 */
export async function getAllEstimateContent(): Promise<EstimateContent[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('estimate_content')
      .select('*')
      .order('content_type', { ascending: true })
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching all estimate content:', error)
      return []
    }

    return (data || []) as EstimateContent[]
  } catch (error) {
    console.error('Error in getAllEstimateContent:', error)
    return []
  }
}

/**
 * Get a single estimate content item by ID
 */
export async function getEstimateContentById(id: string): Promise<EstimateContent | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('estimate_content')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching estimate content by ID:', error)
      return null
    }

    return data as EstimateContent
  } catch (error) {
    console.error('Error in getEstimateContentById:', error)
    return null
  }
}

/**
 * Update estimate content
 */
export async function updateEstimateContent(
  id: string,
  updates: Partial<Pick<EstimateContent, 'title' | 'content' | 'is_active' | 'display_order'>>
): Promise<EstimateContent | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('estimate_content' as never)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating estimate content:', error)
      return null
    }

    return data as EstimateContent
  } catch (error) {
    console.error('Error in updateEstimateContent:', error)
    return null
  }
}

/**
 * Reset estimate content to default
 */
export async function resetEstimateContent(id: string): Promise<EstimateContent | null> {
  try {
    const supabase = await createClient()

    // First get the current item to get its default_content
    const { data: current, error: fetchError } = await supabase
      .from('estimate_content' as never)
      .select('default_content')
      .eq('id', id)
      .single() as { data: { default_content: string } | null; error: unknown }

    if (fetchError || !current) {
      console.error('Error fetching estimate content for reset:', fetchError)
      return null
    }

    // Update content to default_content
    const { data, error } = await supabase
      .from('estimate_content' as never)
      .update({
        content: current.default_content,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error resetting estimate content:', error)
      return null
    }

    return data as EstimateContent
  } catch (error) {
    console.error('Error in resetEstimateContent:', error)
    return null
  }
}

/**
 * Get fallback content when database is unavailable
 */
function getFallbackContent(type: EstimateContentType): EstimateContent[] {
  return Object.entries(DEFAULT_CONTENT)
    .filter(([, item]) => item.content_type === type)
    .map(([slug, item]) => ({
      id: slug,
      slug,
      title: item.title,
      content: item.content,
      default_content: item.content,
      content_type: item.content_type,
      is_active: true,
      display_order: item.display_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    .sort((a, b) => a.display_order - b.display_order)
}

/**
 * Get grouped estimate content for display (warranties, scope, terms)
 */
export async function getGroupedEstimateContent(): Promise<{
  warranties: EstimateContent[]
  scope: EstimateContent[]
  terms: EstimateContent[]
  payment_terms: EstimateContent[]
}> {
  const [warranties, scope, terms, payment_terms] = await Promise.all([
    getEstimateContent('warranty'),
    getEstimateContent('scope'),
    getEstimateContent('terms'),
    getEstimateContent('payment_terms'),
  ])

  return { warranties, scope, terms, payment_terms }
}
