#!/usr/bin/env npx tsx
/**
 * Blog post generation script.
 * Reads the content plan, picks the next topic, generates via OpenAI, validates, and writes to Supabase.
 *
 * Usage:
 *   npx tsx scripts/blog/generate-post.ts                    # Generate next priority topic
 *   npx tsx scripts/blog/generate-post.ts topic-042          # Generate a specific topic
 *   npx tsx scripts/blog/generate-post.ts --batch 5          # Generate 5 posts in sequence
 *   npx tsx scripts/blog/generate-post.ts --dry-run          # Generate without writing to DB
 *   npx tsx scripts/blog/generate-post.ts topic-042 --dry-run
 *
 * Environment variables:
 *   OPENAI_API_KEY          - Required for AI generation
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for DB writes
 */

import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { validatePost, humanizerPass, calculateReadTime } from './validate'

// ── Types ──

interface ContentTopic {
  id: string
  slug: string
  title: string
  category: string
  cluster: string
  keywords: string[]
  outline: string
  priority: number
  status: 'planned' | 'published' | 'skipped'
  internalLinks: string[]
  publishedSlug: string | null
}

interface BlogPostInsert {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  read_time: number
  featured: boolean
  tags: string[]
  status: 'draft'
  topic_id: string
}

// ── Paths ──

const ROOT = path.resolve(__dirname, '../../')
const CONTENT_PLAN_PATH = path.join(ROOT, 'lib/data/blog/content-plan.json')
const SYSTEM_PROMPT_PATH = path.join(ROOT, 'scripts/blog/system-prompt.md')

// ── Config ──

const MAX_RETRIES = 2
const MODEL = 'gpt-4o'

// ── Supabase ──

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    process.exit(1)
  }

  return createClient(url, key)
}

async function getExistingSlugs(): Promise<string[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')

  if (error) {
    console.error('Failed to fetch existing slugs:', error.message)
    return []
  }

  return (data ?? []).map((r: { slug: string }) => r.slug)
}

// ── Helpers ──

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function pickTopic(topics: ContentTopic[], specificId?: string): ContentTopic | null {
  if (specificId) {
    const topic = topics.find(t => t.id === specificId)
    if (!topic) {
      console.error(`Topic ${specificId} not found in content plan`)
      return null
    }
    if (topic.status === 'published') {
      console.error(`Topic ${specificId} is already published`)
      return null
    }
    return topic
  }

  // Pick highest priority planned topic (lowest priority number first)
  const planned = topics
    .filter(t => t.status === 'planned')
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))

  if (planned.length === 0) {
    console.log('All topics have been published. Nothing to generate.')
    return null
  }

  return planned[0]
}

function buildPrompt(topic: ContentTopic, existingSlugs: string[]): string {
  const relatedPosts = topic.internalLinks
    .filter(link => link.startsWith('/blog/'))
    .map(link => link.replace('/blog/', ''))

  return `Write a blog post with the following specifications:

**Title (H1 — provided separately, do NOT include as H1 in your output):**
${topic.title}

**Target Keywords:**
${topic.keywords.join(', ')}

**Content Outline:**
${topic.outline}

**Category:** ${topic.category}

**Required Internal Links (use these in your content naturally):**
${topic.internalLinks.map(l => `- ${l}`).join('\n')}

${relatedPosts.length > 0 ? `**Related Blog Posts to Reference:**\n${relatedPosts.map(s => `- /blog/${s}`).join('\n')}` : ''}

**Existing blog post slugs (do NOT duplicate these topics):**
${existingSlugs.slice(0, 20).join(', ')}${existingSlugs.length > 20 ? '...' : ''}

Write the full blog post content in Markdown. Start with the opening paragraph — no H1 title.

IMPORTANT: Your response MUST be at least 1,000 words. Write thorough, detailed sections — each H2 section should be 150-300 words with multiple paragraphs. Do not summarize — fully explain each topic.`
}

async function generateContent(openai: OpenAI, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned empty content')
  }
  return content
}

function extractExcerpt(content: string): string {
  const lines = content.split('\n')
  let excerpt = ''
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('#')) continue
    if (trimmed.length > 50) {
      excerpt = trimmed
      break
    }
  }

  excerpt = excerpt
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')

  if (excerpt.length > 200) {
    excerpt = excerpt.slice(0, 200).replace(/\s\S*$/, '') + '...'
  }

  return excerpt
}

function extractTags(topic: ContentTopic): string[] {
  const tags = new Set<string>()

  for (const kw of topic.keywords) {
    tags.add(kw.toLowerCase())
  }

  tags.add(topic.category.toLowerCase())
  tags.add(topic.cluster.replace(/-/g, ' '))
  tags.add('mississippi')

  return Array.from(tags).slice(0, 8)
}

// ── Main ──

async function generateOne(
  openai: OpenAI,
  systemPrompt: string,
  topics: ContentTopic[],
  existingSlugs: string[],
  specificId?: string,
  dryRun = false
): Promise<boolean> {
  const topic = pickTopic(topics, specificId)
  if (!topic) return false

  // Check if slug already exists in DB
  if (existingSlugs.includes(topic.slug)) {
    console.log(`Slug "${topic.slug}" already exists in DB. Skipping.`)
    return false
  }

  console.log(`\nGenerating post for: ${topic.title}`)
  console.log(`Topic ID: ${topic.id} | Category: ${topic.category} | Priority: ${topic.priority}`)

  const userPrompt = buildPrompt(topic, existingSlugs)

  let content = ''
  let validation = { valid: false, errors: [] as string[], warnings: [] as string[], stats: { wordCount: 0, h2Count: 0, h3Count: 0, internalLinkCount: 0, boldTermCount: 0 } }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(`\nRetry ${attempt}/${MAX_RETRIES} — previous errors: ${validation.errors.join('; ')}`)
    }

    const feedbackPrompt = attempt > 0
      ? `${userPrompt}\n\nIMPORTANT: Your previous attempt had these issues — fix them:\n${validation.errors.map(e => `- ${e}`).join('\n')}`
      : userPrompt

    content = await generateContent(openai, systemPrompt, feedbackPrompt)
    content = humanizerPass(content)
    validation = validatePost(content, topic.title, existingSlugs)

    console.log(`\nAttempt ${attempt + 1} stats:`)
    console.log(`  Words: ${validation.stats.wordCount}`)
    console.log(`  H2 sections: ${validation.stats.h2Count}`)
    console.log(`  Internal links: ${validation.stats.internalLinkCount}`)
    console.log(`  Bold terms: ${validation.stats.boldTermCount}`)

    if (validation.errors.length > 0) {
      console.log(`  Errors: ${validation.errors.join('; ')}`)
    }
    if (validation.warnings.length > 0) {
      console.log(`  Warnings: ${validation.warnings.join('; ')}`)
    }

    if (validation.valid) {
      console.log('  Validation: PASSED')
      break
    }
  }

  if (!validation.valid) {
    console.error(`\nFailed validation after ${MAX_RETRIES + 1} attempts. Skipping topic ${topic.id}.`)

    if (!dryRun) {
      topic.status = 'skipped' as const
      writeJson(CONTENT_PLAN_PATH, topics)
    }

    return false
  }

  const post: BlogPostInsert = {
    slug: topic.slug,
    title: topic.title,
    excerpt: extractExcerpt(content),
    content: `\n# ${topic.title}\n\n${content}\n    `,
    category: topic.category,
    author: 'Mike Farrell',
    read_time: calculateReadTime(content),
    featured: false,
    tags: extractTags(topic),
    status: 'draft',
    topic_id: topic.id,
  }

  if (dryRun) {
    console.log('\n--- DRY RUN — Post would be: ---')
    console.log(`Slug: ${post.slug}`)
    console.log(`Title: ${post.title}`)
    console.log(`Excerpt: ${post.excerpt}`)
    console.log(`Category: ${post.category}`)
    console.log(`Read Time: ${post.read_time} min`)
    console.log(`Tags: ${post.tags.join(', ')}`)
    console.log(`Word Count: ${validation.stats.wordCount}`)
    console.log('\n--- Content Preview (first 500 chars): ---')
    console.log(post.content.slice(0, 500))
    console.log('\n--- DRY RUN COMPLETE ---')
    return true
  }

  // Write to Supabase
  const supabase = getSupabase()
  const { error } = await supabase
    .from('blog_posts')
    .insert(post as never)

  if (error) {
    console.error(`Failed to insert post: ${error.message}`)
    return false
  }

  // Mutate topic in-place so subsequent batch iterations skip it
  topic.status = 'published' as const
  topic.publishedSlug = topic.slug

  writeJson(CONTENT_PLAN_PATH, topics)

  existingSlugs.push(topic.slug)
  console.log(`\nSaved to DB as draft: /blog/${post.slug}`)
  return true
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const specificId = args.find(a => a.startsWith('topic-'))
  const batchIdx = args.indexOf('--batch')
  const batchCount = batchIdx >= 0 ? parseInt(args[batchIdx + 1], 10) : 1

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf-8')
  const topics: ContentTopic[] = readJson(CONTENT_PLAN_PATH)
  const existingSlugs = await getExistingSlugs()

  let generated = 0
  for (let i = 0; i < batchCount; i++) {
    const success = await generateOne(openai, systemPrompt, topics, existingSlugs, specificId, dryRun)
    if (success) generated++
    if (!success && specificId) break // Don't retry a specific topic
  }

  console.log(`\nDone. Generated ${generated}/${batchCount} posts.`)
}

main().catch(err => {
  console.error('Generation failed:', err)
  process.exit(1)
})
