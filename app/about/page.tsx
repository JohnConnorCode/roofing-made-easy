import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { teamMembers, companyInfo, isRealTeamData } from '@/lib/data/team'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import {
  Award,
  Shield,
  ArrowRight,
  Phone,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { OrganizationSchema, AboutPageSchema, BreadcrumbSchema } from '@/components/seo/list-schema'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `About Us | Family-Owned Roofing Since ${BUSINESS_CONFIG.foundedYear} | ${BUSINESS_CONFIG.name}`,
  description: `Learn about ${BUSINESS_CONFIG.name} - a family-owned roofing company serving ${BUSINESS_CONFIG.address.city} and ${BUSINESS_CONFIG.serviceArea.region} since ${BUSINESS_CONFIG.foundedYear}. Licensed, insured, and committed to quality.`,
  keywords: [
    BUSINESS_CONFIG.name,
    `${BUSINESS_CONFIG.address.city} roofing company`,
    'family-owned roofer',
    'local roofing contractor',
    `${BUSINESS_CONFIG.serviceArea.region} roofer`,
  ],
  openGraph: {
    title: `About ${BUSINESS_CONFIG.name} | ${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.stateCode}`,
    description: `Family-owned roofing company serving ${BUSINESS_CONFIG.serviceArea.region} since ${BUSINESS_CONFIG.foundedYear}.`,
    url: `${BASE_URL}/about`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=website&title=About%20${encodeURIComponent(BUSINESS_CONFIG.name)}&subtitle=Family-Owned%20Since%20${BUSINESS_CONFIG.foundedYear}`,
        width: 1200,
        height: 630,
        alt: `About ${BUSINESS_CONFIG.name}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${BUSINESS_CONFIG.name}`,
    description: `Family-owned roofing company in ${BUSINESS_CONFIG.serviceArea.region} since ${BUSINESS_CONFIG.foundedYear}.`,
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
      {/* Structured Data */}
      <AboutPageSchema />
      <OrganizationSchema
        description={companyInfo.description}
        numberOfEmployees="45+"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
                About {companyInfo.name}
              </h1>
              <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
                {companyInfo.description}
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden animate-slide-up delay-200">
              <Image
                src="/images/about/team-work.jpg"
                alt="Farrell Roofing team at work"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
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
                  {BUSINESS_CONFIG.credentials.gafCertified && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Award className="h-5 w-5 text-[#c9a25c]" />
                      GAF Master Elite Contractor
                    </div>
                  )}
                  {BUSINESS_CONFIG.credentials.owensCorningPreferred && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Award className="h-5 w-5 text-[#c9a25c]" />
                      Owens Corning Preferred Contractor
                    </div>
                  )}
                  {BUSINESS_CONFIG.credentials.certainteedMaster && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Award className="h-5 w-5 text-[#c9a25c]" />
                      CertainTeed SELECT ShingleMaster
                    </div>
                  )}
                  {BUSINESS_CONFIG.credentials.bbbAccredited && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Award className="h-5 w-5 text-[#c9a25c]" />
                      BBB A+ Rating
                    </div>
                  )}
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

      {/* Team - Only show when real team data is available */}
      {isRealTeamData && (
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
      )}

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
