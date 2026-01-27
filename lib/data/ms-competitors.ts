// Mississippi Regional Roofing Competitors Data
// Used for "Best Roofing Companies in [City]" comparison pages

export interface CompetitorCompany {
  id: string
  name: string
  description: string  // 60-80 words, neutral tone
  services: string[]
  yearsInBusiness?: number
  serviceArea: string
}

// Regional competitors serving Northeast Mississippi
// These are generic placeholder companies representing the competitive landscape
export const regionalCompetitors: CompetitorCompany[] = [
  {
    id: 'northeast-ms-roofing',
    name: 'Northeast MS Roofing Co.',
    description: 'A family-owned roofing contractor serving the Northeast Mississippi region. They specialize in residential roof replacement and repair services. The company has built a presence in the area over the years, offering standard roofing solutions including asphalt shingle installations and storm damage repairs. They work with various insurance companies on claims.',
    services: ['Roof Replacement', 'Roof Repair', 'Storm Damage', 'Insurance Claims'],
    yearsInBusiness: 15,
    serviceArea: 'Northeast Mississippi'
  },
  {
    id: 'tupelo-exterior-pros',
    name: 'Tupelo Exterior Pros',
    description: 'A general exterior contractor based in the Tupelo area offering roofing alongside siding and window services. They handle both residential and light commercial projects throughout Lee County and surrounding areas. The company provides multiple exterior renovation services, which may appeal to homeowners seeking a single contractor for various projects.',
    services: ['Roofing', 'Siding', 'Windows', 'Gutters'],
    yearsInBusiness: 12,
    serviceArea: 'Tupelo Metro Area'
  },
  {
    id: 'delta-roofing-solutions',
    name: 'Delta Roofing Solutions',
    description: 'A roofing company with coverage extending from the Mississippi Delta region into Northeast Mississippi. They offer both residential and commercial roofing services with a focus on metal roofing systems. The company serves a wide geographic area, which may affect response times for some locations. They handle large-scale projects.',
    services: ['Metal Roofing', 'Commercial Roofing', 'Residential Roofing', 'Roof Coatings'],
    yearsInBusiness: 20,
    serviceArea: 'North Mississippi'
  },
  {
    id: 'golden-triangle-roofers',
    name: 'Golden Triangle Roofers',
    description: 'Based in the Columbus-Starkville-West Point region, this roofing contractor serves the Golden Triangle and extends service into nearby counties. They focus primarily on residential roofing with some commercial capabilities. The company has experience working in college towns and military housing areas near Columbus Air Force Base.',
    services: ['Roof Replacement', 'Shingle Roofing', 'Flat Roofing', 'Inspections'],
    yearsInBusiness: 18,
    serviceArea: 'Golden Triangle Region'
  },
  {
    id: 'magnolia-state-roofing',
    name: 'Magnolia State Roofing',
    description: 'A statewide roofing contractor with crews serving multiple Mississippi regions including the Northeast corridor. They offer a range of roofing services from basic repairs to complete replacements. As a larger operation, they may have varying crew availability depending on seasonal demand across their service territory.',
    services: ['Roof Replacement', 'Roof Repair', 'New Construction', 'Re-Roofing'],
    yearsInBusiness: 25,
    serviceArea: 'Statewide Mississippi'
  },
  {
    id: 'hill-country-roofing',
    name: 'Hill Country Roofing',
    description: 'A roofing company serving the North Mississippi hill country region including Pontotoc, Union, and Lafayette counties. They specialize in residential roofing with particular experience in older and historic homes. The company focuses on quality craftsmanship and works with homeowners on preservation-minded roofing solutions.',
    services: ['Residential Roofing', 'Historic Restoration', 'Shingle Replacement', 'Roof Repair'],
    yearsInBusiness: 10,
    serviceArea: 'North Central Mississippi'
  },
  {
    id: 'southern-storm-restoration',
    name: 'Southern Storm Restoration',
    description: 'A storm damage restoration company that handles roofing repairs and replacements following severe weather events. They have experience navigating insurance claims and working with adjusters. The company may primarily respond to storm events rather than maintaining a constant local presence in all service areas.',
    services: ['Storm Damage Repair', 'Insurance Restoration', 'Emergency Tarping', 'Roof Replacement'],
    yearsInBusiness: 8,
    serviceArea: 'Southeast US including Mississippi'
  },
  {
    id: 'affordable-roofing-ms',
    name: 'Affordable Roofing MS',
    description: 'A budget-focused roofing contractor offering competitive pricing on standard roofing services across Northeast Mississippi. They primarily work with 3-tab and architectural shingles for residential projects. The company emphasizes value pricing, which may appeal to cost-conscious homeowners seeking basic roofing services.',
    services: ['Budget Roofing', 'Shingle Installation', 'Basic Repairs', 'Roof Replacement'],
    yearsInBusiness: 6,
    serviceArea: 'Northeast Mississippi'
  },
  {
    id: 'oxford-roofing-specialists',
    name: 'Oxford Roofing Specialists',
    description: 'A roofing contractor based in the Oxford area, primarily serving Lafayette County and the Ole Miss community. They have experience with both traditional residential roofing and properties near the university. The company understands the needs of the Oxford market including rental properties and historic homes near the Square.',
    services: ['Residential Roofing', 'Rental Property Roofing', 'Roof Repair', 'Inspections'],
    yearsInBusiness: 14,
    serviceArea: 'Oxford and Lafayette County'
  },
  {
    id: 'corinth-roofing-company',
    name: 'Corinth Roofing Company',
    description: 'A local roofing contractor serving the Corinth area and Alcorn County. They specialize in residential roofing services with some experience in historic property restoration given the area rich Civil War heritage. The company primarily serves the northern portion of Northeast Mississippi near the Tennessee border.',
    services: ['Roof Replacement', 'Historic Roofing', 'Roof Repair', 'Metal Roofing'],
    yearsInBusiness: 22,
    serviceArea: 'Alcorn County and surrounding areas'
  },
  {
    id: 'premium-roof-systems',
    name: 'Premium Roof Systems',
    description: 'A higher-end roofing contractor offering premium materials and installation services. They specialize in designer shingles, metal roofing, and cedar shake installations. The company focuses on quality over volume and may have higher pricing reflecting their premium positioning in the market.',
    services: ['Premium Shingles', 'Metal Roofing', 'Cedar Shake', 'Copper Details'],
    yearsInBusiness: 16,
    serviceArea: 'North Mississippi'
  },
  {
    id: 'starkville-roof-repair',
    name: 'Starkville Roof Repair',
    description: 'A repair-focused roofing company based in Starkville serving Oktibbeha County and surrounding areas. They specialize in roof repairs, maintenance, and minor replacements. The company has significant experience with rental properties and student housing around Mississippi State University.',
    services: ['Roof Repair', 'Maintenance', 'Leak Repair', 'Partial Replacement'],
    yearsInBusiness: 11,
    serviceArea: 'Starkville and Oktibbeha County'
  }
]

// City-specific competitor assignments
// Returns 4-6 competitors relevant to each city based on geography and service area
const cityCompetitorMap: Record<string, string[]> = {
  // Primary Market - Tupelo Metro
  'tupelo': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'magnolia-state-roofing', 'affordable-roofing-ms', 'southern-storm-restoration'],
  'saltillo': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'magnolia-state-roofing', 'affordable-roofing-ms'],
  'baldwyn': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'corinth-roofing-company', 'affordable-roofing-ms'],
  'verona': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'magnolia-state-roofing', 'golden-triangle-roofers'],
  'shannon': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'golden-triangle-roofers', 'affordable-roofing-ms'],
  'guntown': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'corinth-roofing-company', 'affordable-roofing-ms'],
  'plantersville': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'affordable-roofing-ms', 'magnolia-state-roofing'],
  'nettleton': ['northeast-ms-roofing', 'tupelo-exterior-pros', 'golden-triangle-roofers', 'affordable-roofing-ms'],

  // Secondary Markets
  'pontotoc': ['northeast-ms-roofing', 'hill-country-roofing', 'magnolia-state-roofing', 'affordable-roofing-ms', 'oxford-roofing-specialists'],
  'new-albany': ['northeast-ms-roofing', 'hill-country-roofing', 'oxford-roofing-specialists', 'magnolia-state-roofing'],
  'booneville': ['northeast-ms-roofing', 'corinth-roofing-company', 'magnolia-state-roofing', 'southern-storm-restoration'],
  'corinth': ['corinth-roofing-company', 'northeast-ms-roofing', 'magnolia-state-roofing', 'southern-storm-restoration', 'affordable-roofing-ms'],
  'fulton': ['northeast-ms-roofing', 'golden-triangle-roofers', 'tupelo-exterior-pros', 'affordable-roofing-ms'],
  'amory': ['northeast-ms-roofing', 'golden-triangle-roofers', 'tupelo-exterior-pros', 'magnolia-state-roofing'],
  'aberdeen': ['golden-triangle-roofers', 'northeast-ms-roofing', 'premium-roof-systems', 'magnolia-state-roofing'],
  'houston': ['northeast-ms-roofing', 'hill-country-roofing', 'magnolia-state-roofing', 'golden-triangle-roofers'],

  // Tertiary Markets - College Towns & Larger Cities
  'oxford': ['oxford-roofing-specialists', 'hill-country-roofing', 'premium-roof-systems', 'magnolia-state-roofing', 'delta-roofing-solutions'],
  'starkville': ['starkville-roof-repair', 'golden-triangle-roofers', 'premium-roof-systems', 'magnolia-state-roofing', 'delta-roofing-solutions'],
  'columbus': ['golden-triangle-roofers', 'premium-roof-systems', 'magnolia-state-roofing', 'delta-roofing-solutions', 'southern-storm-restoration'],
  'west-point': ['golden-triangle-roofers', 'northeast-ms-roofing', 'magnolia-state-roofing', 'affordable-roofing-ms']
}

// Default competitors for cities not explicitly mapped
const defaultCompetitors = ['northeast-ms-roofing', 'magnolia-state-roofing', 'affordable-roofing-ms', 'southern-storm-restoration']

/**
 * Get competitors relevant to a specific city
 * Returns 4-6 competitor companies based on geographic relevance
 */
export function getCompetitorsForCity(citySlug: string): CompetitorCompany[] {
  const competitorIds = cityCompetitorMap[citySlug] || defaultCompetitors

  return competitorIds
    .map(id => regionalCompetitors.find(c => c.id === id))
    .filter((c): c is CompetitorCompany => c !== undefined)
}

/**
 * Get all competitor IDs assigned to a city
 */
export function getCompetitorIdsForCity(citySlug: string): string[] {
  return cityCompetitorMap[citySlug] || defaultCompetitors
}

/**
 * Get a specific competitor by ID
 */
export function getCompetitorById(id: string): CompetitorCompany | undefined {
  return regionalCompetitors.find(c => c.id === id)
}

/**
 * Get all regional competitors
 */
export function getAllCompetitors(): CompetitorCompany[] {
  return regionalCompetitors
}
