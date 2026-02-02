/**
 * Estimate Content Data
 *
 * Static content for professional customer-facing estimates.
 * This data is used by the EstimateDocument component to display
 * a comprehensive, professional proposal.
 */

import { BUSINESS_CONFIG, getPhoneDisplay, getFullAddress } from '@/lib/config/business'
import { getFeaturedTestimonials } from './testimonials'
import type { JobType, RoofMaterial } from '@/lib/supabase/types'

// =============================================================================
// COMPANY INFORMATION
// =============================================================================

export const COMPANY_INFO = {
  name: BUSINESS_CONFIG.name,
  legalName: BUSINESS_CONFIG.legalName,
  tagline: BUSINESS_CONFIG.tagline,
  phone: getPhoneDisplay(),
  email: BUSINESS_CONFIG.email.primary,
  address: getFullAddress(),
  foundedYear: BUSINESS_CONFIG.foundedYear,
  credentials: [
    'Licensed & Insured',
    'Locally Owned & Operated',
    '24/7 Emergency Service',
  ],
  serviceArea: BUSINESS_CONFIG.serviceArea.region,
}

// =============================================================================
// WARRANTY INFORMATION
// =============================================================================

export interface WarrantyInfo {
  type: 'workmanship' | 'manufacturer' | 'extended'
  name: string
  duration: string
  description: string
  highlights: string[]
}

export const WARRANTIES: WarrantyInfo[] = [
  {
    type: 'workmanship',
    name: 'Workmanship Warranty',
    duration: '10 Years',
    description:
      'Our workmanship warranty covers all labor and installation for a full 10 years. If any issues arise from our installation, we fix it at no cost to you.',
    highlights: [
      'Covers all labor and installation',
      'No deductibles or hidden fees',
      'Transferable to new homeowners',
    ],
  },
  {
    type: 'manufacturer',
    name: 'Manufacturer Warranty',
    duration: '25-50 Years',
    description:
      'All materials come with full manufacturer warranties. We only use premium materials from trusted brands that stand behind their products.',
    highlights: [
      'Covers material defects',
      'Prorated or lifetime options',
      'Registered in your name',
    ],
  },
  {
    type: 'extended',
    name: 'Extended Protection',
    duration: 'Available',
    description:
      'Ask about extended warranty options for complete peace of mind. Enhanced coverage is available for qualifying installations.',
    highlights: [
      'No-leak guarantee',
      'Annual inspections included',
      'Priority service response',
    ],
  },
]

// =============================================================================
// SCOPE OF WORK BY JOB TYPE
// =============================================================================

export interface ScopeItem {
  title: string
  description: string
  included: boolean
}

export interface ScopeOfWorkConfig {
  title: string
  items: ScopeItem[]
}

export const SCOPE_OF_WORK: Record<JobType | 'default', ScopeOfWorkConfig> = {
  full_replacement: {
    title: 'Complete Roof Replacement',
    items: [
      {
        title: 'Tear-Off & Disposal',
        description:
          'Complete removal of existing roofing materials, disposed at licensed facility',
        included: true,
      },
      {
        title: 'Deck Inspection & Repair',
        description:
          'Thorough inspection of roof decking with repair/replacement of damaged sections',
        included: true,
      },
      {
        title: 'Ice & Water Shield',
        description:
          'Self-adhering membrane installed at valleys, eaves, and penetrations',
        included: true,
      },
      {
        title: 'Synthetic Underlayment',
        description:
          'Premium synthetic underlayment for superior moisture protection',
        included: true,
      },
      {
        title: 'Roofing Material Installation',
        description: 'Professional installation of selected roofing materials',
        included: true,
      },
      {
        title: 'Flashing & Trim Work',
        description:
          'New step flashing, drip edge, and all necessary trim components',
        included: true,
      },
      {
        title: 'Ventilation',
        description: 'Ridge vent or other ventilation per code requirements',
        included: true,
      },
      {
        title: 'Cleanup & Final Inspection',
        description:
          'Complete site cleanup and thorough final inspection with homeowner walkthrough',
        included: true,
      },
    ],
  },
  repair: {
    title: 'Roof Repair',
    items: [
      {
        title: 'Damage Assessment',
        description: 'Thorough inspection to identify all damage areas',
        included: true,
      },
      {
        title: 'Material Matching',
        description: 'Source matching materials for seamless repair',
        included: true,
      },
      {
        title: 'Repair Work',
        description:
          'Professional repair of damaged shingles, flashing, or components',
        included: true,
      },
      {
        title: 'Sealant Application',
        description: 'Weatherproof sealing of all repaired areas',
        included: true,
      },
      {
        title: 'Cleanup & Inspection',
        description: 'Site cleanup and repair verification',
        included: true,
      },
    ],
  },
  inspection: {
    title: 'Roof Inspection',
    items: [
      {
        title: 'Visual Inspection',
        description: 'Complete visual inspection of roofing materials',
        included: true,
      },
      {
        title: 'Structural Assessment',
        description: 'Check for sagging, damage, or structural concerns',
        included: true,
      },
      {
        title: 'Flashing & Penetrations',
        description: 'Inspect all flashings, vents, and roof penetrations',
        included: true,
      },
      {
        title: 'Gutter Evaluation',
        description: 'Check gutters and drainage systems',
        included: true,
      },
      {
        title: 'Written Report',
        description: 'Detailed report with photos and recommendations',
        included: true,
      },
    ],
  },
  maintenance: {
    title: 'Roof Maintenance',
    items: [
      {
        title: 'Debris Removal',
        description: 'Clear leaves, branches, and debris from roof surface',
        included: true,
      },
      {
        title: 'Gutter Cleaning',
        description: 'Clean and flush gutters and downspouts',
        included: true,
      },
      {
        title: 'Minor Repairs',
        description: 'Address minor issues like loose shingles or small gaps',
        included: true,
      },
      {
        title: 'Sealant Touch-Up',
        description: 'Reseal around vents, pipes, and flashings as needed',
        included: true,
      },
      {
        title: 'Condition Report',
        description: 'Summary of roof condition and recommendations',
        included: true,
      },
    ],
  },
  gutter: {
    title: 'Gutter Services',
    items: [
      {
        title: 'Gutter Removal',
        description: 'Safe removal of existing gutter system if replacing',
        included: true,
      },
      {
        title: 'Fascia Inspection',
        description: 'Check fascia boards for rot or damage',
        included: true,
      },
      {
        title: 'Gutter Installation',
        description: 'Professional installation of seamless gutters',
        included: true,
      },
      {
        title: 'Downspout Routing',
        description: 'Proper downspout placement for optimal drainage',
        included: true,
      },
      {
        title: 'Gutter Guards',
        description: 'Optional gutter protection system',
        included: false,
      },
    ],
  },
  commercial: {
    title: 'Commercial Roofing',
    items: [
      {
        title: 'Site Assessment',
        description: 'Comprehensive commercial roof evaluation',
        included: true,
      },
      {
        title: 'System Specification',
        description: 'Engineered roofing system design',
        included: true,
      },
      {
        title: 'Material Procurement',
        description: 'Commercial-grade materials and components',
        included: true,
      },
      {
        title: 'Professional Installation',
        description: 'Certified commercial installation crew',
        included: true,
      },
      {
        title: 'Quality Assurance',
        description: 'Multi-point inspection and documentation',
        included: true,
      },
    ],
  },
  solar_installation: {
    title: 'Solar Panel Coordination',
    items: [
      {
        title: 'Roof Assessment',
        description: 'Evaluate roof condition for solar readiness',
        included: true,
      },
      {
        title: 'Structural Review',
        description: 'Verify roof can support solar panel weight',
        included: true,
      },
      {
        title: 'Roof Prep/Repair',
        description: 'Address any issues before solar installation',
        included: true,
      },
      {
        title: 'Flashing Coordination',
        description: 'Proper flashing around solar mounting points',
        included: true,
      },
      {
        title: 'Warranty Coordination',
        description: 'Ensure roof warranty compatibility with solar',
        included: true,
      },
    ],
  },
  other: {
    title: 'Custom Project',
    items: [
      {
        title: 'Project Assessment',
        description: 'Detailed evaluation of your specific needs',
        included: true,
      },
      {
        title: 'Custom Proposal',
        description: 'Tailored scope based on project requirements',
        included: true,
      },
      {
        title: 'Material Selection',
        description: 'Help selecting the right materials',
        included: true,
      },
      {
        title: 'Professional Execution',
        description: 'Expert workmanship on all project elements',
        included: true,
      },
      {
        title: 'Final Walkthrough',
        description: 'Complete review with homeowner approval',
        included: true,
      },
    ],
  },
  default: {
    title: 'Roofing Project',
    items: [
      {
        title: 'Initial Assessment',
        description: 'Thorough evaluation of your roofing needs',
        included: true,
      },
      {
        title: 'Material Selection',
        description: 'Quality materials from trusted manufacturers',
        included: true,
      },
      {
        title: 'Professional Installation',
        description: 'Expert installation by trained crews',
        included: true,
      },
      {
        title: 'Quality Inspection',
        description: 'Final inspection to ensure quality standards',
        included: true,
      },
      {
        title: 'Site Cleanup',
        description: 'Complete cleanup and debris removal',
        included: true,
      },
    ],
  },
}

// =============================================================================
// MATERIALS BY ROOF TYPE
// =============================================================================

export interface MaterialSpec {
  name: string
  description: string
  brand?: string
}

export interface MaterialsConfig {
  primary: MaterialSpec
  underlayment: MaterialSpec
  ventilation: MaterialSpec
  accessories: MaterialSpec
}

export const MATERIALS_BY_TYPE: Record<RoofMaterial | 'default', MaterialsConfig> = {
  asphalt_shingle: {
    primary: {
      name: 'Architectural Shingles',
      description: 'High-performance dimensional shingles with enhanced durability and aesthetics',
      brand: 'Owens Corning, GAF, or CertainTeed',
    },
    underlayment: {
      name: 'Synthetic Underlayment',
      description: 'Superior moisture barrier with excellent tear resistance',
    },
    ventilation: {
      name: 'Ridge Vent System',
      description: 'Continuous ridge ventilation for optimal attic airflow',
    },
    accessories: {
      name: 'Starter Strip & Hip/Ridge',
      description: 'Pre-cut starter strips and matching hip/ridge caps',
    },
  },
  metal: {
    primary: {
      name: 'Standing Seam Metal',
      description: 'Premium concealed fastener metal roofing for maximum durability',
    },
    underlayment: {
      name: 'High-Temp Underlayment',
      description: 'Metal-rated synthetic underlayment for heat resistance',
    },
    ventilation: {
      name: 'Metal Ridge Vent',
      description: 'Color-matched ventilation designed for metal roofing',
    },
    accessories: {
      name: 'Trim & Flashing',
      description: 'Custom-formed trim, drip edge, and transition flashings',
    },
  },
  tile: {
    primary: {
      name: 'Concrete/Clay Tile',
      description: 'Premium tile roofing with decades of proven performance',
    },
    underlayment: {
      name: 'Two-Ply Underlayment',
      description: 'Heavy-duty underlayment system for tile applications',
    },
    ventilation: {
      name: 'Tile Roof Vents',
      description: 'Low-profile vents designed for tile roof aesthetics',
    },
    accessories: {
      name: 'Ridge & Hip Tiles',
      description: 'Matching ridge and hip tiles with proper adhesive',
    },
  },
  slate: {
    primary: {
      name: 'Natural Slate',
      description: 'Genuine slate tiles for timeless beauty and longevity',
    },
    underlayment: {
      name: 'Premium Underlayment',
      description: 'High-performance underlayment for slate installations',
    },
    ventilation: {
      name: 'Copper Vents',
      description: 'Quality copper ventilation components',
    },
    accessories: {
      name: 'Copper Flashing',
      description: 'Premium copper flashings and accessories',
    },
  },
  wood_shake: {
    primary: {
      name: 'Cedar Shakes',
      description: 'Premium cedar shake or shingle roofing',
    },
    underlayment: {
      name: 'Breathable Underlayment',
      description: 'Vapor-permeable underlayment for wood roofing',
    },
    ventilation: {
      name: 'Ridge Ventilation',
      description: 'Cedar-compatible ridge vent system',
    },
    accessories: {
      name: 'Starter & Ridge',
      description: 'Cedar starter courses and ridge treatment',
    },
  },
  flat_membrane: {
    primary: {
      name: 'TPO/EPDM Membrane',
      description: 'Commercial-grade single-ply roofing membrane',
    },
    underlayment: {
      name: 'Cover Board',
      description: 'High-density polyiso cover board',
    },
    ventilation: {
      name: 'Low-Profile Vents',
      description: 'Flat roof compatible ventilation curbs',
    },
    accessories: {
      name: 'Flashings & Terminations',
      description: 'Membrane flashings and edge terminations',
    },
  },
  unknown: {
    primary: {
      name: 'Quality Roofing Material',
      description: 'Premium materials selected for your specific application',
    },
    underlayment: {
      name: 'Synthetic Underlayment',
      description: 'Quality underlayment for moisture protection',
    },
    ventilation: {
      name: 'Proper Ventilation',
      description: 'Code-compliant ventilation system',
    },
    accessories: {
      name: 'Trim & Accessories',
      description: 'All necessary trim and accessory components',
    },
  },
  default: {
    primary: {
      name: 'Quality Roofing Material',
      description: 'Premium materials from trusted manufacturers',
    },
    underlayment: {
      name: 'Synthetic Underlayment',
      description: 'Superior moisture barrier protection',
    },
    ventilation: {
      name: 'Ventilation System',
      description: 'Proper attic ventilation per code requirements',
    },
    accessories: {
      name: 'Trim & Accessories',
      description: 'All necessary flashings, drip edge, and components',
    },
  },
}

// =============================================================================
// PAYMENT TERMS
// =============================================================================

export interface PaymentTerm {
  name: string
  percent: number
  description: string
}

export const PAYMENT_TERMS: PaymentTerm[] = [
  {
    name: 'Deposit',
    percent: 30,
    description: 'Due upon signing to secure your project date and order materials',
  },
  {
    name: 'Progress Payment',
    percent: 40,
    description: 'Due when materials are delivered to your property',
  },
  {
    name: 'Final Payment',
    percent: 30,
    description: 'Due upon completion and final walkthrough approval',
  },
]

export const FINANCING_OPTIONS = {
  available: true,
  description:
    'Flexible financing options available for qualified homeowners. Ask about our 0% interest promotions and low monthly payment plans.',
  cta: 'Pre-Qualify for Financing',
}

// =============================================================================
// TESTIMONIALS FOR ESTIMATE
// =============================================================================

export function getEstimateTestimonials() {
  return getFeaturedTestimonials(3)
}

// =============================================================================
// TERMS AND CONDITIONS
// =============================================================================

export const TERMS_AND_CONDITIONS = [
  'This estimate is valid for 30 days from the date shown.',
  'Work typically begins within 2-4 weeks of signed agreement, weather permitting.',
  'Homeowner provides access to water and electricity on-site.',
  'Final price may vary if hidden damage is discovered during work.',
  'All work performed in accordance with local building codes.',
  'Permits obtained and inspections scheduled as required.',
  'Material colors may vary slightly from samples due to manufacturing.',
  'Change orders for additional work require written approval.',
  'Standard cleanup is included; dumpster placement area required.',
]

// =============================================================================
// NEXT STEPS
// =============================================================================

export interface NextStep {
  step: number
  title: string
  description: string
  icon: 'document' | 'calculator' | 'calendar' | 'handshake'
}

export const NEXT_STEPS: NextStep[] = [
  {
    step: 1,
    title: 'Review This Estimate',
    description: 'Take your time to review the details and pricing options',
    icon: 'document',
  },
  {
    step: 2,
    title: 'Choose Your Package',
    description: 'Consider which option best fits your needs and budget',
    icon: 'calculator',
  },
  {
    step: 3,
    title: 'Schedule Consultation',
    description: 'Book your free on-site consultation for exact pricing',
    icon: 'calendar',
  },
  {
    step: 4,
    title: 'Finalize Details',
    description: "We'll confirm everything and get your project scheduled",
    icon: 'handshake',
  },
]

export const ESTIMATE_CTA_MESSAGE =
  "This is your personalized starting point - let's discuss your project and finalize the details together!"
