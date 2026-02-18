import { Metadata } from 'next'
import { HomePageContent } from '@/components/home/home-content'
import { ServiceSchema, FAQSchema } from '@/components/seo/json-ld'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { HOMEPAGE_FAQ_ITEMS } from '@/lib/data/homepage-faq'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `${BUSINESS_CONFIG.name} | Free Instant Roofing Estimates - ${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.stateCode}`,
  description: `Get an instant, accurate roofing estimate in 2 minutes. Explore financing, insurance claim help, and 50+ assistance programs. ${BUSINESS_CONFIG.name} serves ${BUSINESS_CONFIG.serviceArea.region} with AI-powered pricing, a customer portal, and tools to go from estimate to new roof.`,
  keywords: [
    'roofing estimate',
    'roof cost calculator',
    'free roofing quote',
    `${BUSINESS_CONFIG.address.city} roofer`,
    `${BUSINESS_CONFIG.serviceArea.region} roofing`,
    'roof replacement cost',
    'roof repair estimate',
    'instant roofing estimate',
  ],
  openGraph: {
    title: `Know Your Roof Cost in 2 Minutes | ${BUSINESS_CONFIG.name}`,
    description: `Stop guessing what your roof costs. Get an instant, accurate estimate based on 50,000+ roofing projects. Free, no pressure, no contractors calling.`,
    url: BASE_URL,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=website&title=Know%20Your%20Roof%20Cost%20in%202%20Minutes&subtitle=AI-Powered%20Estimates%20%E2%80%A2%20Free%20%E2%80%A2%20No%20Pressure`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} - Free Roofing Estimates`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS_CONFIG.name} | Free Roofing Estimates`,
    description: `Get an instant roofing estimate in 2 minutes. AI-powered pricing for ${BUSINESS_CONFIG.serviceArea.region}.`,
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function HomePage() {
  return (
    <>
      {/* Schema.org structured data */}
      <ServiceSchema />
      <FAQSchema items={HOMEPAGE_FAQ_ITEMS} />

      {/* Page Content */}
      <HomePageContent />
    </>
  )
}
