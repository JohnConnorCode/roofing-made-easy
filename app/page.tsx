import { Metadata } from 'next'
import { HomePageContent } from '@/components/home/home-content'
import { ServiceSchema, FAQSchema } from '@/components/seo/json-ld'
import { getBusinessConfigFromDB } from '@/lib/config/business-loader'
import { HOMEPAGE_FAQ_ITEMS } from '@/lib/data/homepage-faq'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getBusinessConfigFromDB()
  return {
    title: `${config.name} | Free Instant Roofing Estimates - ${config.address.city}, ${config.address.stateCode}`,
    description: `Get an instant, accurate roofing estimate in 2 minutes. Explore financing, insurance claim help, and assistance programs. ${config.name} serves ${config.serviceArea.region}.`,
    keywords: [
      'roofing estimate',
      'roof cost calculator',
      'free roofing quote',
      `${config.address.city} roofer`,
      `${config.serviceArea.region} roofing`,
      'roof replacement cost',
      'roof repair estimate',
      'instant roofing estimate',
    ],
    openGraph: {
      title: `Know Your Roof Cost in 2 Minutes | ${config.name}`,
      description: `Get an instant, honest roof estimate built from real local pricing. Plus guidance on insurance, financing, and assistance to make it happen.`,
      url: BASE_URL,
      siteName: config.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/api/og?type=website&title=Know%20Your%20Roof%20Cost%20in%202%20Minutes&subtitle=Honest%20Estimates%20%E2%80%A2%20Free%20%E2%80%A2%20No%20Pressure`,
          width: 1200,
          height: 630,
          alt: `${config.name} - Free Roofing Estimates`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.name} | Free Roofing Estimates`,
      description: `Get an instant roofing estimate in 2 minutes. Honest pricing for ${config.serviceArea.region}.`,
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
