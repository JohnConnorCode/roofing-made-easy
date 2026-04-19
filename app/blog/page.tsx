import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts } from '@/lib/data/blog'
import {
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { PageHero } from '@/components/shared/page-hero'
import { CollectionPageSchema, BreadcrumbSchema } from '@/components/seo/list-schema'
import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `Roofing Resources & Blog | Tips & Guides | ${BUSINESS_CONFIG.name}`,
  description: `Expert roofing advice, tips, and guides for ${BUSINESS_CONFIG.serviceArea.region} homeowners. Learn about roof maintenance, storm damage, materials, and more from local roofing experts.`,
  keywords: [
    'roofing tips',
    'roof maintenance guide',
    'roofing advice Mississippi',
    'storm damage roof',
    'roof repair tips',
    'roofing materials guide',
  ],
  openGraph: {
    title: `Roofing Resources | ${BUSINESS_CONFIG.name}`,
    description: `Expert roofing tips and guides for ${BUSINESS_CONFIG.serviceArea.region} homeowners.`,
    url: `${BASE_URL}/blog`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=blog&title=Roofing%20Resources%20%26%20Blog&subtitle=Expert%20Tips%20%E2%80%A2%20Guides%20%E2%80%A2%20Advice`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} Blog`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Roofing Resources | ${BUSINESS_CONFIG.name}`,
    description: `Expert roofing advice for ${BUSINESS_CONFIG.serviceArea.region} homeowners.`,
  },
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
}

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getAllBlogPosts()
  const categories = [...new Set(posts.map(p => p.category))]

  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Blog', url: `${BASE_URL}/blog` },
  ]

  const postItems = posts.map(p => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    author: p.author,
    publishedAt: p.publishedAt,
    image: p.image,
  }))

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Structured Data */}
      <CollectionPageSchema
        posts={postItems}
        pageTitle="Roofing Resources & Blog"
        pageDescription={`Expert roofing advice, tips, and guides from ${BUSINESS_CONFIG.name}`}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <SiteHeader />

      <PageHero
        image="/images/work/metal-conversion.webp"
        alt="Residential metal roof installation in Northeast Mississippi — Smart Roof Pricing blog"
        eyebrow="Blog"
        eyebrowIcon={<BookOpen className="h-3.5 w-3.5" />}
        title={<>Straight talk<br />about roofs.</>}
        subtitle="Guides, pricing context, and decisions homeowners actually face — written by roofers, not marketers."
      />

      {/* Categories */}
      <section className="py-6 bg-[#0c0f14] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-slate-400 text-sm mr-2">Categories:</span>
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
          <h2 className="sr-only">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-slate-900 bg-slate-950/40 hover:border-slate-700 transition-colors"
              >
                {/* Post image */}
                <div className="aspect-[5/3] relative bg-slate-900 overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14]/40 via-transparent to-transparent" />
                </div>

                <div className="flex-1 flex flex-col p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] mb-3">
                    {post.category}
                    <span className="mx-2 text-slate-700">·</span>
                    <span className="text-slate-500 normal-case tracking-normal font-normal">
                      {post.readTime} min read
                    </span>
                  </p>

                  <h3 className="text-xl font-bold text-slate-50 font-display leading-tight tracking-tight group-hover:text-[#e6c588] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{post.author}</span>
                    <span className="text-sm text-[#c9a25c] flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
            Your turn
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05] tracking-tight">
            Still reading? Run the number.
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
                Get my free estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
