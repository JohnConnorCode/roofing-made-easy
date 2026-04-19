import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await sb
    .from('blog_posts')
    .select('slug, status, publish_at, read_time, excerpt')
    .order('created_at', { ascending: false })
    .limit(35)
  if (error) { console.error(error.message); process.exit(1) }
  console.log(`Total rows: ${data.length}\n`)
  for (const p of data) {
    const date = p.publish_at ? p.publish_at.slice(0,10) : 'no-date'
    console.log(`[${p.status.padEnd(9)}] ${date}  ${p.slug}`)
  }
  // Spot check one post content
  const { data: post } = await sb.from('blog_posts').select('slug, content, excerpt').eq('slug', 'roof-repair-vs-replace-cost-analysis').single()
  if (post) {
    console.log(`\n--- Spot check: ${post.slug} ---`)
    console.log(`Excerpt: ${post.excerpt}`)
    console.log(`Content length: ${post.content?.length} chars`)
    console.log(`Content preview: ${post.content?.slice(0, 300)}`)
  }
}

main()
