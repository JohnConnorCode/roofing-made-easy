import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  usePathname: () => '/',
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  }),
  headers: () => new Headers(),
}))

// Mock next/cache (revalidateTag, unstable_cache, etc.)
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: (fn: Function) => fn,
}))

// Mock business config loader (uses unstable_cache + Supabase internally)
vi.mock('@/lib/config/business-loader', () => ({
  getBusinessConfigFromDB: vi.fn(async () => ({
    name: 'Smart Roof Pricing',
    legalName: 'Farrell Roofing LLC',
    tagline: "Northeast Mississippi's Smart Roofing Estimates",
    foundedYear: '2010',
    phone: { raw: '+1-662-555-0123', display: '(662) 555-0123', isReal: true },
    email: { primary: 'info@smartroofpricing.com', support: 'support@smartroofpricing.com' },
    address: { street: '123 Main Street', city: 'Tupelo', state: 'Mississippi', stateCode: 'MS', zip: '38801', country: 'United States', countryCode: 'US', isReal: true },
    coordinates: { lat: 34.2576, lng: -88.7034 },
    hours: { weekdays: { open: '7:00 AM', close: '6:00 PM' }, saturday: { open: '8:00 AM', close: '2:00 PM' }, sunday: null, emergencyAvailable: true },
    social: { facebook: null, instagram: null, twitter: null, linkedin: null, youtube: null, pinterest: null, yelp: null, bbb: null, googleBusiness: null, houzz: null, homeadvisor: null, angieslist: null },
    verification: { google: null, bing: null, yandex: null, pinterest: null },
    credentials: { gafCertified: true, owensCorningPreferred: true, certainteedMaster: false, bbbAccredited: true, stateLicensed: true, stateContractorLicense: null },
    reviews: { googleRating: null, googleReviewCount: null, featured: [] },
    serviceArea: { radiusMiles: 50, primaryCity: 'Tupelo', region: 'Northeast Mississippi' },
    pricing: { roofReplacement: { min: 8000, max: 25000 }, roofRepair: { min: 300, max: 3000 }, inspection: { min: 150, max: 500 }, stormDamage: { min: 1000, max: 15000 } },
  })),
}))
