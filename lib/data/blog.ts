/**
 * Blog/Resources Data
 *
 * Reads blog posts from Supabase database.
 * All functions are async — callers must await.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishedAt: string
  readTime: number
  featured?: boolean
  tags: string[]
  image?: string
}

// Singleton service-role client for reading published posts (no cookie/session needed)
let _client: SupabaseClient<Database> | null = null

function getClient(): SupabaseClient<Database> {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase URL and service role key are required for blog data')
  }

  _client = createClient<Database>(url, key)
  return _client
}

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row']

function rowToPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: row.author,
    publishedAt: row.published_at ?? row.created_at,
    readTime: row.read_time,
    featured: row.featured,
    tags: row.tags ?? [],
    image: row.image ?? undefined,
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`)
  return (data ?? []).map(rowToPost)
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch blog post: ${error.message}`)
  }
  return data ? rowToPost(data) : undefined
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch featured posts: ${error.message}`)
  return (data ?? []).map(rowToPost)
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch posts by category: ${error.message}`)
  return (data ?? []).map(rowToPost)
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch posts by tag: ${error.message}`)
  return (data ?? []).map(rowToPost)
}

export async function getCategories(): Promise<string[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return [...new Set((data ?? []).map((r: { category: string }) => r.category))]
}
