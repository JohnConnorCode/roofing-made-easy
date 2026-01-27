import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { portfolioProjects } from '@/lib/data/portfolio'
import {
  Home,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Quote,
} from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'Our Work | Roofing Projects Portfolio',
  description: 'View our completed roofing projects in Tupelo and Northeast Mississippi. See real examples of roof replacements, repairs, and storm damage restoration.',
  openGraph: {
    title: 'Roofing Portfolio | Farrell Roofing',
    description: 'Browse our completed roofing projects across Northeast Mississippi.',
  },
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <PageHeader activeLink="/portfolio" />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Our Work
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              See the quality of our craftsmanship. Every project showcases our commitment to excellence.
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
                    <Home className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Project Photos</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
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
                    <p className="text-sm text-slate-500 mb-2">Scope of work:</p>
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
                        <span className="text-xs text-slate-500">
                          +{project.scope.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Testimonial */}
                  {project.testimonial && (
                    <div className="border-t border-slate-700 pt-4 mt-4">
                      <Quote className="h-4 w-4 text-[#c9a25c] mb-2" />
                      <p className="text-slate-400 text-sm italic">"{project.testimonial.text}"</p>
                      <p className="text-slate-500 text-xs mt-2">— {project.testimonial.author}</p>
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
