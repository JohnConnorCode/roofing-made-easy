import { Metadata } from 'next'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { BreadcrumbSchema } from '@/components/seo/list-schema'
import ReferralContent from '@/components/referral/referral-content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

export const metadata: Metadata = {
  title: `Referral Program | Earn Rewards | ${BUSINESS_CONFIG.name}`,
  description: `Earn cash rewards by referring friends and family to ${BUSINESS_CONFIG.name}. Get up to $100 per referral when their roofing project is completed. No limit on referrals.`,
  keywords: [
    'roofing referral program',
    'refer a roofer',
    'roofing rewards',
    `${BUSINESS_CONFIG.address.city} roofing referral`,
  ],
  openGraph: {
    title: `Referral Program | ${BUSINESS_CONFIG.name}`,
    description: `Earn cash rewards by referring friends to ${BUSINESS_CONFIG.name}. Up to $100 per completed project.`,
    url: `${BASE_URL}/referral`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Referral%20Program&subtitle=Earn%20Cash%20Rewards%20for%20Every%20Referral`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} Referral Program`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Referral Program | ${BUSINESS_CONFIG.name}`,
    description: `Earn cash rewards for referring friends to ${BUSINESS_CONFIG.name}.`,
  },
  alternates: {
    canonical: `${BASE_URL}/referral`,
  },
}

export default function ReferralPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Referral Program', url: `${BASE_URL}/referral` },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ReferralContent />
    </>
  )
}
