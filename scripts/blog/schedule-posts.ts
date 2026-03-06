#!/usr/bin/env npx tsx
/**
 * Schedule draft blog posts for auto-publishing.
 *
 * Usage:
 *   npx tsx scripts/blog/schedule-posts.ts --start 2026-03-10 --interval 3
 *   npx tsx scripts/blog/schedule-posts.ts --start 2026-03-10 --interval 3 --dry-run
 *
 * Options:
 *   --start YYYY-MM-DD   First publish date (required)
 *   --interval N          Days between posts (default: 3)
 *   --dry-run             Preview without updating DB
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for DB writes
 */

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    process.exit(1)
  }

  return createClient(url, key)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  const startIdx = args.indexOf('--start')
  if (startIdx === -1 || !args[startIdx + 1]) {
    console.error('--start YYYY-MM-DD is required')
    process.exit(1)
  }
  const startDate = args[startIdx + 1]

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    console.error('Invalid date format. Use YYYY-MM-DD.')
    process.exit(1)
  }

  const intervalIdx = args.indexOf('--interval')
  const interval = intervalIdx >= 0 ? parseInt(args[intervalIdx + 1], 10) : 3

  if (isNaN(interval) || interval < 1) {
    console.error('Interval must be a positive number.')
    process.exit(1)
  }

  return { startDate, interval, dryRun }
}

async function main() {
  const { startDate, interval, dryRun } = parseArgs()
  const supabase = getSupabase()

  // Fetch all draft posts ordered by created_at
  const { data: drafts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, created_at')
    .eq('status', 'draft')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch drafts:', error.message)
    process.exit(1)
  }

  if (!drafts || drafts.length === 0) {
    console.log('No draft posts found to schedule.')
    return
  }

  console.log(`Found ${drafts.length} draft posts to schedule`)
  console.log(`Start date: ${startDate}, interval: ${interval} days\n`)

  const baseDate = new Date(`${startDate}T06:00:00Z`) // Publish before 8am UTC cron

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i] as { id: string; slug: string; title: string }
    const publishDate = new Date(baseDate.getTime() + i * interval * 24 * 60 * 60 * 1000)
    const publishAt = publishDate.toISOString()

    console.log(`  ${publishDate.toISOString().split('T')[0]}  ${draft.title}`)

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ status: 'scheduled', publish_at: publishAt } as never)
        .eq('id', draft.id)

      if (updateError) {
        console.error(`  ERROR: Failed to schedule "${draft.slug}": ${updateError.message}`)
      }
    }
  }

  const lastDate = new Date(baseDate.getTime() + (drafts.length - 1) * interval * 24 * 60 * 60 * 1000)
  console.log(`\n${dryRun ? '[DRY RUN] Would schedule' : 'Scheduled'} ${drafts.length} posts`)
  console.log(`Date range: ${startDate} to ${lastDate.toISOString().split('T')[0]}`)
}

main().catch(err => {
  console.error('Scheduling failed:', err)
  process.exit(1)
})
