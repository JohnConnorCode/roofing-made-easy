'use client'

import { useState } from 'react'
import { Link2, Twitter, Facebook, Check } from 'lucide-react'

interface ShareStripProps {
  title: string
  slug: string
}

const BASE_URL = 'https://www.smartroofpricing.com'

export function ShareStrip({ title, slug }: ShareStripProps) {
  const [copied, setCopied] = useState(false)
  const url = `${BASE_URL}/blog/${slug}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select the url from the page
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Share</span>

      <button
        onClick={copy}
        aria-label="Copy link"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-[#c9a25c]/50 hover:text-[#c9a25c] transition-colors text-xs"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter/X"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-[#c9a25c]/50 hover:text-[#c9a25c] transition-colors text-xs"
      >
        <Twitter className="h-3.5 w-3.5" />
        Twitter
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-[#c9a25c]/50 hover:text-[#c9a25c] transition-colors text-xs"
      >
        <Facebook className="h-3.5 w-3.5" />
        Facebook
      </a>
    </div>
  )
}
