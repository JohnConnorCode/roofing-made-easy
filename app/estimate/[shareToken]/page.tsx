import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { PublicEstimateView } from './PublicEstimateView'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

interface Props {
  params: Promise<{ shareToken: string }>
}

// Type for the lead data with relations
interface LeadWithRelations {
  id: string
  share_token: string
  status: string
  contacts: Array<{
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  }> | {
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  } | null
  properties: Array<{
    street_address: string | null
    city: string | null
    state: string | null
    zip_code: string | null
  }> | {
    street_address: string | null
    city: string | null
    state: string | null
    zip_code: string | null
  } | null
  intakes: Array<{
    job_type: string | null
    roof_material: string | null
    roof_size_sqft: number | null
    stories: number | null
    has_skylights: boolean | null
    has_chimneys: boolean | null
    has_solar_panels: boolean | null
  }> | {
    job_type: string | null
    roof_material: string | null
    roof_size_sqft: number | null
    stories: number | null
    has_skylights: boolean | null
    has_chimneys: boolean | null
    has_solar_panels: boolean | null
  } | null
  estimates: Array<{
    id: string
    price_low: number
    price_likely: number
    price_high: number
    ai_explanation: string | null
    ai_explanation_status: string | null
    adjustments: Array<{ name: string; impact: number; description: string }> | null
    valid_until: string | null
    created_at: string
    is_superseded: boolean
    view_count: number | null
  }>
}

// This is a server component that fetches data and passes to client
export default async function SharedEstimatePage({ params }: Props) {
  const { shareToken } = await params

  let supabase
  try {
    supabase = await createAdminClient()
  } catch {
    notFound()
  }

  // Fetch lead by share token (no auth required)
  // Note: share_token column is new and may not be in generated types
  const { data, error: leadError } = await supabase
    .from('leads')
    .select(`
      id,
      share_token,
      status,
      contacts (
        first_name,
        last_name,
        email,
        phone
      ),
      properties (
        street_address,
        city,
        state,
        zip_code
      ),
      intakes (
        job_type,
        roof_material,
        roof_size_sqft,
        stories,
        has_skylights,
        has_chimneys,
        has_solar_panels
      ),
      estimates (
        id,
        price_low,
        price_likely,
        price_high,
        ai_explanation,
        ai_explanation_status,
        adjustments,
        valid_until,
        created_at,
        is_superseded,
        view_count
      )
    `)
    .eq('share_token' as never, shareToken)
    .single()

  const lead = data as LeadWithRelations | null

  if (leadError || !lead) {
    notFound()
  }

  // Get the latest non-superseded estimate
  const estimates = lead.estimates

  const estimate = estimates
    ?.filter(e => !e.is_superseded)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  if (!estimate) {
    notFound()
  }

  // Track estimate view (non-blocking)
  try {
    const viewClient = await createAdminClient()
    await viewClient
      .from('estimates')
      .update({
        viewed_at: new Date().toISOString(),
        view_count: (estimate.view_count || 0) + 1,
      } as never)
      .eq('id', estimate.id)
  } catch {
    // Non-critical - view tracking can fail silently
  }

  // Get contact and property info
  const contact = Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts
  const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties
  const intake = Array.isArray(lead.intakes) ? lead.intakes[0] : lead.intakes

  // Build customer name
  const customerName = contact?.first_name
    ? contact.last_name
      ? `${contact.first_name} ${contact.last_name}`
      : contact.first_name
    : undefined

  return (
    <PublicEstimateView
      leadId={lead.id}
      shareToken={shareToken}
      customerName={customerName}
      propertyAddress={property?.street_address ?? undefined}
      city={property?.city ?? undefined}
      state={property?.state ?? undefined}
      jobType={intake?.job_type ?? undefined}
      roofMaterial={intake?.roof_material ?? undefined}
      roofSizeSqft={intake?.roof_size_sqft ?? undefined}
      priceLow={estimate.price_low}
      priceLikely={estimate.price_likely}
      priceHigh={estimate.price_high}
      explanation={estimate.ai_explanation ?? undefined}
      aiExplanationStatus={(estimate.ai_explanation_status as 'success' | 'fallback' | 'failed') ?? undefined}
      factors={estimate.adjustments || []}
      validUntil={estimate.valid_until ?? undefined}
    />
  )
}

// Type for metadata query result
interface MetadataLeadData {
  properties: Array<{ city: string | null }> | { city: string | null } | null
  intakes: Array<{ job_type: string | null }> | { job_type: string | null } | null
  estimates: Array<{ price_likely: number; is_superseded: boolean; created_at: string }> | null
}

// Helper to fetch estimate data for metadata
async function getEstimateData(shareToken: string) {
  let supabase
  try {
    supabase = await createAdminClient()
  } catch {
    return null
  }

  const { data } = await supabase
    .from('leads')
    .select(`
      properties (city),
      intakes (job_type),
      estimates (price_likely, is_superseded, created_at)
    `)
    .eq('share_token' as never, shareToken)
    .single()

  if (!data) return null

  const lead = data as unknown as MetadataLeadData

  const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties
  const intake = Array.isArray(lead.intakes) ? lead.intakes[0] : lead.intakes
  const estimates = lead.estimates

  const estimate = estimates
    ?.filter(e => !e.is_superseded)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  return {
    city: property?.city || null,
    jobType: intake?.job_type || null,
    price: estimate?.price_likely || null,
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareToken } = await params
  const estimateData = await getEstimateData(shareToken)

  // Build dynamic OG image URL with estimate details
  const ogParams = new URLSearchParams()
  if (estimateData?.price) {
    ogParams.set('price', String(Math.round(estimateData.price)))
  }
  if (estimateData?.city) {
    ogParams.set('city', estimateData.city)
  }
  if (estimateData?.jobType) {
    ogParams.set('jobType', estimateData.jobType)
  }

  const ogImageUrl = `${BASE_URL}/api/og/estimate?${ogParams.toString()}`

  const title = estimateData?.city
    ? `Your Roofing Estimate for ${estimateData.city} | Smart Roof Pricing`
    : 'Your Roofing Estimate | Smart Roof Pricing'

  const description = estimateData?.price
    ? `View your personalized roofing estimate from Smart Roof Pricing. Get detailed pricing and schedule your free consultation.`
    : 'View your personalized roofing estimate from Smart Roof Pricing.'

  return {
    title,
    description,
    robots: {
      index: false, // Don't index individual estimates (privacy)
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Smart Roof Pricing',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Your Personalized Roofing Estimate',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}
