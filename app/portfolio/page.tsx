import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { isRealPortfolioData, portfolioProjects } from '@/lib/data/portfolio'
import {
  Home,
  ArrowRight,
  MapPin,
  Clock,
  Quote,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: 'Our Work | Roofing Projects Portfolio | Farrell Roofing',
  description: 'View our completed roofing projects in Tupelo and Northeast Mississippi. See real examples of roof replacements, repairs, and storm damage restoration.',
  openGraph: {
    title: 'Roofing Portfolio | Farrell Roofing',
    description: 'Browse our completed roofing projects across Northeast Mississippi.',
    url: `${BASE_URL}/portfolio`,
    siteName: 'Farrell Roofing',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Our%20Work&subtitle=Roofing%20Projects%20Portfolio`,
        width: 1200,
        height: 630,
        alt: 'Farrell Roofing Projects Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofing Portfolio | Farrell Roofing',
    description: 'Browse our completed roofing projects across Northeast Mississippi.',
  },
  alternates: {
    canonical: `${BASE_URL}/portfolio`,
  },
  ...(!isRealPortfolioData && {
    robots: { index: false, follow: false },
  }),
}

export default function PortfolioPage() {
  if (!isRealPortfolioData) {
    return (
      <div className="min-h-screen bg-[#0c0f14]">
        <SiteHeader />

        <section className="py-24 md:py-32 bg-[#0c0f14]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] animate-slide-up">
                Our Work
              </p>
              <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display animate-slide-up delay-75">
                Roofs we&rsquo;ve put on.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed animate-slide-up delay-150 max-w-2xl">
                We&rsquo;re putting together a showcase of recent completions.
                Check back soon, or see the tool in action while you&rsquo;re here.
              </p>
              <div className="mt-10 animate-slide-up delay-200">
                <Link href="/">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Get my free estimate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] animate-slide-up">
              Our Work
            </p>
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display animate-slide-up delay-75">
              Roofs we&rsquo;ve put on.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed animate-slide-up delay-150 max-w-2xl">
              Drone documentation from projects across Northeast Mississippi.
              Every job photographed, every detail on record.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-8 stagger-children">
            {portfolioProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1f2e] border border-slate-700 rounded-2xl overflow-hidden hover:border-[#c9a25c]/50 transition-colors"
              >
                {/* Placeholder for before/after images */}
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Project Photos</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {project.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 mb-2">{project.title}</h3>
                  <p className="text-[#c9a25c] text-sm mb-3">{project.projectType}</p>
                  <p className="text-slate-400 mb-4">{project.description}</p>

                  {/* Scope */}
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Scope of work:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.scope.slice(0, 3).map((item, index) => (
                        <span
                          key={index}
                          className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                      {project.scope.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{project.scope.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Testimonial */}
                  {project.testimonial && (
                    <div className="border-t border-slate-700 pt-4 mt-4">
                      <Quote className="h-4 w-4 text-[#c9a25c] mb-2" />
                      <p className="text-slate-400 text-sm italic">&ldquo;{project.testimonial.text}&rdquo;</p>
                      <p className="text-slate-400 text-xs mt-2">&mdash; {project.testimonial.author}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join hundreds of satisfied homeowners. Get your free estimate today.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button
                variant="primary"
                size="xl"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get My Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
