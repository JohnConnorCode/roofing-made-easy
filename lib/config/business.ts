// =============================================================================
// BUSINESS CONFIGURATION - EDIT THIS FILE WITH REAL DATA BEFORE LAUNCH
// =============================================================================
//
// IMPORTANT: Replace ALL placeholder values below with real business information.
// Using placeholder data in production will hurt SEO and may trigger Google penalties.
//
// =============================================================================

export const BUSINESS_CONFIG = {
  // -------------------------------------------------------------------------
  // COMPANY INFORMATION
  // -------------------------------------------------------------------------
  name: 'Farrell Roofing',
  legalName: 'Farrell Roofing LLC',
  tagline: "Northeast Mississippi's Trusted Roofing Experts",
  foundedYear: '2010',

  // -------------------------------------------------------------------------
  // CONTACT INFORMATION
  // -------------------------------------------------------------------------
  // NOTE: Update these with your real business info
  phone: {
    raw: '+1-662-555-0123',      // E.164 format for schema
    display: '(662) 555-0123',   // Display format
    // Set to true once you have updated with real phone number
    isReal: true, // CHANGE TO false IF USING PLACEHOLDER
  },

  email: {
    primary: 'info@smartroofpricing.com',
    support: 'support@smartroofpricing.com',
  },

  // -------------------------------------------------------------------------
  // PHYSICAL ADDRESS
  // -------------------------------------------------------------------------
  // NOTE: Update these with your real business address
  address: {
    street: '123 Main Street',
    city: 'Tupelo',
    state: 'Mississippi',
    stateCode: 'MS',
    zip: '38801',
    country: 'United States',
    countryCode: 'US',
    // Set to true once you have updated with real address
    isReal: true, // CHANGE TO false IF USING PLACEHOLDER
  },

  // -------------------------------------------------------------------------
  // GPS COORDINATES - REPLACE WITH REAL DATA
  // -------------------------------------------------------------------------
  coordinates: {
    // TODO: Replace with actual business location coordinates
    // Get from: https://www.latlong.net/
    lat: 34.2576,
    lng: -88.7034,
  },

  // -------------------------------------------------------------------------
  // BUSINESS HOURS
  // -------------------------------------------------------------------------
  hours: {
    weekdays: { open: '07:00', close: '18:00' },
    saturday: { open: '08:00', close: '14:00' },
    sunday: null, // closed
    emergencyAvailable: true,
  },

  // -------------------------------------------------------------------------
  // SOCIAL MEDIA & EXTERNAL PROFILES - REPLACE WITH REAL URLS
  // -------------------------------------------------------------------------
  social: {
    // TODO: Replace with actual profile URLs or set to null if not applicable
    facebook: null as string | null,      // e.g., 'https://www.facebook.com/smartroofpricing'
    instagram: null as string | null,     // e.g., 'https://www.instagram.com/smartroofpricing'
    twitter: null as string | null,       // e.g., 'https://twitter.com/smartroofpricing'
    linkedin: null as string | null,      // e.g., 'https://www.linkedin.com/company/smartroofpricing'
    youtube: null as string | null,       // e.g., 'https://www.youtube.com/@smartroofpricing'
    pinterest: null as string | null,
    yelp: null as string | null,          // e.g., 'https://www.yelp.com/biz/smart-roof-pricing-tupelo'
    bbb: null as string | null,           // e.g., 'https://www.bbb.org/...'
    googleBusiness: null as string | null, // e.g., 'https://www.google.com/maps?cid=YOUR_CID'
    houzz: null as string | null,
    homeadvisor: null as string | null,
    angieslist: null as string | null,
  },

  // -------------------------------------------------------------------------
  // VERIFICATION CODES - ADD WHEN YOU SET UP THESE SERVICES
  // -------------------------------------------------------------------------
  verification: {
    // TODO: Add verification codes from each platform
    google: null,        // Google Search Console verification code
    bing: null,          // Bing Webmaster verification code
    yandex: null,        // Yandex verification code
    pinterest: null,     // Pinterest verification code
  },

  // -------------------------------------------------------------------------
  // CERTIFICATIONS & CREDENTIALS
  // -------------------------------------------------------------------------
  credentials: {
    // TODO: Set to true only if you actually have these certifications
    gafCertified: false,
    owensCorningPreferred: false,
    certainteedMaster: false,
    bbbAccredited: false,
    stateLicensed: false,
    stateContractorLicense: null, // e.g., 'MS-12345'
  },

  // -------------------------------------------------------------------------
  // REVIEWS & RATINGS - ONLY USE REAL DATA
  // -------------------------------------------------------------------------
  reviews: {
    // TODO: Replace with actual review data from Google Business Profile
    // DO NOT use fake reviews - Google can detect and penalize this
    googleRating: null,      // e.g., 4.9
    googleReviewCount: null, // e.g., 127
    // Only include reviews you have explicit permission to use
    featured: [] as Array<{
      author: string
      text: string
      rating: number
      date: string
      source: 'google' | 'facebook' | 'yelp' | 'direct'
      verified: boolean
    }>,
  },

  // -------------------------------------------------------------------------
  // SERVICE AREA CONFIGURATION
  // -------------------------------------------------------------------------
  serviceArea: {
    radiusMiles: 75,
    primaryCity: 'Tupelo',
    region: 'Northeast Mississippi',
  },

  // -------------------------------------------------------------------------
  // PRICING (for schema - use ranges)
  // -------------------------------------------------------------------------
  pricing: {
    roofReplacement: { min: 8000, max: 25000 },
    roofRepair: { min: 300, max: 5000 },
    inspection: { min: 0, max: 250 }, // 0 if free
    stormDamage: { min: 500, max: 15000 },
  },
} as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the business configuration object
 * Used by communication services for templating
 */
export function getBusinessConfig(): BusinessConfig {
  return BUSINESS_CONFIG
}

export function getPhoneLink(): string {
  return `tel:${BUSINESS_CONFIG.phone.raw.replace(/[^+\d]/g, '')}`
}

export function getPhoneDisplay(): string {
  return BUSINESS_CONFIG.phone.display
}

export function getFullAddress(): string {
  const { street, city, stateCode, zip } = BUSINESS_CONFIG.address
  return `${street}, ${city}, ${stateCode} ${zip}`
}

export function getShortAddress(): string {
  const { city, stateCode } = BUSINESS_CONFIG.address
  return `${city}, ${stateCode}`
}

export function getSocialLinks(): string[] {
  return Object.values(BUSINESS_CONFIG.social).filter((url): url is string => url !== null)
}

export function hasRealContactInfo(): boolean {
  return BUSINESS_CONFIG.phone.isReal && BUSINESS_CONFIG.address.isReal
}

export function hasVerifiedReviews(): boolean {
  return BUSINESS_CONFIG.reviews.googleRating !== null &&
         BUSINESS_CONFIG.reviews.googleReviewCount !== null
}

// Validation function - call during build to warn about placeholders
export function validateBusinessConfig(): string[] {
  const warnings: string[] = []

  if (!BUSINESS_CONFIG.phone.isReal) {
    warnings.push('WARNING: Phone number is placeholder data - update phone.raw and phone.display')
  }
  if (!BUSINESS_CONFIG.address.isReal) {
    warnings.push('WARNING: Address is placeholder data - update address fields')
  }
  if (getSocialLinks().length === 0) {
    warnings.push('WARNING: No social media profiles configured - consider adding Facebook or Google Business')
  }
  if (!hasVerifiedReviews()) {
    warnings.push('WARNING: No verified reviews configured - review schemas disabled')
  }
  if (!BUSINESS_CONFIG.verification.google) {
    warnings.push('WARNING: Google Search Console not verified')
  }
  if (!BUSINESS_CONFIG.credentials.stateContractorLicense) {
    warnings.push('WARNING: State contractor license not configured')
  }

  // Check if any certification flags are true
  const certFlags = [
    BUSINESS_CONFIG.credentials.gafCertified,
    BUSINESS_CONFIG.credentials.owensCorningPreferred,
    BUSINESS_CONFIG.credentials.certainteedMaster,
    BUSINESS_CONFIG.credentials.bbbAccredited,
    BUSINESS_CONFIG.credentials.stateLicensed,
  ]
  if (!certFlags.some(v => v)) {
    warnings.push('WARNING: No certifications configured (GAF, Owens Corning, etc.)')
  }

  return warnings
}

/**
 * Run validation and log warnings
 * Call this in build scripts or server startup
 */
export function runBusinessConfigValidation(): void {
  const warnings = validateBusinessConfig()

  if (warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.log('\n' + '='.repeat(60))
    // eslint-disable-next-line no-console
    console.log('BUSINESS CONFIGURATION WARNINGS')
    // eslint-disable-next-line no-console
    console.log('='.repeat(60))
    // eslint-disable-next-line no-console
    warnings.forEach((warning) => console.log(`  ${warning}`))
    // eslint-disable-next-line no-console
    console.log('='.repeat(60))
    // eslint-disable-next-line no-console
    console.log('Update lib/config/business.ts before production deployment')
    // eslint-disable-next-line no-console
    console.log('='.repeat(60) + '\n')
  }
}

/**
 * Build-time validation - blocks deployment if placeholder data in production
 * This runs at import time on production builds
 */
function validateProductionConfig(): void {
  // VERCEL_ENV is set by Vercel during deployment (production, preview, or development)
  // This distinguishes actual Vercel deployments from local `npm run build`
  const isVercelProduction = process.env.VERCEL_ENV === 'production'
  const bypassCheck = process.env.BYPASS_CONFIG_CHECK === 'true'

  // Only block on actual Vercel production deployments, not local builds
  if (isVercelProduction && !bypassCheck) {
    if (!BUSINESS_CONFIG.phone.isReal) {
      throw new Error(
        'DEPLOYMENT BLOCKED: Phone number is placeholder data. ' +
        'Update BUSINESS_CONFIG.phone.isReal to true after setting real phone number in lib/config/business.ts'
      )
    }
    if (!BUSINESS_CONFIG.address.isReal) {
      throw new Error(
        'DEPLOYMENT BLOCKED: Address is placeholder data. ' +
        'Update BUSINESS_CONFIG.address.isReal to true after setting real address in lib/config/business.ts'
      )
    }
  }
}

// Run validation at module import time (build time)
validateProductionConfig()

/**
 * Check if configuration is production-ready
 */
export function isProductionReady(): boolean {
  return BUSINESS_CONFIG.phone.isReal &&
         BUSINESS_CONFIG.address.isReal
}

/**
 * Structured config warnings for admin settings page setup checklist
 */
export interface ConfigWarning {
  field: string
  label: string
  severity: 'critical' | 'recommended' | 'optional'
  configured: boolean
}

export function getConfigWarnings(): ConfigWarning[] {
  return [
    { field: 'phone', label: 'Business phone number', severity: 'critical', configured: BUSINESS_CONFIG.phone.isReal },
    { field: 'address', label: 'Business address', severity: 'critical', configured: BUSINESS_CONFIG.address.isReal },
    { field: 'coordinates', label: 'GPS coordinates', severity: 'recommended', configured: BUSINESS_CONFIG.coordinates.lat !== 34.2576 || BUSINESS_CONFIG.coordinates.lng !== -88.7034 },
    { field: 'social.googleBusiness', label: 'Google Business profile', severity: 'recommended', configured: BUSINESS_CONFIG.social.googleBusiness !== null },
    { field: 'social.facebook', label: 'Facebook page', severity: 'optional', configured: BUSINESS_CONFIG.social.facebook !== null },
    { field: 'verification.google', label: 'Google Search Console', severity: 'recommended', configured: BUSINESS_CONFIG.verification.google !== null },
    { field: 'credentials.stateLicensed', label: 'State contractor license', severity: 'recommended', configured: BUSINESS_CONFIG.credentials.stateLicensed },
    { field: 'credentials.stateContractorLicense', label: 'License number', severity: 'recommended', configured: BUSINESS_CONFIG.credentials.stateContractorLicense !== null },
    { field: 'reviews.googleRating', label: 'Google reviews', severity: 'recommended', configured: BUSINESS_CONFIG.reviews.googleRating !== null },
    { field: 'credentials.gafCertified', label: 'GAF certification', severity: 'optional', configured: BUSINESS_CONFIG.credentials.gafCertified },
    { field: 'credentials.owensCorningPreferred', label: 'Owens Corning preferred', severity: 'optional', configured: BUSINESS_CONFIG.credentials.owensCorningPreferred },
    { field: 'credentials.bbbAccredited', label: 'BBB accreditation', severity: 'optional', configured: BUSINESS_CONFIG.credentials.bbbAccredited },
  ]
}

// Export type for use elsewhere
export type BusinessConfig = typeof BUSINESS_CONFIG
