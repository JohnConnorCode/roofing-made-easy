import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts, getCategories } from '@/lib/data/blog'
import {
  ArrowRight,
  Clock,
  Tag,
  BookOpen,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Roofing Resources & Blog | Tips & Guides',
  description: 'Expert roofing advice, tips, and guides for Mississippi homeowners. Learn about roof maintenance, storm damage, materials, and more.',
  openGraph: {
    title: 'Roofing Resources | Farrell Roofing',
    description: 'Expert roofing tips and guides for Northeast Mississippi homeowners.',
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const categories = getCategories()

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <BookOpen className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Roofing Resources
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Expert advice, guides, and tips to help you make informed decisions about your roof.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-[#0c0f14] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-slate-500 text-sm mr-2">Categories:</span>
            {categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 bg-[#1a1f2e] border border-slate-700 rounded-full text-sm text-slate-300 hover:border-[#c9a25c] cursor-pointer transition-colors"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-[#1a1f2e] border border-slate-700 rounded-2xl overflow-hidden hover:border-[#c9a25c]/50 transition-colors group"
              >
                {/* Blog post image */}
                <div className="aspect-video relative bg-gradient-to-br from-slate-700 to-slate-800">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs bg-[#c9a25c]/20 text-[#c9a25c] px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {post.readTime} min read
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">By {post.author}</span>
                    <span className="text-[#c9a25c] text-sm flex items-center gap-1">
                      Read more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
            Need Help With Your Roof?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Get a free estimate and expert advice tailored to your situation.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button
                variant="primary"
                size="xl"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
