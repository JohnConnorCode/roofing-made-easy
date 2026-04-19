'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen } from 'lucide-react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  readTime: number
  publishedAt: string
  image?: string | null
}

interface BlogFilterProps {
  posts: BlogPost[]
  categories: string[]
}

export function BlogFilter({ posts, categories }: BlogFilterProps) {
  const [active, setActive] = useState<string | null>(null)

  const filtered = active ? posts.filter(p => p.category === active) : posts

  return (
    <>
      {/* Category pills */}
      <section className="py-6 bg-[#0c0f14] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-slate-400 text-sm mr-2 self-center">Filter:</span>
            <button
              onClick={() => setActive(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                !active
                  ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                  : 'bg-[#1a1f2e] border-slate-700 text-slate-300 hover:border-[#c9a25c]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat === active ? null : cat)}
                className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                  active === cat
                    ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                    : 'bg-[#1a1f2e] border-slate-700 text-slate-300 hover:border-[#c9a25c]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="sr-only">
            {active ? `${active} Articles` : 'Latest Articles'}
          </h2>
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-16">No articles in this category yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-slate-900 bg-slate-950/40 hover:border-slate-700 transition-colors"
                >
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
          )}
        </div>
      </section>
    </>
  )
}
