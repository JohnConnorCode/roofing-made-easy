import { Metadata } from 'next'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { BreadcrumbSchema } from '@/components/seo/list-schema'
import InsuranceContent from '@/components/insurance/insurance-content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

export const metadata: Metadata = {
  title: `Roof Insurance Claim Help | Storm & Hail Damage Guide | ${BUSINESS_CONFIG.name}`,
  description: `Free resources to navigate your roof insurance claim. Step-by-step filing guides, documentation checklists, adjuster prep tips, and claim tracking tools for ${BUSINESS_CONFIG.serviceArea.region} homeowners.`,
  keywords: [
    'roof insurance claim',
    'storm damage roof',
    'hail damage roof',
    'roof insurance claim process',
    'roof damage documentation',
    'insurance adjuster tips',
    `${BUSINESS_CONFIG.address.city} storm damage`,
    'Mississippi roof insurance',
  ],
  openGraph: {
    title: `Roof Insurance Claim Help | ${BUSINESS_CONFIG.name}`,
    description: `Free guides and tools to navigate your roof insurance claim. Document damage, file correctly, and track your claim.`,
    url: `${BASE_URL}/insurance-help`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Insurance%20Claim%20Help&subtitle=Free%20Guides%20%E2%80%A2%20Checklists%20%E2%80%A2%20Claim%20Tracking`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} Insurance Help`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Roof Insurance Claim Help | ${BUSINESS_CONFIG.name}`,
    description: `Free resources to navigate your roof insurance claim. Guides, checklists, and tracking tools.`,
  },
  alternates: {
    canonical: `${BASE_URL}/insurance-help`,
  },
}

export default function InsuranceHelpPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Insurance Help', url: `${BASE_URL}/insurance-help` },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <InsuranceContent />
    </>
  )
}
