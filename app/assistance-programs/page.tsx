import { Metadata } from 'next'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { BreadcrumbSchema } from '@/components/seo/list-schema'
import AssistanceContent from '@/components/assistance/assistance-content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

export const metadata: Metadata = {
  title: `Roof Assistance Programs | Grants & Financial Help | ${BUSINESS_CONFIG.name}`,
  description: `Find roofing grants, low-income assistance programs, USDA rural repair grants, FEMA disaster relief, and nonprofit help. Free eligibility screening for ${BUSINESS_CONFIG.serviceArea.region} homeowners.`,
  keywords: [
    'roof assistance programs',
    'roofing grants',
    'low-income roof repair',
    'USDA roof grant',
    'FEMA roof assistance',
    'free roof repair programs',
    'roof financial assistance',
    `${BUSINESS_CONFIG.address.city} roof assistance`,
    'Mississippi roofing assistance',
  ],
  openGraph: {
    title: `Roof Assistance Programs | ${BUSINESS_CONFIG.name}`,
    description: `Find grants, loans, and rebates to help fund your new roof. Free eligibility screening available.`,
    url: `${BASE_URL}/assistance-programs`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Assistance%20Programs&subtitle=Grants%20%E2%80%A2%20Loans%20%E2%80%A2%20Rebates%20for%20Homeowners`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} Assistance Programs`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Roof Assistance Programs | ${BUSINESS_CONFIG.name}`,
    description: `Find roofing grants and financial assistance programs. Free eligibility screening.`,
  },
  alternates: {
    canonical: `${BASE_URL}/assistance-programs`,
  },
}

export default function AssistanceProgramsPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Assistance Programs', url: `${BASE_URL}/assistance-programs` },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <AssistanceContent />
    </>
  )
}
