import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { teamMembers, companyInfo } from '@/lib/data/team'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import {
  Award,
  Shield,
  ArrowRight,
  Phone,
  Heart,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { OrganizationSchema, AboutPageSchema, BreadcrumbSchema } from '@/components/seo/list-schema'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `About Robert & Bob Farrell | Farrell Roofing | ${BUSINESS_CONFIG.name}`,
  description: `Smart Roof Pricing is built by Robert Farrell and his father Bob Farrell of Farrell Roofing — a family roofing operation serving Tupelo, Fulton, Amory, Saltillo, and Northeast Mississippi since ${BUSINESS_CONFIG.foundedYear}.`,
  keywords: [
    'Farrell Roofing Mississippi',
    'Robert Farrell roofer Tupelo',
    'Bob Farrell Farrell Roofing',
    'family roofing contractor Northeast Mississippi',
    `${BUSINESS_CONFIG.serviceArea.region} roofing company`,
  ],
  openGraph: {
    title: `About Robert & Bob Farrell | ${BUSINESS_CONFIG.name}`,
    description: `Father-and-son roofing in Northeast Mississippi. Bob built the company. Robert built the pricing tool. Together they're making roofing honest.`,
    url: `${BASE_URL}/about`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=website&title=About%20Robert%20%26%20Bob%20Farrell&subtitle=Farrell%20Roofing%20%E2%80%94%20Northeast%20Mississippi`,
        width: 1200,
        height: 630,
        alt: 'Robert and Bob Farrell — Farrell Roofing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About Robert & Bob Farrell | ${BUSINESS_CONFIG.name}`,
    description: `Father-and-son roofing in Northeast Mississippi since ${BUSINESS_CONFIG.foundedYear}.`,
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
}

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'About', url: `${BASE_URL}/about` },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      <AboutPageSchema />
      <OrganizationSchema
        description={companyInfo.description}
        numberOfEmployees="15+"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <SiteHeader />
      <Breadcrumbs items={[{ name: 'About', href: '/about' }]} />

      {/* Hero — lead with the people */}
      <section className="py-24 md:py-32 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] mb-4">
                Farrell Roofing · Smart Roof Pricing
              </p>
              <h1 className="text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display mb-6">
                Father and son.<br />Northeast Mississippi.
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                Bob Farrell built a roofing company from the ground up in this region. His son Robert built a pricing tool so homeowners stop getting taken advantage of. Same family, same standard.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a
                  href={getPhoneLink()}
                  className="inline-flex items-center gap-2 text-[#c9a25c] font-medium hover:text-[#e6c588] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {getPhoneDisplay()}
                </a>
                <span className="text-slate-700">·</span>
                <span className="text-slate-400 text-sm">Fulton, MS</span>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-900">
              <Image
                src="/images/about/team-work.jpg"
                alt="Farrell Roofing crew at work in Northeast Mississippi"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14]/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {companyInfo.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-[#c9a25c]">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 md:py-28 bg-[#161a23]">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">The story</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-10">
            Why this exists.
          </h2>
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
            {companyInfo.founderStory.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* The People */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">The people</p>
          <h2 className="text-3xl font-bold text-slate-100 mb-12">Robert & Bob Farrell</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-800/80 bg-[#141925] p-8"
              >
                <div className="w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] flex items-center justify-center">
                  <span className="text-xl font-bold text-[#0c0f14]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">{member.name}</h3>
                <p className="text-[#c9a25c] text-sm font-medium mb-4">{member.role}</p>
                <p className="text-slate-300 leading-relaxed">{member.bio}</p>
                {member.years && (
                  <p className="mt-4 text-xs text-slate-500">{member.years}+ years in roofing</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">How we work</p>
              <h2 className="text-3xl font-bold text-slate-100 mb-8">What we stand for.</h2>
              <div className="space-y-5">
                {companyInfo.values.map((value, index) => (
                  <div key={index} className="rounded-xl border border-slate-800/80 bg-[#141925] p-6">
                    <h3 className="text-base font-semibold text-slate-100 mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">Credentials</p>
              <h2 className="text-3xl font-bold text-slate-100 mb-8">Licensed & insured.</h2>
              <div className="space-y-3 mb-10">
                {companyInfo.licenses.map((license, index) => (
                  <div key={index} className="flex items-center gap-3 text-slate-300">
                    <Shield className="h-5 w-5 text-[#c9a25c] flex-shrink-0" />
                    {license}
                  </div>
                ))}
                {BUSINESS_CONFIG.credentials.gafCertified && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Award className="h-5 w-5 text-[#c9a25c] flex-shrink-0" />
                    GAF Master Elite Contractor
                  </div>
                )}
                {BUSINESS_CONFIG.credentials.owensCorningPreferred && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Award className="h-5 w-5 text-[#c9a25c] flex-shrink-0" />
                    Owens Corning Preferred Contractor
                  </div>
                )}
                {BUSINESS_CONFIG.credentials.certainteedMaster && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Award className="h-5 w-5 text-[#c9a25c] flex-shrink-0" />
                    CertainTeed SELECT ShingleMaster
                  </div>
                )}
              </div>

              {/* Community */}
              <div className="rounded-xl border border-[#c9a25c]/20 bg-[#c9a25c]/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-[#c9a25c]" />
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#c9a25c]">Community</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Farrell Roofing supports the <strong className="text-slate-100">Itawamba Crossroads Ranch</strong> and is actively involved in training the next generation of skilled roofers in Northeast Mississippi. The region has a shortage of quality installers — Bob and Robert are both committed to changing that.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-12 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-3 text-center">Where we work</p>
          <p className="text-center text-slate-300 mb-4">
            Fulton · Tupelo · Amory · Saltillo · Belmont · and throughout Northeast Mississippi
          </p>
          <div className="flex justify-center">
            <Link
              href="/service-areas"
              className="text-sm text-[#c9a25c] hover:text-[#e6c588] transition-colors flex items-center gap-1"
            >
              Full service area map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
            Get a real number, not a sales pitch.
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Two minutes. Your home's specifics. Northeast Mississippi pricing. Free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <Link href="/contact">
              <Button
                variant="outline"
                size="xl"
                className="border-slate-600 text-slate-300"
                leftIcon={<Phone className="h-5 w-5" />}
              >
                Call us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
