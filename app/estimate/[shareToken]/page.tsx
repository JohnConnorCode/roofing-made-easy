import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicEstimateView } from './PublicEstimateView'

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
    adjustments: Array<{ name: string; impact: number; description: string }> | null
    valid_until: string | null
    created_at: string
    is_superseded: boolean
  }>
}

// This is a server component that fetches data and passes to client
export default async function SharedEstimatePage({ params }: Props) {
  const { shareToken } = await params
  const supabase = await createClient()

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
        adjustments,
        valid_until,
        created_at,
        is_superseded
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
      factors={estimate.adjustments || []}
      validUntil={estimate.valid_until ?? undefined}
    />
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { shareToken } = await params

  return {
    title: 'Your Roofing Estimate | Farrell Roofing',
    description: 'View your personalized roofing estimate from Farrell Roofing.',
    robots: {
      index: false, // Don't index individual estimates
      follow: false,
    },
    openGraph: {
      title: 'Your Roofing Estimate | Farrell Roofing',
      description: 'View your personalized roofing estimate from Farrell Roofing.',
      type: 'website',
    },
  }
}
