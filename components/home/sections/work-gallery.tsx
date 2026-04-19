'use client'

import Image from 'next/image'
import { ScrollAnimate } from '@/components/scroll-animate'

/**
 * Recent work gallery — grounded photo proof via the company's own drone
 * documentation. Archived here from the homepage for reuse on About or
 * Services pages. Render anywhere a photo-heavy proof block adds value.
 */

const PROJECTS = [
  {
    src: '/images/work/replacement-after.webp',
    alt: 'Aerial view of a completed residential shingle roof replacement',
    caption: 'Full replacement',
    detail: 'Tear-off, underlayment, and architectural shingles',
  },
  {
    src: '/images/work/metal-conversion.webp',
    alt: 'Residential metal roof installation',
    caption: 'Shingle-to-metal conversion',
    detail: 'Standing seam, coco brown',
  },
  {
    src: '/images/work/large-residential.webp',
    alt: 'Large home with new architectural shingle roof',
    caption: 'Large residential',
    detail: '8,100 sq ft estate grey architectural',
  },
  {
    src: '/images/work/aerial-wide.webp',
    alt: 'Aerial drone photo of a completed roof',
    caption: 'Recent completion',
    detail: 'Drone documentation, full project record',
  },
]

export function WorkGallery() {
  return (
    <section
      aria-label="Recent work"
      className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
              Recent work
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05]">
              Real roofs.
              <br />
              Right here.
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-xl">
              Recent completions by the local crew behind this tool &mdash;
              documented from the drone up.
            </p>
          </div>
        </ScrollAnimate>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECTS.map((project, idx) => (
            <ScrollAnimate key={project.src} delay={idx * 80}>
              <figure className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-900">
                <Image
                  src={project.src}
                  alt={project.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/30 to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#e6c588]">
                    {project.caption}
                  </p>
                  <p className="mt-1 text-base text-slate-100 font-medium">
                    {project.detail}
                  </p>
                </figcaption>
              </figure>
            </ScrollAnimate>
          ))}
        </div>
      </div>
    </section>
  )
}
