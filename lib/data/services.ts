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
  image?: string
  whenToChoose: string[]
  includedSteps: { title: string; body: string }[]
  materialOptions?: {
    name: string
    lifespan: string
    priceRange: string
    pros: string
    cons: string
    bestFor: string
    guideSlug?: string
  }[]
  commonFaqs: { question: string; answer: string }[]
  warranty: { manufacturer: string; workmanship: string }
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
    fullDescription: `A full roof replacement is the complete removal of your existing roofing system — tear-off down to the wood deck — followed by installation of a new system from the ground up. It's not just new shingles over old; it's underlayment, drip edge, flashing at every penetration, ridge ventilation, and a properly nailed finish layer, all done to current building code.

The right time to replace depends on age, condition, and economics. Most asphalt roofs in Northeast Mississippi last 18-25 years before cumulative heat, UV, and storm cycles degrade them beyond economical repair. If repair quotes are stacking up, or if you're seeing granule loss, curling edges, or daylight in the attic, replacement is typically the smarter investment.

What separates a good replacement from a mediocre one is what happens below the shingles: solid deck boards, ice-and-water barrier in the valleys and eaves, a quality synthetic underlayment, and tight flashing at every wall, chimney, and pipe penetration. Shingles handle weather; everything underneath is what makes them last.`,
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
    image: '/images/services/roof-replacement.jpg',
    whenToChoose: [
      'Your roof is 18-25 years old and showing granule loss, curling shingles, or repeated leaks',
      'Repair costs are approaching 30% or more of a replacement estimate',
      'You have significant deck damage, rot, or structural issues below the shingles',
      "You're selling the home and a new roof resolves an inspection flag",
      'Your insurer has approved a full replacement after storm damage',
      'You want impact-resistant materials to qualify for an insurance premium discount',
    ],
    includedSteps: [
      {
        title: 'Pre-project assessment & permit',
        body: "We measure the roof — pitch, square footage, complexity — document existing conditions, and pull the required building permit with your county's building department. This is included in your estimate, not an add-on. Permit processing typically takes 2-4 business days before work can start.",
      },
      {
        title: 'Material delivery & site prep',
        body: "Shingles and materials are staged the morning of the job. We lay tarps along the drip line to protect landscaping, cover the HVAC unit if it's adjacent to the work area, and set up the tear-off dump trailer. Pets should be secured indoors — the noise is significant.",
      },
      {
        title: 'Complete tear-off',
        body: 'The old roofing is removed layer by layer down to the wood deck — shingles, underlayment, and any existing ice barrier. Nails are pulled or set flush. A magnetic roller makes two passes around the full perimeter to collect fasteners from the lawn before we move on.',
      },
      {
        title: 'Deck inspection & repair',
        body: "Every square foot of decking is inspected by hand. Soft spots, rot, damaged OSB or plywood panels are replaced before anything else goes down. This step is non-negotiable: shingles installed over a compromised deck fail early regardless of material quality. Deck repairs are quoted separately if found.",
      },
      {
        title: 'Underlayment, ice barrier & drip edge',
        body: "Ice-and-water barrier is installed in all valleys and along the first 3 feet of every eave. Synthetic felt underlayment covers the remaining deck. Drip edge is installed at all eaves and rakes, directing water off the fascia rather than behind the gutter.",
      },
      {
        title: 'Shingle installation',
        body: "Starter strip is laid along the eaves, then courses of shingles are worked up the slope with correct exposure and the manufacturer's specified nailing pattern — 4 nails per strip minimum, 6 on high-wind zones. Ridge cap is installed last, either with matching 3-tab or a purpose-made ventilating ridge cap depending on your attic's ventilation needs.",
      },
      {
        title: 'Flashing, final walkthrough & cleanup',
        body: "All penetrations are flashed properly: chimney step-flashing, pipe boots, skylight frames, and wall-to-roof junctions. We walk the completed roof with you before cleanup — every valley, every ridge end, gutters cleared of debris. Magnetic pass on the lawn again at close of job.",
      },
    ],
    materialOptions: [
      {
        name: 'Architectural Asphalt Shingles',
        lifespan: '25-30 years',
        priceRange: '$4.50-6.50/sq ft installed',
        pros: 'Wide color range, proven Mississippi performance, insurance-favorable, most contractors trained on them, mid-range cost',
        cons: 'Petroleum-based so heat-sensitive in Mississippi summers, granule loss accelerates after 20 years, not the top wind rating',
        bestFor: 'Standard residential replacement, most budgets, matching existing neighborhood aesthetics',
        guideSlug: 'asphalt-shingles',
      },
      {
        name: 'Impact-Resistant (Class 4) Shingles',
        lifespan: '30-40 years',
        priceRange: '$6.00-9.00/sq ft installed',
        pros: 'Up to 20-30% insurance discount on qualifying MS policies, Class 4 wind and impact rating, longer warranty than standard architectural',
        cons: 'Higher upfront cost, fewer color options than standard lines',
        bestFor: 'Homes in high-hail or high-wind zones, anyone replacing after storm damage, reducing insurance premiums long-term',
        guideSlug: 'impact-resistant-shingles',
      },
      {
        name: 'Standing Seam Metal',
        lifespan: '40-70 years',
        priceRange: '$10.00-18.00/sq ft installed',
        pros: 'Longest residential lifespan, excellent wind resistance (140+ mph), low maintenance, good for low-slope sections, reflects radiant heat',
        cons: 'Highest upfront cost, requires specialized installer, expansion-contraction noise possible, some HOAs restrict',
        bestFor: 'Long-term ownership (15+ years), high-wind exposure, energy-efficient homes, anyone who wants to never replace again',
        guideSlug: 'metal-roofing',
      },
      {
        name: 'Metal Shingles (Steel)',
        lifespan: '40-50 years',
        priceRange: '$8.00-14.00/sq ft installed',
        pros: "Metal longevity with a shingle-like appearance, impact-rated, lighter than tile or slate, doesn't require steep-slope specialist",
        cons: 'More expensive than asphalt, fewer experienced local installers, premium upcharge vs. standing seam',
        bestFor: 'Homeowners wanting metal durability with traditional aesthetics; neighborhoods where standing seam would look out of place',
        guideSlug: 'metal-roofing',
      },
      {
        name: 'Luxury / Designer Shingles',
        lifespan: '30-50 years (varies by line)',
        priceRange: '$8.00-12.00/sq ft installed',
        pros: 'Best appearance of any asphalt option, thicker construction improves impact resistance, long warranty periods, replicates slate or shake look',
        cons: 'Premium price for a product still asphalt-based, limited additional performance over standard Class 4',
        bestFor: 'Higher-end homes where curb appeal and long warranty matter; properties where aesthetics drive the material decision',
        guideSlug: 'asphalt-shingles',
      },
    ],
    commonFaqs: [
      {
        question: 'How long does a roof replacement take?',
        answer: "Most residential roofs in Northeast Mississippi are torn off and replaced in a single day — 1-3 days depending on size, pitch, and weather. A 2,000 sq ft single-story home on a simple gable roof is almost always a one-day job. A larger multi-plane hip roof with steep pitches will take 2-3 days. We don't rush to finish after dark or push into questionable weather. We'll give you a realistic timeline at the estimate stage.",
      },
      {
        question: 'Do I need to be home during the replacement?',
        answer: "You don't need to be home, but we ask someone be reachable by phone. Move vehicles out of the driveway, secure pets indoors, and be available if we find deck damage that changes the scope. We'll do a walkthrough with you before work starts if you're there, and call if anything unexpected comes up. Most homeowners find the process far less disruptive than they expected.",
      },
      {
        question: 'Does a new roof increase my home value?',
        answer: "Yes — reliably. A new roof is one of the few home improvements that comes close to full cost recovery at resale. Buyers and their inspectors focus heavily on roof condition; a replacement flag on an inspection report depresses offers and kills deals. Beyond resale, a new roof typically reduces your homeowner's insurance premium and may qualify you for significant discounts, especially if you install impact-resistant Class 4 shingles.",
      },
      {
        question: 'What happens if it rains during my roof replacement?',
        answer: "Light rain that starts after the old roof is off and underlayment is down isn't a serious issue — quality synthetic underlayment sheds water temporarily. If significant rain is forecast, we'll work with you to adjust the schedule. We'll never leave exposed decking overnight without proper protection. In the rare case that rain interrupts an active job, we tarp the exposed area and return when conditions allow rather than rush a wet installation.",
      },
      {
        question: 'Should I get multiple bids?',
        answer: "Getting 2-3 estimates is reasonable and we encourage it. When comparing, make sure bids specify the same material by name (shingle line, not just 'architectural shingles'), whether tear-off is included, what happens to wood rot found during the job, and what the workmanship warranty covers. A bid that doesn't specify the exact shingle model, nail schedule, and underlayment type isn't a real comparison — it's just a number.",
      },
      {
        question: 'Do you handle the building permit?',
        answer: "Yes. For any full replacement, we pull the required building permit with your county's building department — Lee, Pontotoc, Union, and the others we serve all require permits for full replacements. Permit cost is included in your estimate. We schedule the required inspection and ensure the final paperwork is in order. A roof replaced without a permit creates title problems when you sell.",
      },
      {
        question: 'How do I know if I need replacement vs. repair?',
        answer: "General rule: if your roof is under 15 years old with isolated damage, repair makes sense. If it's over 18-20 years old, has widespread granule loss, or you've had 3+ separate repairs in recent years, replacement is the better investment. We'll tell you honestly which situation you're in at inspection — we don't push replacements on roofs that still have repair life left.",
      },
    ],
    warranty: {
      manufacturer: 'Varies by shingle line: standard architectural 30-year limited; impact-resistant lines 40-50 years; standing seam metal typically lifetime limited. We install products from GAF, Owens Corning, and CertainTeed — all with transferable warranty options.',
      workmanship: '5-year workmanship warranty on all replacement work, covering installation defects: nail popping, improper flashing, inadequate sealing, or any issue attributable to installation quality.',
    },
  },
  {
    id: 'repair',
    slug: 'roof-repair',
    name: 'Roof Repair',
    shortDescription: 'Fix leaks, damaged shingles, and other roofing issues.',
    fullDescription: `Roof repair is targeted work: finding the source of a problem, exposing it cleanly, and sealing it correctly without disturbing sections of the roof that are still sound. A good repair doesn't just stop the current leak — it prevents the next one from starting at the same location.

Most repairs fall into a few categories: shingle replacement (lifting tabs, removing nails, installing new), flashing work (chimney, wall, valley, and pipe boot re-seating), and sealant repairs (caulk failures, skylight frames, soft-metal joints). Leaks rarely originate where water is entering the living space — tracing the actual water path before touching anything is half the work.

The honest question with any repair is whether the roof is worth repairing. If the system is over 18 years old or has widespread granule loss, a repair extends a failing roof by 2-4 years at best. If it's under 15, structurally sound, and the damage is isolated, a proper repair can buy another 7-10 years. We'll tell you which situation you're in — and explain why.`,
    features: [
      'Leak detection and repair',
      'Shingle replacement',
      'Flashing repair and re-seating',
      'Pipe boot and penetration sealing',
      'Storm damage repair',
      'Emergency tarping',
      'Insurance claim documentation',
      'Same-day service available',
    ],
    materials: [
      'Matching shingles',
      'Roofing cement and sealant',
      'Galvanized and aluminum flashing',
      'Rubber membrane patches',
      'Quality ring-shank fasteners',
    ],
    priceRange: '$300 - $3,000',
    timeframe: 'Same day - 1 day',
    icon: 'wrench',
    image: '/images/services/roof-repair.jpg',
    whenToChoose: [
      'Your roof is under 15 years old with isolated damage from a storm or impact event',
      'A single area is leaking and surrounding shingles are still in good condition',
      'Flashing has failed at a chimney, pipe boot, or wall junction',
      'You have a few missing or cracked shingles after a wind event',
      'You want to extend a sound roof\'s life while budgeting for eventual replacement',
    ],
    includedSteps: [
      {
        title: 'Leak diagnosis',
        body: "Water infiltration almost never enters where you see it on the ceiling. We trace the actual water path — checking valleys, flashings, pipe boots, ridge caps, and low points systematically, using a controlled hose test if the source isn't visible — before removing any shingles. Diagnosing the wrong location and patching it is the most common repair failure.",
      },
      {
        title: 'Damage scope & documentation',
        body: "We photograph the damage area before removing anything: shingles lifted, flashing pulled, the full extent visible. This documentation supports insurance claims if the damage was storm-related and gives you an honest record of what was found and what was done.",
      },
      {
        title: 'Material sourcing & matching',
        body: "For shingle repairs, matching the existing shingle profile and color matters both aesthetically and structurally. We carry common profiles on the truck; for discontinued patterns we source matches from local supply houses. A repair that reads as 'patched' from the street is a repair done wrong.",
      },
      {
        title: 'Repair execution',
        body: "Defective material is removed cleanly — minimum disturbance to surrounding areas. New shingles are seated with correct nail placement and sealing strip activation. Flashing repairs involve re-seating the metal, clearing all old sealant fully, and applying appropriate butyl tape or roofing cement — not fresh caulk over failed caulk.",
      },
      {
        title: 'Watertightness verification',
        body: "We test the repair before leaving: either a controlled water test from a hose or inspection after natural rainfall if timing allows. Adjacent areas that look marginal are flagged to you with photos — either for immediate repair or watchful monitoring.",
      },
    ],
    commonFaqs: [
      {
        question: "Why is my ceiling leaking but there's no obvious damage outside?",
        answer: "Water travels before it drips. A leak you see in a bedroom ceiling may have entered through a pipe boot three feet away, then run along a rafter before dropping. This is why tracing the water path — not just patching the nearest shingle — is the actual skill in repair work. We find the entry point before we start removing anything.",
      },
      {
        question: 'How long will a repair last?',
        answer: "A repair done correctly on a sound roof lasts 5-10 years without issues. The key is the underlying condition — if the deck is soft, surrounding shingles are severely degraded, or flashing is fully corroded, a repair addresses one failure point while others are waiting to fail. We'll tell you at the diagnosis stage whether the repair will last or whether you're putting a bandage on a declining system.",
      },
      {
        question: "Will my homeowner's insurance cover roof repair?",
        answer: "Insurance covers sudden and accidental damage — wind, hail, impact — not gradual wear and tear. If your repair is needed because of a storm event, we document the damage before any work and provide the report format adjusters need. If the roof has been deteriorating for years, insurance won't cover it. Check whether your policy has a cosmetic damage exclusion or settles on ACV vs. RCV — that matters significantly if you file a claim.",
      },
      {
        question: 'Can I do a roof repair myself?',
        answer: "Basic shingle replacement on a low-pitch roof is within reach of a careful homeowner — the materials are straightforward. The hard parts are finding the actual leak origin, matching the existing shingle profile closely enough that new shingles don't lift in wind, and getting the nail pattern correct. Flashing repairs are trickier and more consequence-heavy if done wrong. If you're comfortable on a ladder and it's a simple shingle swap, go for it. If not, the cost of a professional repair is modest relative to the water damage from one that doesn't hold.",
      },
      {
        question: 'My roof is 20 years old — is repair still worth it?',
        answer: "Depends on scope. If the repair is isolated — one valley flashing, one pipe boot, a half-dozen shingles — and the rest of the roof is in reasonable shape, a repair buys 2-5 more years at low cost. If you're looking at multiple failing areas or widespread granule loss, you're patching a system on its way out. The most useful thing we can do is give you an honest condition assessment so you can make a real decision — not just fix the immediate problem without context.",
      },
    ],
    warranty: {
      manufacturer: 'Replacement materials carry their standard manufacturer warranty — typically 20-30 years for matching architectural shingles, and standard 20-year warranty for new flashing materials.',
      workmanship: '2-year workmanship warranty. If the same repaired area leaks again within 2 years of our work, we return and fix it at no charge.',
    },
  },
  {
    id: 'inspection',
    slug: 'roof-inspection',
    name: 'Roof Inspection',
    shortDescription: "Professional assessment of your roof's condition.",
    fullDescription: `A roof inspection is a systematic, documented assessment of your roof's current condition — not a sales call in disguise. The goal is to understand what you have: how many years of life remain, what maintenance would extend it, whether damage is present, and whether that damage rises to the level of an insurance claim.

A proper inspection covers the whole system. Exterior: each shingle plane, ridge cap, hip and valley flashings, drip edge, eave and rake edges, all roof penetrations (pipes, vents, skylights, chimneys), fascia, and soffit. Interior: attic ventilation ratios, decking condition from below, signs of moisture or mold, insulation depth. All of it photographed and documented in a written report you keep.

The three moments when an inspection pays for itself most clearly: before buying a home (so you know what you're inheriting), after any significant storm (because insurance claims have time limits and damage evidence fades), and before listing a home (to avoid surprises during buyer due diligence). A $200 inspection is almost always cheaper than the alternative.`,
    features: [
      'Complete exterior shingle-by-shingle survey',
      'Attic inspection (ventilation & moisture)',
      'Detailed photo documentation',
      'Written condition report',
      'Prioritized repair recommendations',
      'Estimated remaining lifespan',
      'Insurance documentation if applicable',
      'Free re-inspection after our repairs',
    ],
    materials: [
      'Drone imaging equipment',
      'Moisture detection tools',
      'Digital documentation system',
    ],
    priceRange: '$150 - $400',
    timeframe: '1-2 hours',
    icon: 'search',
    image: '/images/services/roof-inspection.jpg',
    whenToChoose: [
      "You're buying a home and want an independent, thorough assessment beyond a general home inspection",
      'You had a major storm and want documentation before filing or considering an insurance claim',
      'Your roof is 10+ years old and has never been formally inspected',
      "You're listing your home for sale and want to know what a buyer's inspector will find",
      'You have a small unexplained leak and want a diagnosis, not just a repair quote',
    ],
    includedSteps: [
      {
        title: 'Exterior shingle survey',
        body: "All shingle planes are walked and inspected: granule loss (a sign of UV aging), cupping or curling edges, missing or cracked tabs, nail pops, and hail impact dents. Each plane is photographed and condition-rated. We don't inspect from the ground with binoculars and call it a roof inspection.",
      },
      {
        title: 'Ridge, hip & valley check',
        body: "Ridge caps take the brunt of UV and wind; hip corners and valley intersections concentrate water flow. These areas are checked closely for sealant failure, cracking, and lifted edges — they're the first to fail on an aging roof and the last areas most homeowners think to look.",
      },
      {
        title: 'Flashing inspection',
        body: "Every transition point on the roof — chimney, walls, skylights, vents, pipe boots — is inspected for sealant failure, corrosion, and improper installation. Flashing failures account for more than half of all active residential leaks.",
      },
      {
        title: 'Gutter, fascia & soffit condition',
        body: "Gutters are checked for slope, attachment, and blockage. Fascia boards behind the gutters and soffit panels are inspected for rot, peeling paint (a sign of moisture intrusion), and pest activity. Gutter issues often indicate roof drainage problems that affect shingle life.",
      },
      {
        title: 'Attic inspection',
        body: "The underside of the deck is inspected from the attic: moisture staining, active mold, daylight penetration, and ventilation ratio (net-free vent area vs. attic square footage). Inadequate ventilation cuts shingle life by 30-40% — a problem that shows no symptoms until it's already cost years of lifespan.",
      },
      {
        title: 'Written report & recommendations',
        body: "You receive a written report with photos, condition ratings, estimated remaining lifespan, and prioritized recommendations. Issues are classified as immediate (address now), monitor (check at next inspection), and informational. The report is yours — no pressure attached.",
      },
    ],
    commonFaqs: [
      {
        question: "What's the difference between an inspection and a free estimate?",
        answer: "An estimate answers 'what would it cost to replace or repair your roof?' A proper inspection answers 'what is the current condition and what does it need?' An estimate is a sales process; an inspection is a diagnostic. For most homeowners, an inspection provides more useful information — how many years of life remain, what preventive maintenance would extend it, whether damage is present — especially if you're not actively planning a project.",
      },
      {
        question: 'Can an inspection support an insurance claim?',
        answer: "Yes — and timing matters. Insurance policies require claims to be filed promptly after a loss event, typically within 1-2 years. If you had a significant storm and haven't had your roof assessed, an inspection can document damage that's still present and generate the written report an adjuster needs. We provide documentation in the format that works for claims: dated photos, condition descriptions, and a scope of visible damage.",
      },
      {
        question: 'Do I need an inspection before buying a home?',
        answer: "A general home inspection covers the roof superficially — the inspector notes obvious issues from the ground or a ladder at the eaves. A dedicated roof inspection is more thorough: every shingle plane walked and photographed, attic checked, flashings examined closely. On a home with a roof over 12 years old, or in a region that's seen significant hail or storm events, the cost of a dedicated inspection is modest relative to what it can reveal.",
      },
      {
        question: 'How long does the inspection take?',
        answer: "For most residential homes, 1-2 hours on-site, plus 30-60 minutes to compile the written report. The report is typically delivered same-day or next morning. What drives time is roof complexity — a simple gable is faster than a multi-plane hip roof with dormers, a chimney, and skylights.",
      },
      {
        question: 'What will I receive after the inspection?',
        answer: "A written report covering: overall condition rating, photos of all problem areas, shingle condition by plane, status of all flashings, gutter and drainage assessment, attic ventilation check, estimated remaining lifespan, and prioritized recommendations. No pressure to schedule anything — the report is yours to share with your insurance agent, real estate agent, or any contractor you choose.",
      },
    ],
    warranty: {
      manufacturer: 'N/A — no materials are installed during an inspection.',
      workmanship: 'Free re-inspection if recommended repairs are completed by our team within 90 days.',
    },
  },
  {
    id: 'gutters',
    slug: 'gutters',
    name: 'Gutters & Drainage',
    shortDescription: 'Gutter installation, repair, and maintenance.',
    fullDescription: `Gutters are the drainage system that carries rainwater off your roof and directs it away from your foundation, siding, and landscaping. In Mississippi — where a summer thunderstorm can drop 2 inches of rain in an hour — properly sized and pitched gutters aren't cosmetic; they're structural protection for your home's perimeter.

Seamless gutters are fabricated on-site from a continuous coil of aluminum, cut to the exact length of each run. No joints means no seams, which are the first place sectional gutters fail. A correct installation also sets the proper slope: roughly 1/4 inch of drop per 10 feet toward the downspout — enough to keep water moving without being visible from the ground.

Gutter size matters more than most homeowners realize. Standard 5-inch K-style handles most residential roofs; steeper pitches or large drainage planes need 6-inch to move volume without overflow. Downspout placement — typically one per 30-40 linear feet — and extension routing determine whether water lands 6 feet from your foundation or saturates the soil right against it.`,
    features: [
      'Seamless aluminum gutters fabricated on-site',
      'Custom color matching',
      'Properly sloped installation',
      'Downspout routing away from foundation',
      'Gutter guard options',
      'Cleaning and maintenance',
      'Repair and realignment',
      '5-year installation warranty',
    ],
    materials: [
      '5" and 6" seamless aluminum',
      'Copper gutters (premium)',
      'Half-round aluminum (historic homes)',
      'Gutter guard systems',
      'Heavy-duty concealed hangers',
    ],
    priceRange: '$1,000 - $5,000',
    timeframe: '1 day',
    icon: 'droplet',
    image: '/images/services/process-install.jpg',
    whenToChoose: [
      'Existing gutters are pulling away from the fascia or sagging noticeably along the run',
      'Water pours over the sides during rain events instead of flowing to the downspout',
      'You see paint peeling, staining, or rot on the fascia behind existing gutters',
      "You've had a full roof replacement and want gutters that match and perform correctly",
      'Downspouts are routing water toward the foundation rather than away from it',
    ],
    includedSteps: [
      {
        title: 'Old gutter removal & fascia assessment',
        body: "Existing gutters come down first. Fascia boards are inspected carefully — water-damaged or rotted fascia has to be repaired before new gutters go up, or the new installation will pull away within a year. Fascia repair is quoted separately if found; we won't skip it.",
      },
      {
        title: 'Bracket & hanger layout',
        body: "Hanger locations are marked every 24-30 inches along the fascia run. For longer runs, we calculate the correct drop across the full length before drilling anything — the slope needs to be even and intentional, not corrected by eye at the far end.",
      },
      {
        title: 'Seamless gutter fabrication',
        body: "Aluminum gutter stock is loaded into our on-site forming machine and run out to the exact length of each gutter section in one continuous piece. No joints means no seams to fail down the road. Each section is cut to fit, including the mitered corners.",
      },
      {
        title: 'Installation & downspout placement',
        body: "Gutters are hung, downspout outlets cut, and downspout sections assembled with watertight connections. Downspout extensions are routed away from the foundation — 4-6 feet minimum; more where the grade is flat. Every connection is sealed and tested before we leave.",
      },
      {
        title: 'Slope verification & water test',
        body: "Once installed, we run water through every gutter section: flow rate at the downspout, any ponding in the middle, any drips at end caps or outlets. Adjustments are made on the spot. The test takes 15 minutes and prevents a return visit.",
      },
      {
        title: 'Gutter guard installation (if selected)',
        body: "Guards are fitted to the gutter lip and run the full length of each section. We test them under running water — confirm debris sheds as expected and flow rate isn't restricted by the guard geometry.",
      },
    ],
    materialOptions: [
      {
        name: '5" K-Style Aluminum (Seamless)',
        lifespan: '20 years',
        priceRange: '$8-12/linear ft installed',
        pros: 'Most common residential size, wide color selection, lightweight, rust-proof, cost-effective',
        cons: 'Can overflow on steep or very large roof planes; not sufficient for high-volume drainage areas',
        bestFor: 'Standard single-story homes, modest roof pitches, most residential applications',
      },
      {
        name: '6" K-Style Aluminum (Seamless)',
        lifespan: '20 years',
        priceRange: '$10-15/linear ft installed',
        pros: '40% more water capacity than 5", handles heavy Mississippi rain events, same corrosion-resistant aluminum',
        cons: 'Slightly more expensive; can look visually heavy on smaller or lower-profile homes',
        bestFor: 'Two-story homes, steep pitches, large roof drainage planes, any home that has had overflow issues with 5"',
      },
      {
        name: 'Half-Round Aluminum',
        lifespan: '20-25 years',
        priceRange: '$12-18/linear ft installed',
        pros: 'Traditional appearance, debris flows through more easily than K-style, period-appropriate for older homes',
        cons: 'Less volume capacity per inch than K-style, requires specific hanger style, fewer contractor options',
        bestFor: 'Historic or craftsman homes, bungalows, anyone wanting a period-correct gutter profile',
      },
      {
        name: 'Copper',
        lifespan: '50+ years',
        priceRange: '$25-40/linear ft installed',
        pros: 'Effectively permanent material, develops an attractive patina over time, signals craftsmanship and quality',
        cons: 'Highest cost by far, requires soldering by a specialist, cannot touch dissimilar metals without corrosion',
        bestFor: 'High-end or historic homes where permanence and aesthetics justify the premium',
      },
    ],
    commonFaqs: [
      {
        question: 'How do I know if I need new gutters or just a repair?',
        answer: "Gutters that are pulling away at isolated points or have one or two leaking seams are good repair candidates. Gutters that sag along multiple runs, have widespread seam failures, are bent or crushed in multiple places, or are dragging rotted fascia with them — those need to come down. Seamless aluminum is inexpensive enough that if more than 30-40% of the run has problems, replacement is almost always the better value.",
      },
      {
        question: 'Are gutter guards worth it?',
        answer: "It depends on your tree situation and how much you value not cleaning gutters. High-quality micro-mesh guards do reduce cleaning frequency significantly on homes with heavy leaf drop. They don't eliminate cleaning entirely — debris accumulates on top and needs to be brushed off annually. For a home with large overhanging oaks, a quality guard system paying for itself over 5-7 years in avoided cleaning is reasonable math. For a home with minimal trees, probably not worth the cost.",
      },
      {
        question: 'Do seamless gutters actually prevent leaks better than sectional?',
        answer: "Yes, significantly. Sectional gutters have a joint every 10 feet; each joint is sealed with caulk that fails over time, especially through Mississippi's summer heat expansion. Seamless gutters run the full length of each section in one piece — joints only at corners, outlets, and end caps. Three or four potential failure points per run instead of ten.",
      },
      {
        question: 'Can gutters damage my foundation?',
        answer: "Improperly draining gutters are one of the more common causes of foundation problems in this region. When gutters overflow — from blockage or undersizing — water concentrates right at the drip line, saturating the soil against the foundation. In clay-heavy Mississippi soils, repeated wet-dry cycles cause significant movement. Downspout extensions that route water 4-6 feet away from the foundation aren't optional; they're structural protection.",
      },
      {
        question: 'What color should I choose?',
        answer: "Most homeowners match gutters to the fascia, soffit, or trim color — white, off-white, or whatever the trim color is. Aluminum gutters are available in 20-30 standard colors and can be painted later if you repaint the house. The color choice doesn't affect performance. What does affect performance: size (5\" vs. 6\") and downspout count and placement. Those decisions are driven by roof geometry, not aesthetics.",
      },
    ],
    warranty: {
      manufacturer: 'Aluminum seamless gutters carry a 20-year material warranty against rust, corrosion, and material defect. Gutter guard systems carry manufacturer-specific warranties, which we document and provide to you at completion.',
      workmanship: '5-year installation warranty covering hangers, brackets, end caps, and all sealant joints.',
    },
  },
  {
    id: 'maintenance',
    slug: 'roof-maintenance',
    name: 'Roof Maintenance',
    shortDescription: "Preventive care to extend your roof's life.",
    fullDescription: `A roof maintenance visit isn't just cleaning gutters and leaving. Done properly, it's a systematic check of every area that tends to fail first — sealants, flashing joints, ridge caps, valley intersections — combined with removal of debris, moss, and anything holding moisture against the surface.

Maintenance extends roof life by catching small failures before they become large ones. A cracked pipe boot sealant is a $40 repair in October; ignored, it becomes a $1,500 water-damage repair in March after a winter of slow leaks. Gutters pulling away from the fascia are a two-hour fix; left alone, they undermine the soffit, cause fascia rot, and eventually require carpentry work before gutters can even be re-hung.

In Northeast Mississippi's climate, the main threats to an aging roof are UV degradation, wind-lifted edges, algae and moss growth from humidity, and debris accumulation in valleys. Annual maintenance addresses all of them. Roofs that are maintained consistently reach the high end of their rated lifespan; those that aren't rarely do.`,
    features: [
      'Annual or bi-annual inspection visits',
      'Debris and moss removal',
      'Gutter cleaning and flush',
      'Minor repairs included in visit',
      'Flashing and sealant inspection',
      'Priority scheduling for plan members',
      'Written maintenance records kept on file',
      'Supports manufacturer warranty documentation',
    ],
    materials: [
      'Roof sealants and butyl tape',
      'Touch-up materials',
      'Algae treatment (zinc sulfate)',
      'Gutter flushing equipment',
    ],
    priceRange: '$200 - $500/year',
    timeframe: '2-3 hours per visit',
    icon: 'shield',
    image: '/images/services/roof-inspection.jpg',
    whenToChoose: [
      "Your roof is 5+ years old and hasn't been professionally assessed in the past year",
      'You have heavy tree cover that drops debris onto the roof regularly',
      "You've had any prior water intrusion or known repair history",
      "You want to maintain documentation supporting your manufacturer's warranty",
      'Pre-storm season (spring or early fall) to find vulnerabilities before weather arrives',
    ],
    includedSteps: [
      {
        title: 'Debris removal',
        body: "Leaves, pine straw, and branches are cleared from all valleys, ridges, and flat areas where they accumulate and trap moisture. Moss or algae growth is treated with an appropriate zinc-sulfate solution — pressure washing is too aggressive and strips granules from asphalt shingles.",
      },
      {
        title: 'Gutter clear-out',
        body: "Gutters are flushed from the high end toward the downspout: loose debris removed by hand first, then flushed with water. Downspout openings confirmed clear. Any gutter-to-fascia pull-outs noted and addressed during the visit.",
      },
      {
        title: 'Flashing & sealant inspection',
        body: "Every pipe boot, chimney flashing, skylight frame, wall-junction, and ridge-cap sealant is checked for cracking, peeling, or separation. Hardened or failed caulk is fully removed before fresh sealant is applied — never over the top of old material.",
      },
      {
        title: 'Shingle condition update',
        body: "A visual pass records any new damage since the last visit: cracked, slipped, or cupped shingles; hail dents; lifted edges in high-wind zones. Minor repairs — replacing individual shingles, re-nailing lifted tabs — are completed during the visit as included work.",
      },
      {
        title: 'Ventilation & attic spot check',
        body: "Ridge vent and soffit vent openings are confirmed unobstructed. If attic access is available, a quick check for moisture staining or dark spots on the decking — catching ventilation issues early prevents accelerated aging of the shingle system.",
      },
      {
        title: 'Maintenance record update',
        body: "A written record of the visit — what was found, what was repaired, what to watch for — is left with you and kept on file. This documentation is useful for warranty claims and insurance requests, and gives any future contractor a clear history of the roof's condition over time.",
      },
    ],
    commonFaqs: [
      {
        question: 'How often should I have my roof maintained?',
        answer: "Annual maintenance is the right cadence for most Mississippi roofs. The combination of summer UV, August heat, humidity-driven algae, and storm season creates enough ongoing stress that once-a-year visits catch issues before they escalate. Newer roofs on simple structures can extend to every other year. Older roofs (15+ years), heavily treed properties, or roofs with prior water intrusion should be seen annually.",
      },
      {
        question: "What's included in a maintenance visit?",
        answer: "Debris and moss removal, gutter flush, full flashing and sealant inspection with touch-up of any failing joints, shingle condition assessment, minor repairs (replacing lifted shingles, re-nailing tabs, re-seating pipe boots), ventilation check, and a written record of findings. Minor repairs — up to an hour of work and a handful of shingles — are included. If a visit reveals something larger, we document and quote it separately.",
      },
      {
        question: 'Can I do my own roof maintenance?',
        answer: "Gutter cleaning you can absolutely do yourself if you're comfortable on a ladder. Roof walking is different — it requires the right footwear for the pitch, knowing what to look for, and comfort at height. The value of a professional maintenance visit isn't just the physical work; it's the trained eye on flashing joints, ridge caps, and the subtle signs that something is starting to fail. Most homeowners who walk their own roofs don't recognize a failing step-flashing until it leaks.",
      },
      {
        question: "Does maintenance actually extend the roof's life?",
        answer: "Yes, meaningfully. The main mechanisms: clearing debris removes moisture-holding material from valleys; treating algae and moss prevents root penetration into shingles; catching sealant failures before they become active leaks prevents water from reaching the deck; maintaining clear gutters prevents ice damming at the eaves during cold snaps. A well-maintained asphalt roof consistently reaches the high end of its rated lifespan. One that isn't maintained typically fails 5-8 years early.",
      },
      {
        question: "What if the maintenance visit finds something that needs repair?",
        answer: "We document it with photos, give you a written description of what was found, and quote the repair separately. Minor issues — a split pipe boot, a handful of lifted shingles — can usually be addressed the same day. Larger repairs get scheduled. You're not obligated to proceed with anything beyond the maintenance visit itself.",
      },
    ],
    warranty: {
      manufacturer: 'Minor repair materials installed during maintenance visits carry standard manufacturer warranty.',
      workmanship: 'Work performed during a maintenance visit carries a 1-year workmanship guarantee. If a repaired area fails within 12 months, we return at no charge.',
    },
  },
  {
    id: 'emergency',
    slug: 'emergency-repair',
    name: 'Emergency Repair',
    shortDescription: '24/7 emergency response for urgent roof damage.',
    fullDescription: `Emergency roofing response is about one thing: stopping active damage as fast as possible. When a storm opens a section of your roof, every hour of delay is water reaching decking, insulation, drywall, and framing. Fast tarping or board-up buys time; proper documentation turns that event into an insurance claim.

The most common emergency scenarios in Northeast Mississippi are wind uplift (shingles or whole sections pulling away), impact events (tree limb, hail concentration, debris), and sudden active leaks with no obvious cause. In each case, the first priority is getting the opening covered watertight — a properly weighted, overlapped, and fastened tarp — before any assessment of the full damage scope.

Equally important to the emergency work itself is documentation. Insurance adjusters require evidence: photos of the damage before and during tarping, a written scope of the emergency work performed, and ideally a drone survey showing the full impact area. We provide all of that as standard, because an underdocumented claim routinely comes back at half the actual damage cost.`,
    features: [
      '24/7 availability, 2-4 hour response',
      'Rapid site assessment',
      'Emergency tarping and board-up',
      'Water damage mitigation',
      'Insurance-ready photo documentation',
      'Temporary repairs where feasible',
      'Drone damage survey',
      'Permanent repair scheduling',
    ],
    materials: [
      'Heavy-duty polyethylene tarps',
      'Emergency patching materials',
      'OSB and plywood for board-up',
      'Temporary sealants and membrane',
      'Weighted anchor lumber',
    ],
    priceRange: 'Varies by damage',
    timeframe: 'Same day response',
    icon: 'alert',
    image: '/images/services/storm-damage-repair.jpg',
    whenToChoose: [
      'There is an active leak or water intrusion following a storm or impact event',
      'Wind has visibly lifted, torn, or removed sections of your roofing',
      'A tree limb or fallen object has impacted the roof',
      'You can see exposed decking or daylight through the roof from inside the attic',
      'Your insurer needs mitigation work documented before a permanent repair is made',
    ],
    includedSteps: [
      {
        title: 'Rapid dispatch',
        body: "On receiving your call, we confirm the damage type, address, and whether there's an immediate safety concern. The emergency crew is dispatched with tarps, plywood, and documentation equipment. Response time in Northeast Mississippi is typically 2-4 hours. We give you a realistic ETA when we call back, not a marketing number.",
      },
      {
        title: 'Site safety assessment',
        body: "Before going on the roof, we assess structural safety. If a tree has impacted the roof, we evaluate weight distribution and whether branches need to be moved before tarping. Going onto an unsound deck is a different kind of emergency — one we don't create.",
      },
      {
        title: 'Tarping or board-up',
        body: "Tarps are overlapped 18 inches at all edges, pulled tight, and anchored with weighted 2×4s nailed to the roof — not just draped over the peak. A correctly installed tarp handles 60 mph wind gusts; one thrown on loose does not. Board-up with OSB is used where the opening is too large or structurally complex for tarping.",
      },
      {
        title: 'Damage documentation',
        body: "All visible damage is photographed before, during, and after the protective work: wide establishing shots, close-ups of impact points, and photos of tarp anchoring in progress. This documentation is formatted for insurance submission — adjusters need a clear record of the pre-repair state, and we provide it.",
      },
      {
        title: 'Temporary repair (where feasible)',
        body: "If the opening is small enough and conditions allow, we may make a temporary waterproof repair — roofing cement, membrane patch, or sealed sheathing — rather than relying solely on a tarp. This is safer long-term than a tarp through a week of weather.",
      },
      {
        title: 'Permanent repair scheduling',
        body: "Before leaving, we give you a scope of what permanent repair requires and a realistic timeline to schedule it. If an insurance claim is being filed, we walk you through the documentation you have, what the adjuster will need, and how to ensure the claim reflects the full scope of damage — not just what's immediately visible.",
      },
    ],
    commonFaqs: [
      {
        question: 'How fast can you respond to an emergency?',
        answer: "For Northeast Mississippi — Tupelo, Corinth, Booneville, Oxford, Amory, Columbus, and surrounding communities — we target 2-4 hours from first call to arrival. The actual response time depends on current schedule and distance from our Tupelo base. When you call, we give you a realistic ETA. For active interior water intrusion, the faster we get there, the more damage we prevent.",
      },
      {
        question: 'Should I try to tarp my own roof?',
        answer: "Only if the opening is small, the pitch is manageable, and you have someone spotting from the ground. An improperly installed tarp — not anchored at the perimeter, draped loose over the ridge — does minimal good and can damage the roof surface or blow off in wind. If the damage is significant or the pitch is steep, wait for us. The cost of professional tarping is modest relative to the water damage from one that doesn't hold.",
      },
      {
        question: 'Will my insurance cover emergency repair?',
        answer: "Tarping and emergency stabilization are almost always covered under homeowner's policies as mitigation work — your insurer has an interest in preventing further damage to what they're going to pay to repair. Keep receipts for anything you spend before our arrival. We provide a detailed invoice and photo documentation of the emergency work, which you submit to your adjuster as part of the overall claim.",
      },
      {
        question: 'What should I do immediately after roof damage?',
        answer: "First: don't go on the roof yourself until someone assesses whether it's structurally safe. Move valuables away from wet areas — furniture, electronics, documents. If water is actively entering, put down towels and buckets, and photograph everything. Take photos from outside if you can safely do so from the ground. Call your insurance company to open a claim — starting that clock early matters for some policies' timelines.",
      },
      {
        question: 'How do you document damage for insurance?',
        answer: "We photograph before any work begins — wide establishing shots, close-ups of impact points, photos of the tarp installation in progress, and photos after completion. We provide a written report with the date and time of service, the scope of damage observed, the work performed, and the materials used. If the damage warrants a full replacement, we can also provide a separate written estimate in your adjuster's preferred format.",
      },
    ],
    warranty: {
      manufacturer: 'Temporary tarping materials are protective measures, not permanent installations, and carry no material warranty.',
      workmanship: 'All permanent repairs completed following the emergency response carry our standard 2-year workmanship warranty.',
    },
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}

export function getAllServices(): Service[] {
  return services
}
