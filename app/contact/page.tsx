import { Metadata } from 'next'
import { ContactPageContent } from '@/components/contact/contact-form'
import { ContactPageNAPSchema, NAPSchema } from '@/components/seo/nap-schema'
import { BreadcrumbSchema } from '@/components/seo/list-schema'
import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://smartroofpricing.com'

export const metadata: Metadata = {
  title: `Contact Us | ${BUSINESS_CONFIG.name} - ${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.stateCode}`,
  description: `Contact ${BUSINESS_CONFIG.name} for free roofing estimates in ${BUSINESS_CONFIG.serviceArea.region}. Call ${BUSINESS_CONFIG.phone.display} or send us a message. We respond within 24 hours.`,
  keywords: [
    'contact roofer',
    'roofing estimate',
    `${BUSINESS_CONFIG.address.city} roofing`,
    'roof repair near me',
    'free roofing quote',
    BUSINESS_CONFIG.serviceArea.region,
  ],
  openGraph: {
    title: `Contact ${BUSINESS_CONFIG.name} | Free Roofing Estimates`,
    description: `Get in touch with ${BUSINESS_CONFIG.name} for professional roofing services in ${BUSINESS_CONFIG.serviceArea.region}. Free estimates, 24/7 emergency service.`,
    url: `${BASE_URL}/contact`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=website&title=Contact%20Us&subtitle=Free%20Estimates%20%E2%80%A2%2024hr%20Response`,
        width: 1200,
        height: 630,
        alt: `Contact ${BUSINESS_CONFIG.name}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact ${BUSINESS_CONFIG.name}`,
    description: `Get a free roofing estimate in ${BUSINESS_CONFIG.serviceArea.region}. We respond within 24 hours.`,
  },
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
}

export default function ContactPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Contact', url: `${BASE_URL}/contact` },
  ]

  return (
    <>
      {/* Structured Data */}
      <ContactPageNAPSchema />
      <NAPSchema pageType="contact" />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Page Content */}
      <ContactPageContent />
    </>
  )
}
