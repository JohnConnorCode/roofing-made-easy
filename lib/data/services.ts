/**
 * Services Data
 *
 * Information about roofing services offered.
 * Includes support for city-specific content variations to reduce SEO duplication.
 */

import type { MSCity } from './ms-locations'

export interface Service {
  id: string
  slug: string
  name: string
  shortDescription: string
  fullDescription: string
  features: string[]
  materials: string[]
  priceRange?: string
  timeframe?: string
  icon: string
}

// ============================================================================
// CITY-SPECIFIC CONTENT VARIATIONS
// These helpers generate unique content based on city characteristics
// to reduce duplication across service+city pages
// ============================================================================

interface CityContentVariation {
  priceRange: string
  timeframe: string
  localFactors: string[]
  permitInfo: string
  weatherContext: string
}

/**
 * Get population-based pricing tier
 * Larger cities tend to have higher labor costs
 */
function getPricingTier(population: number): 'low' | 'medium' | 'high' {
  if (population >= 20000) return 'high'
  if (population >= 8000) return 'medium'
  return 'low'
}

/**
 * Get county-specific permit information
 */
function getCountyPermitInfo(county: string): string {
  const permitInfo: Record<string, string> = {
    'Lee': 'Lee County requires building permits for roof replacements. Our team handles all permit applications with the Lee County Building Department.',
    'Pontotoc': 'Pontotoc County building permits are required for full roof replacements. We coordinate directly with county inspectors.',
    'Union': 'Union County requires permits for structural roofing work. Our licensed team manages the entire permit process.',
    'Prentiss': 'Prentiss County has straightforward permitting for residential roofing. We file all necessary paperwork on your behalf.',
    'Alcorn': 'Alcorn County requires building permits for roof replacement projects. Our experienced team navigates local requirements efficiently.',
    'Itawamba': 'Itawamba County permitting for roofing is handled through the county building office. We manage all documentation.',
    'Monroe': 'Monroe County requires permits for major roofing work. We work closely with local building officials.',
    'Chickasaw': 'Chickasaw County has standard permitting requirements. Our team ensures full compliance with local codes.',
    'Lafayette': 'Lafayette County and Oxford have specific building requirements. We ensure full code compliance for every project.',
    'Oktibbeha': 'Oktibbeha County and Starkville have detailed building codes. Our licensed contractors meet all local standards.',
    'Lowndes': 'Lowndes County requires permits for roofing projects. We coordinate with Columbus building officials seamlessly.',
    'Clay': 'Clay County permitting is straightforward. We handle all permit applications for West Point area homes.',
  }
  return permitInfo[county] || 'Local building permits may be required for roof replacement. Our team handles all necessary permits and inspections.'
}

/**
 * Get weather context based on city location
 */
function getWeatherContext(city: MSCity): string {
  // Northern MS cities get more ice/winter weather mentions
  if (city.coordinates.lat > 34.5) {
    return `${city.name}'s northern Mississippi location means occasional ice storms and freeze-thaw cycles that can stress roofing materials. Our team uses materials rated for these conditions.`
  }
  // River valley cities mention humidity
  if (['amory', 'aberdeen', 'columbus', 'west-point'].includes(city.slug)) {
    return `The Tombigbee River valley's high humidity around ${city.name} accelerates algae growth and moisture-related roof issues. We recommend algae-resistant shingles for homes in this area.`
  }
  // College towns mention varied housing stock
  if (['oxford', 'starkville'].includes(city.slug)) {
    return `${city.name}'s mix of historic homes and newer construction near campus requires roofing contractors who understand both preservation and modern building techniques.`
  }
  // Default - tornado/storm focus
  return `${city.name} sits in the Dixie Alley tornado corridor, making storm-resistant roofing materials essential. We recommend impact-rated shingles for maximum protection.`
}

/**
 * Get city-specific content variations for service pages
 */
export function getCityServiceContent(city: MSCity, serviceId: string): CityContentVariation {
  const tier = getPricingTier(city.population)

  // Base price ranges by service and tier
  const priceRanges: Record<string, Record<string, string>> = {
    replacement: {
      low: '$7,000 - $12,000',
      medium: '$8,000 - $15,000',
      high: '$10,000 - $22,000',
    },
    repair: {
      low: '$250 - $2,500',
      medium: '$300 - $3,000',
      high: '$350 - $4,000',
    },
    inspection: {
      low: '$125 - $300',
      medium: '$150 - $350',
      high: '$175 - $400',
    },
    gutters: {
      low: '$800 - $3,500',
      medium: '$1,000 - $4,500',
      high: '$1,200 - $6,000',
    },
    maintenance: {
      low: '$150 - $400/year',
      medium: '$200 - $500/year',
      high: '$250 - $600/year',
    },
    emergency: {
      low: 'Starting at $300',
      medium: 'Starting at $350',
      high: 'Starting at $400',
    },
  }

  // Timeframes can vary slightly by distance from HQ (Tupelo)
  const distanceFromHQ = Math.abs(city.coordinates.lat - 34.2576) + Math.abs(city.coordinates.lng - (-88.7034))
  const timeframeNote = distanceFromHQ > 1 ? ' (travel time may add scheduling flexibility)' : ''

  // Local factors that affect roofing in this area
  const localFactors: string[] = []

  // Population-based factors
  if (city.population >= 20000) {
    localFactors.push(`Higher demand in ${city.name} means we recommend booking 2-3 weeks in advance`)
  } else if (city.population < 3000) {
    localFactors.push(`We offer competitive rural pricing for ${city.name} homeowners`)
  }

  // Weather-based factors from city data
  if (city.localContent.weatherChallenges.some(w => w.toLowerCase().includes('tornado'))) {
    localFactors.push('Impact-rated shingles recommended for storm protection')
  }
  if (city.localContent.weatherChallenges.some(w => w.toLowerCase().includes('humidity'))) {
    localFactors.push('Algae-resistant shingles prevent black streaking')
  }
  if (city.localContent.weatherChallenges.some(w => w.toLowerCase().includes('hail'))) {
    localFactors.push('Class 4 impact-resistant materials available for hail-prone areas')
  }

  // Historic homes factor
  if (city.localContent.commonRoofTypes.some(t => t.toLowerCase().includes('historic'))) {
    localFactors.push(`Experience with historic roof restoration in ${city.name}`)
  }

  return {
    priceRange: priceRanges[serviceId]?.[tier] || 'Contact for estimate',
    timeframe: timeframeNote,
    localFactors,
    permitInfo: getCountyPermitInfo(city.county),
    weatherContext: getWeatherContext(city),
  }
}

/**
 * Get city-specific FAQ answers that vary based on location
 */
export function getCitySpecificFAQs(city: MSCity, serviceId: string): Array<{ question: string; answer: string }> {
  const content = getCityServiceContent(city, serviceId)
  const tier = getPricingTier(city.population)

  const baseFAQs: Record<string, Array<{ question: string; answer: string }>> = {
    replacement: [
      {
        question: `How much does a roof replacement cost in ${city.name}?`,
        answer: `The average roof replacement in ${city.name}, ${city.stateCode} costs ${content.priceRange}, depending on roof size, pitch, materials, and complexity. ${city.population >= 10000 ? 'As a larger city, labor costs may be slightly higher than rural areas.' : 'Our rural-friendly pricing keeps costs competitive for smaller communities.'} We provide free, detailed estimates for all ${city.name} homeowners.`,
      },
      {
        question: `Do I need a permit to replace my roof in ${city.county} County?`,
        answer: content.permitInfo,
      },
      {
        question: `What roofing materials work best in ${city.name}?`,
        answer: `${content.weatherContext} The most popular choices in ${city.name} are ${city.localContent.commonRoofTypes.slice(0, 2).join(' and ').toLowerCase()}. We'll recommend the best option based on your home's style and budget.`,
      },
      {
        question: `How long does a roof replacement take in ${city.name}?`,
        answer: `Most roof replacements in ${city.name} take 1-3 days, weather permitting. ${content.timeframe || ''} We schedule projects to minimize disruption and always complete full cleanup before leaving.`,
      },
    ],
    repair: [
      {
        question: `How much do roof repairs cost in ${city.name}?`,
        answer: `Roof repairs in ${city.name} typically range from ${content.priceRange}. Minor repairs like replacing a few shingles start around ${tier === 'high' ? '$250' : tier === 'medium' ? '$200' : '$175'}. ${city.stats.stormDamageFrequency.toLowerCase().includes('high') ? 'Storm damage repairs may be covered by insurance.' : 'We provide honest assessments so you know exactly what you need.'}`,
      },
      {
        question: `Do you offer emergency roof repair in ${city.name}?`,
        answer: `Yes! We provide 24/7 emergency response throughout ${city.county} County, including ${city.name}. ${city.slug !== 'tupelo' ? `We're based in Tupelo, just ${Math.round(Math.sqrt(Math.pow(city.coordinates.lat - 34.2576, 2) + Math.pow(city.coordinates.lng - (-88.7034), 2)) * 50)} miles away, so we can respond quickly.` : 'As our home base, we can respond to Tupelo emergencies immediately.'}`,
      },
    ],
    inspection: [
      {
        question: `What does a roof inspection in ${city.name} include?`,
        answer: `Our ${city.name} roof inspections include examination of shingles, flashing, ventilation, gutters, and attic space. We document everything with photos and provide a detailed written report. ${content.weatherContext.includes('humidity') ? 'We pay special attention to moisture and ventilation issues common in this area.' : 'We check for storm damage and wear patterns typical of Northeast Mississippi homes.'}`,
      },
      {
        question: `How often should I get my roof inspected in ${city.county} County?`,
        answer: `We recommend annual inspections for ${city.name} homes, plus inspections after any major storm. ${city.stats.stormDamageFrequency.toLowerCase().includes('high') ? 'Given the high storm frequency in this area, post-storm inspections are especially important.' : 'Regular inspections catch small problems before they become expensive repairs.'}`,
      },
    ],
  }

  return baseFAQs[serviceId] || []
}

export const services: Service[] = [
  {
    id: 'replacement',
    slug: 'roof-replacement',
    name: 'Roof Replacement',
    shortDescription: 'Complete tear-off and installation of a new roofing system.',
    fullDescription: 'When repairs are no longer cost-effective, a full roof replacement gives you decades of protection. We remove your old roofing materials down to the deck, inspect and repair any structural issues, and install a complete new roofing system with proper ventilation and flashing.',
    features: [
      'Complete tear-off of existing roof',
      'Deck inspection and repair',
      'New underlayment and ice barrier',
      'Premium shingles or materials of your choice',
      'New flashing and ventilation',
      'Full cleanup and debris removal',
      '25-50 year manufacturer warranty',
      'Workmanship guarantee',
    ],
    materials: [
      'GAF Timberline HDZ Shingles',
      'Owens Corning Duration Series',
      'CertainTeed Landmark Pro',
      'Metal roofing (standing seam)',
      'Synthetic underlayment',
      'Ice and water barrier',
    ],
    priceRange: '$8,000 - $25,000',
    timeframe: '1-3 days',
    icon: 'home',
  },
  {
    id: 'repair',
    slug: 'roof-repair',
    name: 'Roof Repair',
    shortDescription: 'Fix leaks, damaged shingles, and other roofing issues.',
    fullDescription: 'Not every roof problem requires a full replacement. Our repair services address specific issues like leaks, missing shingles, damaged flashing, and storm damage. We\'ll assess the damage and provide honest recommendations on whether repair or replacement makes more sense.',
    features: [
      'Leak detection and repair',
      'Shingle replacement',
      'Flashing repair',
      'Gutter repair',
      'Storm damage repair',
      'Emergency tarping',
      'Insurance claim assistance',
      'Same-day service available',
    ],
    materials: [
      'Matching shingles',
      'Roofing cement and sealant',
      'Galvanized flashing',
      'Rubber membrane patches',
      'Quality fasteners',
    ],
    priceRange: '$300 - $3,000',
    timeframe: 'Same day - 1 day',
    icon: 'wrench',
  },
  {
    id: 'inspection',
    slug: 'roof-inspection',
    name: 'Roof Inspection',
    shortDescription: 'Professional assessment of your roof\'s condition.',
    fullDescription: 'Regular inspections catch small problems before they become expensive repairs. Our certified inspectors examine every aspect of your roof, from shingles to flashing to ventilation. You\'ll receive a detailed report with photos and recommendations.',
    features: [
      'Complete exterior inspection',
      'Attic inspection (ventilation & insulation)',
      'Detailed photo documentation',
      'Written condition report',
      'Repair recommendations',
      'Lifespan estimate',
      'Insurance documentation if needed',
      'Free re-inspection after repairs',
    ],
    materials: [
      'Drone imaging equipment',
      'Moisture detection tools',
      'Thermal imaging camera',
      'Digital documentation system',
    ],
    priceRange: '$150 - $400',
    timeframe: '1-2 hours',
    icon: 'search',
  },
  {
    id: 'gutters',
    slug: 'gutters',
    name: 'Gutters & Drainage',
    shortDescription: 'Gutter installation, repair, and maintenance.',
    fullDescription: 'Proper drainage protects your roof, foundation, and landscaping. We install seamless aluminum gutters custom-fitted to your home, along with downspouts and gutter guards to keep everything flowing properly.',
    features: [
      'Seamless aluminum gutters',
      'Custom color matching',
      'Downspout installation',
      'Gutter guard options',
      'Cleaning and maintenance',
      'Repair and realignment',
      'French drain integration',
      'Lifetime warranty on materials',
    ],
    materials: [
      '5" and 6" seamless aluminum',
      'Copper gutters (premium)',
      'LeafGuard gutter protection',
      'Heavy-duty hangers',
      'Splash blocks and extensions',
    ],
    priceRange: '$1,000 - $5,000',
    timeframe: '1 day',
    icon: 'droplet',
  },
  {
    id: 'maintenance',
    slug: 'roof-maintenance',
    name: 'Roof Maintenance',
    shortDescription: 'Preventive care to extend your roof\'s life.',
    fullDescription: 'A maintenance plan is the most cost-effective way to maximize your roof\'s lifespan. We\'ll clean debris, check for developing issues, clear gutters, and make minor repairs before they become major problems.',
    features: [
      'Annual or bi-annual inspections',
      'Debris removal',
      'Gutter cleaning',
      'Minor repairs included',
      'Priority scheduling',
      'Transferable to new owners',
      'Extends roof warranty',
      'Detailed maintenance records',
    ],
    materials: [
      'Roof sealants and caulks',
      'Touch-up materials',
      'Gutter cleaning tools',
      'Safety equipment',
    ],
    priceRange: '$200 - $500/year',
    timeframe: '2-3 hours per visit',
    icon: 'shield',
  },
  {
    id: 'emergency',
    slug: 'emergency-repair',
    name: 'Emergency Repair',
    shortDescription: '24/7 emergency response for urgent roof damage.',
    fullDescription: 'When disaster strikes, you need help fast. Our emergency team is available 24/7 to respond to storm damage, fallen trees, sudden leaks, and other urgent situations. We\'ll secure your home and prevent further damage.',
    features: [
      '24/7 availability',
      'Rapid response time',
      'Emergency tarping',
      'Water damage mitigation',
      'Insurance documentation',
      'Temporary repairs',
      'Board-up services',
      'Direct insurance billing',
    ],
    materials: [
      'Heavy-duty tarps',
      'Emergency patching materials',
      'Plywood for board-up',
      'Water extraction equipment',
      'Temporary sealants',
    ],
    priceRange: 'Varies by damage',
    timeframe: 'Same day response',
    icon: 'alert',
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}

export function getAllServices(): Service[] {
  return services
}
