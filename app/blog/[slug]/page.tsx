'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/data/blog'
import {
  Home,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Calendar,
  Tag,
} from 'lucide-react'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = getBlogPostBySlug(slug)
  const allPosts = getAllBlogPosts()
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3)

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0c0f14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <Home className="h-6 w-6 text-[#0c0f14]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">RoofEstimate</h1>
                <p className="text-xs text-slate-500">by Farrell Roofing</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/blog" className="text-sm text-[#c9a25c]">Resources</Link>
              <Link href="/services" className="text-sm text-slate-400 hover:text-[#c9a25c]">Services</Link>
              <Link href="/contact" className="text-sm text-slate-400 hover:text-[#c9a25c]">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#161a23] border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#c9a25c]"
          >
            <ArrowLeft className="h-4 w-4" />
            All Resources
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-sm bg-[#c9a25c]/20 text-[#c9a25c] px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-100 mb-6">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div
              className="text-slate-300 leading-relaxed space-y-6"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {post.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold text-slate-100 mt-8 mb-4">
                      {paragraph.replace('# ', '')}
                    </h1>
                  )
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold text-slate-100 mt-8 mb-4">
                      {paragraph.replace('## ', '')}
                    </h2>
                  )
                }
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <p key={index} className="font-semibold text-slate-100">
                      {paragraph.replace(/\*\*/g, '')}
                    </p>
                  )
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="text-slate-300 ml-4">
                      {paragraph.replace('- ', '')}
                    </li>
                  )
                }
                if (paragraph.startsWith('- [ ]')) {
                  return (
                    <li key={index} className="text-slate-300 ml-4 list-none flex items-center gap-2">
                      <span className="w-4 h-4 border border-slate-500 rounded" />
                      {paragraph.replace('- [ ] ', '')}
                    </li>
                  )
                }
                if (paragraph.trim() === '') return null
                return (
                  <p key={index} className="text-slate-300">
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-slate-500" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#1a1f2e] border border-slate-700 rounded-full text-sm text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-to-br from-[#c9a25c]/20 to-transparent border border-[#c9a25c]/30 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Need Help With Your Roof?</h3>
            <p className="text-slate-400 mb-6">
              Get a free, no-obligation estimate for your roofing project.
            </p>
            <Link href="/">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-16 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">More Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 hover:border-[#c9a25c]/50 transition-colors"
              >
                <span className="text-xs bg-[#c9a25c]/20 text-[#c9a25c] px-2 py-1 rounded">
                  {relatedPost.category}
                </span>
                <h3 className="text-lg font-semibold text-slate-100 mt-3 mb-2">
                  {relatedPost.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">{relatedPost.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0c0f14] py-8 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Farrell Roofing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
