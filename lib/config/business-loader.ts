import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { BUSINESS_CONFIG, type BusinessConfig } from './business'

type SettingsRow = Record<string, unknown>

/**
 * Maps a flat DB settings row to the nested BusinessConfig shape.
 * DB values override hardcoded defaults; missing/null values fall back to BUSINESS_CONFIG.
 */
function mergeWithDefaults(row: SettingsRow): BusinessConfig {
  const social = (row.social_links ?? {}) as Record<string, string | null>
  const credentials = (row.credentials ?? {}) as Record<string, unknown>
  const reviewsConfig = (row.reviews_config ?? {}) as Record<string, unknown>
  const serviceArea = (row.service_area ?? {}) as Record<string, unknown>
  const pricingRanges = (row.pricing_ranges ?? {}) as Record<string, Record<string, number>>
  const verificationCodes = (row.verification_codes ?? {}) as Record<string, string | null>

  return {
    name: (row.company_name as string) ?? BUSINESS_CONFIG.name,
    legalName: (row.company_legal_name as string) ?? BUSINESS_CONFIG.legalName,
    tagline: (row.company_tagline as string) ?? BUSINESS_CONFIG.tagline,
    foundedYear: (row.company_founded_year as string) ?? BUSINESS_CONFIG.foundedYear,

    phone: {
      raw: (row.company_phone_raw as string) ?? BUSINESS_CONFIG.phone.raw,
      display: (row.company_phone as string) ?? BUSINESS_CONFIG.phone.display,
      isReal: BUSINESS_CONFIG.phone.isReal, // always from config - not DB-managed
    },

    email: {
      primary: (row.company_email as string) ?? BUSINESS_CONFIG.email.primary,
      support: (row.company_email_support as string) ?? BUSINESS_CONFIG.email.support,
    },

    address: {
      street: (row.address_street as string) ?? BUSINESS_CONFIG.address.street,
      city: (row.address_city as string) ?? BUSINESS_CONFIG.address.city,
      state: (row.address_state as string) ?? BUSINESS_CONFIG.address.state,
      stateCode: (row.address_state_code as string) ?? BUSINESS_CONFIG.address.stateCode,
      zip: (row.address_zip as string) ?? BUSINESS_CONFIG.address.zip,
      country: (row.address_country as string) ?? BUSINESS_CONFIG.address.country,
      countryCode: (row.address_country_code as string) ?? BUSINESS_CONFIG.address.countryCode,
      isReal: BUSINESS_CONFIG.address.isReal, // always from config
    },

    coordinates: {
      lat: (row.coordinates_lat as number) ?? BUSINESS_CONFIG.coordinates.lat,
      lng: (row.coordinates_lng as number) ?? BUSINESS_CONFIG.coordinates.lng,
    },

    hours: {
      weekdays: {
        open: (row.hours_weekdays_open as string) ?? BUSINESS_CONFIG.hours.weekdays.open,
        close: (row.hours_weekdays_close as string) ?? BUSINESS_CONFIG.hours.weekdays.close,
      },
      saturday: {
        open: (row.hours_saturday_open as string) ?? BUSINESS_CONFIG.hours.saturday.open,
        close: (row.hours_saturday_close as string) ?? BUSINESS_CONFIG.hours.saturday.close,
      },
      sunday: (row.hours_sunday_open && row.hours_sunday_close)
        ? { open: row.hours_sunday_open as string, close: row.hours_sunday_close as string }
        : BUSINESS_CONFIG.hours.sunday,
      emergencyAvailable: (row.hours_emergency_available as boolean) ?? BUSINESS_CONFIG.hours.emergencyAvailable,
    },

    social: {
      facebook: (social.facebook ?? BUSINESS_CONFIG.social.facebook) as string | null,
      instagram: (social.instagram ?? BUSINESS_CONFIG.social.instagram) as string | null,
      twitter: (social.twitter ?? BUSINESS_CONFIG.social.twitter) as string | null,
      linkedin: (social.linkedin ?? BUSINESS_CONFIG.social.linkedin) as string | null,
      youtube: (social.youtube ?? BUSINESS_CONFIG.social.youtube) as string | null,
      pinterest: (social.pinterest ?? BUSINESS_CONFIG.social.pinterest) as string | null,
      yelp: (social.yelp ?? BUSINESS_CONFIG.social.yelp) as string | null,
      bbb: (social.bbb ?? BUSINESS_CONFIG.social.bbb) as string | null,
      googleBusiness: (social.googleBusiness ?? BUSINESS_CONFIG.social.googleBusiness) as string | null,
      houzz: (social.houzz ?? BUSINESS_CONFIG.social.houzz) as string | null,
      homeadvisor: (social.homeadvisor ?? BUSINESS_CONFIG.social.homeadvisor) as string | null,
      angieslist: (social.angieslist ?? BUSINESS_CONFIG.social.angieslist) as string | null,
    },

    verification: {
      google: (verificationCodes.google ?? BUSINESS_CONFIG.verification.google) as string | null,
      bing: (verificationCodes.bing ?? BUSINESS_CONFIG.verification.bing) as string | null,
      yandex: (verificationCodes.yandex ?? BUSINESS_CONFIG.verification.yandex) as string | null,
      pinterest: (verificationCodes.pinterest ?? BUSINESS_CONFIG.verification.pinterest) as string | null,
    },

    credentials: {
      gafCertified: (credentials.gafCertified as boolean) ?? BUSINESS_CONFIG.credentials.gafCertified,
      owensCorningPreferred: (credentials.owensCorningPreferred as boolean) ?? BUSINESS_CONFIG.credentials.owensCorningPreferred,
      certainteedMaster: (credentials.certainteedMaster as boolean) ?? BUSINESS_CONFIG.credentials.certainteedMaster,
      bbbAccredited: (credentials.bbbAccredited as boolean) ?? BUSINESS_CONFIG.credentials.bbbAccredited,
      stateLicensed: (credentials.stateLicensed as boolean) ?? BUSINESS_CONFIG.credentials.stateLicensed,
      stateContractorLicense: (credentials.stateContractorLicense as string | null) ?? BUSINESS_CONFIG.credentials.stateContractorLicense,
    },

    reviews: {
      googleRating: (reviewsConfig.googleRating as number | null) ?? BUSINESS_CONFIG.reviews.googleRating,
      googleReviewCount: (reviewsConfig.googleReviewCount as number | null) ?? BUSINESS_CONFIG.reviews.googleReviewCount,
      featured: (reviewsConfig.featured as BusinessConfig['reviews']['featured']) ?? BUSINESS_CONFIG.reviews.featured,
    },

    serviceArea: {
      radiusMiles: (serviceArea.radiusMiles as number) ?? BUSINESS_CONFIG.serviceArea.radiusMiles,
      primaryCity: (serviceArea.primaryCity as string) ?? BUSINESS_CONFIG.serviceArea.primaryCity,
      region: (serviceArea.region as string) ?? BUSINESS_CONFIG.serviceArea.region,
    },

    pricing: {
      roofReplacement: pricingRanges.roofReplacement ?? BUSINESS_CONFIG.pricing.roofReplacement,
      roofRepair: pricingRanges.roofRepair ?? BUSINESS_CONFIG.pricing.roofRepair,
      inspection: pricingRanges.inspection ?? BUSINESS_CONFIG.pricing.inspection,
      stormDamage: pricingRanges.stormDamage ?? BUSINESS_CONFIG.pricing.stormDamage,
    },
  } as BusinessConfig
}

/**
 * Cross-request cache with 5-min TTL and revalidateTag support.
 * When admin saves settings, revalidateTag('business-config') busts this cache.
 */
const fetchConfigFromDB = unstable_cache(
  async (): Promise<BusinessConfig> => {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
      if (!data) return BUSINESS_CONFIG
      return mergeWithDefaults(data as SettingsRow)
    } catch {
      return BUSINESS_CONFIG
    }
  },
  ['business-config'],
  { revalidate: 300, tags: ['business-config'] }
)

/**
 * Primary server-side function for getting business config.
 * Uses React's cache() for per-request deduplication on top of unstable_cache.
 * 10 components on the same page = 1 DB call.
 */
export const getBusinessConfigFromDB = cache(fetchConfigFromDB)
