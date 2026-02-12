import { Metadata } from 'next'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { BreadcrumbSchema } from '@/components/seo/list-schema'
import FinancingContent from '@/components/financing/financing-content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `Roofing Financing Calculator | Monthly Payment Estimator | ${BUSINESS_CONFIG.name}`,
  description: `Calculate affordable monthly payments for your new roof. Flexible financing options from 3-10 years with no credit impact pre-qualification. Serving ${BUSINESS_CONFIG.serviceArea.region}.`,
  keywords: [
    'roofing financing',
    'roof payment calculator',
    'monthly roof payments',
    'no credit impact pre-qualification',
    'roof loan',
    'affordable roofing',
    `${BUSINESS_CONFIG.address.city} roofing financing`,
    'roofing payment plans',
  ],
  openGraph: {
    title: `Roofing Financing Calculator | ${BUSINESS_CONFIG.name}`,
    description: `See what your new roof could cost per month. Flexible financing from 3-10 years with no credit impact pre-qualification.`,
    url: `${BASE_URL}/financing`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Financing%20Calculator&subtitle=Affordable%20Monthly%20Payments%20for%20Your%20New%20Roof`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} Financing Calculator`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Roofing Financing Calculator | ${BUSINESS_CONFIG.name}`,
    description: `Calculate affordable monthly payments for your new roof. Flexible terms, no credit impact pre-qualification.`,
  },
  alternates: {
    canonical: `${BASE_URL}/financing`,
  },
}

export default function FinancingPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Financing', url: `${BASE_URL}/financing` },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FinancingContent />
    </>
  )
}
