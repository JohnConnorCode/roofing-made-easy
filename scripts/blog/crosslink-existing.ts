#!/usr/bin/env npx tsx
/**
 * Retroactively adds cross-links between cluster-sibling posts.
 *
 * Works across both published and scheduled posts.
 * For posts generated from content-plan, uses cluster field.
 * For older seeded posts, falls back to category-based grouping.
 *
 * Usage:
 *   npx tsx scripts/blog/crosslink-existing.ts           # Update all posts
 *   npx tsx scripts/blog/crosslink-existing.ts --dry-run  # Preview only
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(__dirname, '../../')
const CONTENT_PLAN_PATH = path.join(ROOT, 'lib/data/blog/content-plan.json')

interface ContentTopic {
  slug: string
  cluster: string
}

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  category: string
  status: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
    process.exit(1)
  }
  return createClient(url, key)
}

// Derive a cluster key for posts not in content-plan (older seeded posts)
// Maps blog category → cluster label
const CATEGORY_TO_CLUSTER: Record<string, string> = {
  'Storm & Weather': 'storm-weather',
  'Insurance & Claims': 'insurance-claims',
  'Cost & Budgeting': 'cost-budgeting',
  'Maintenance & Care': 'maintenance-care',
  'Materials': 'roofing-materials',
  'Homeowner Guides': 'homeowner-guides',
  'Local': 'local-ms-content',
  'Energy & Efficiency': 'energy-efficiency',
}

function resolveCluster(slug: string, category: string, clusterMap: Map<string, string>): string {
  return clusterMap.get(slug) ?? CATEGORY_TO_CLUSTER[category] ?? 'general'
}

function extractLinkedSlugs(content: string): Set<string> {
  const linked = new Set<string>()
  const regex = /\/blog\/([\w-]+)/g
  let m
  while ((m = regex.exec(content)) !== null) {
    linked.add(m[1])
  }
  return linked
}

function buildFurtherReadingSection(siblings: Array<{ slug: string; title: string }>): string {
  const links = siblings.map(s => `- [${s.title}](/blog/${s.slug})`).join('\n')
  return `\n\n---\n\n**Further reading:**\n${links}`
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  if (dryRun) console.log('DRY RUN — no DB writes\n')

  const supabase = getSupabase()

  const topics: ContentTopic[] = JSON.parse(fs.readFileSync(CONTENT_PLAN_PATH, 'utf-8'))
  const clusterMap = new Map(topics.map(t => [t.slug, t.cluster]))

  // Fetch all posts (published + scheduled)
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, content, category, status')
    .in('status', ['published', 'scheduled'])

  if (error || !posts) {
    console.error('Failed to fetch posts:', error?.message)
    process.exit(1)
  }

  console.log(`Loaded ${posts.length} posts (published + scheduled)\n`)

  // Build cluster index
  const clusterIndex = new Map<string, Array<{ slug: string; title: string }>>()
  for (const post of posts as BlogPost[]) {
    const cluster = resolveCluster(post.slug, post.category, clusterMap)
    if (!clusterIndex.has(cluster)) clusterIndex.set(cluster, [])
    clusterIndex.get(cluster)!.push({ slug: post.slug, title: post.title })
  }

  console.log('Cluster sizes:')
  for (const [cluster, members] of [...clusterIndex.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${cluster}: ${members.length} posts`)
  }
  console.log()

  let updatedCount = 0
  let skippedCount = 0

  for (const post of posts as BlogPost[]) {
    const cluster = resolveCluster(post.slug, post.category, clusterMap)
    const clusterPosts = clusterIndex.get(cluster) ?? []
    const alreadyLinked = extractLinkedSlugs(post.content)

    // Skip if already has a Further reading section
    if (post.content.includes('**Further reading:**')) {
      skippedCount++
      continue
    }

    const unlinkedSiblings = clusterPosts.filter(
      p => p.slug !== post.slug && !alreadyLinked.has(p.slug)
    )

    if (unlinkedSiblings.length === 0) {
      skippedCount++
      continue
    }

    // Take up to 4 siblings, prefer shorter titles (more likely to be core/foundational posts)
    const toLink = unlinkedSiblings
      .sort((a, b) => a.title.length - b.title.length)
      .slice(0, 4)

    const section = buildFurtherReadingSection(toLink)
    const updatedContent = post.content + section

    if (dryRun) {
      console.log(`WOULD UPDATE [${post.status}] ${post.slug}`)
      console.log(`  Cluster: ${cluster} | Adding: ${toLink.map(p => p.slug).join(', ')}`)
    } else {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ content: updatedContent })
        .eq('id', post.id)

      if (updateError) {
        console.error(`ERROR ${post.slug}: ${updateError.message}`)
        continue
      }
      console.log(`UPDATED [${post.status}] ${post.slug} +${toLink.length} links`)
    }
    updatedCount++
  }

  console.log(`\n${'─'.repeat(55)}`)
  console.log(`Updated: ${updatedCount} | Skipped/clean: ${skippedCount} | Total: ${posts.length}`)
  if (dryRun) console.log('(Dry run — remove --dry-run to apply)')
}

main().catch(err => {
  console.error('Cross-linking failed:', err)
  process.exit(1)
})
