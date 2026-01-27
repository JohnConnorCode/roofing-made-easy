import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { teamMembers, companyInfo } from '@/lib/data/team'
import {
  Home,
  Award,
  Shield,
  Clock,
  Heart,
  CheckCircle,
  ArrowRight,
  Phone,
} from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'

export const metadata: Metadata = {
  title: 'About Us | Family-Owned Roofing Since 2010',
  description: 'Learn about Farrell Roofing - a family-owned roofing company serving Tupelo and Northeast Mississippi since 2010. Licensed, insured, and committed to quality.',
  openGraph: {
    title: 'About Farrell Roofing | Tupelo MS',
    description: 'Family-owned roofing company serving Northeast Mississippi since 2010.',
  },
}

export default function AboutPage() {
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
                <h1 className="text-lg font-bold text-slate-100">Farrell Roofing</h1>
                <p className="text-xs text-slate-500">Tupelo, Mississippi</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/services" className="text-sm text-slate-400 hover:text-[#c9a25c]">Services</Link>
              <Link href="/portfolio" className="text-sm text-slate-400 hover:text-[#c9a25c]">Portfolio</Link>
              <Link href="/blog" className="text-sm text-slate-400 hover:text-[#c9a25c]">Resources</Link>
              <Link href="/contact" className="text-sm text-slate-400 hover:text-[#c9a25c]">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              About {companyInfo.name}
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              {companyInfo.description}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
            {companyInfo.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-[#c9a25c]">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-100 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                {companyInfo.mission}
              </p>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-100 mb-4">Licenses & Certifications</h3>
                <div className="space-y-2">
                  {companyInfo.licenses.map((license, index) => (
                    <div key={index} className="flex items-center gap-3 text-slate-400">
                      <Shield className="h-5 w-5 text-[#c9a25c]" />
                      {license}
                    </div>
                  ))}
                  {companyInfo.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 text-slate-400">
                      <Award className="h-5 w-5 text-[#c9a25c]" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-100 mb-6">Our Values</h2>
              <div className="space-y-6">
                {companyInfo.values.map((value, index) => (
                  <div key={index} className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{value.title}</h3>
                    <p className="text-slate-400">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">Meet Our Team</h2>
            <p className="mt-4 text-lg text-slate-400">
              The people behind every quality roof
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0c0f14]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-100">{member.name}</h3>
                <p className="text-[#c9a25c] text-sm mb-3">{member.role}</p>
                <p className="text-slate-400 text-sm">{member.bio}</p>
                {member.years && (
                  <p className="mt-3 text-xs text-slate-500">{member.years}+ years experience</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
            Ready to Work With Us?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Get a free estimate and see why thousands of homeowners trust Farrell Roofing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
            <Link href="/contact">
              <Button
                variant="outline"
                size="xl"
                className="border-slate-600 text-slate-300"
                leftIcon={<Phone className="h-5 w-5" />}
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
