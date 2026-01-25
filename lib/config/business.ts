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
  // CONTACT INFORMATION - REPLACE WITH REAL DATA
  // -------------------------------------------------------------------------
  phone: {
    // TODO: Replace with actual phone number
    raw: '+1-662-555-0123',      // E.164 format for schema
    display: '(662) 555-0123',   // Display format
    // Set to true once you have a real number
    isReal: false,
  },

  email: {
    // TODO: Replace with actual email
    primary: 'info@farrellroofing.com',
    support: 'support@farrellroofing.com',
  },

  // -------------------------------------------------------------------------
  // PHYSICAL ADDRESS - REPLACE WITH REAL DATA
  // -------------------------------------------------------------------------
  address: {
    // TODO: Replace with actual address
    street: '123 Main Street',
    city: 'Tupelo',
    state: 'Mississippi',
    stateCode: 'MS',
    zip: '38801',
    country: 'United States',
    countryCode: 'US',
    // Set to true once you have a real address
    isReal: false,
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
    facebook: null as string | null,      // e.g., 'https://www.facebook.com/farrellroofing'
    instagram: null as string | null,     // e.g., 'https://www.instagram.com/farrellroofing'
    twitter: null as string | null,       // e.g., 'https://twitter.com/farrellroofing'
    linkedin: null as string | null,      // e.g., 'https://www.linkedin.com/company/farrellroofing'
    youtube: null as string | null,       // e.g., 'https://www.youtube.com/@farrellroofing'
    pinterest: null as string | null,
    yelp: null as string | null,          // e.g., 'https://www.yelp.com/biz/farrell-roofing-tupelo'
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
    warnings.push('WARNING: Phone number is placeholder data')
  }
  if (!BUSINESS_CONFIG.address.isReal) {
    warnings.push('WARNING: Address is placeholder data')
  }
  if (getSocialLinks().length === 0) {
    warnings.push('WARNING: No social media profiles configured')
  }
  if (!hasVerifiedReviews()) {
    warnings.push('WARNING: No verified reviews configured - review schemas disabled')
  }
  if (!BUSINESS_CONFIG.verification.google) {
    warnings.push('WARNING: Google Search Console not verified')
  }

  return warnings
}

// Export type for use elsewhere
export type BusinessConfig = typeof BUSINESS_CONFIG
