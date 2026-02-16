// Mississippi Locations Data for Local SEO
// Smart Roof Pricing - Tupelo, MS & Surrounding Areas

export interface MSCity {
  slug: string
  name: string
  county: string
  state: string
  stateCode: string
  population: number
  zipCodes: string[]
  coordinates: {
    lat: number
    lng: number
  }
  isHQ: boolean
  priority: 'high' | 'medium' | 'low'

  // SEO Content
  metaTitle: string
  metaDescription: string
  h1: string

  // Unique Content
  localContent: {
    intro: string
    weatherChallenges: string[]
    commonRoofTypes: string[]
    neighborhoods: string[]
    landmarks: string[]
  }

  // Local Stats
  stats: {
    avgReplacementCost: string
    avgRoofAge: string
    stormDamageFrequency: string
  }

  // Testimonial
  testimonial?: {
    name: string
    text: string
    neighborhood?: string
    projectType: string
  }

  // Related cities for internal linking
  nearbyCities: string[]
}

export interface MSCounty {
  slug: string
  name: string
  state: string
  stateCode: string
  population: number
  cities: string[]
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  stats: {
    avgReplacementCost: string
    totalHomes: string
    stormDamageFrequency: string
  }
}

// Primary Service Area - Tupelo Metro (Lee County)
const tupeloMetroCities: MSCity[] = [
  {
    slug: 'tupelo',
    name: 'Tupelo',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 38000,
    zipCodes: ['38801', '38802', '38804'],
    coordinates: { lat: 34.2576, lng: -88.7034 },
    isHQ: true,
    priority: 'high',
    metaTitle: 'Roofing Services in Tupelo, MS | Smart Roof Pricing | Free Estimates',
    metaDescription: 'Trusted roofing contractor in Tupelo, Mississippi. Roof replacement, repair, storm damage experts. Locally owned, serving Lee County since 2010. Free estimates!',
    h1: 'Trusted Roofing Contractor in Tupelo, Mississippi',
    localContent: {
      intro: `As Tupelo's hometown roofing company, Smart Roof Pricing has been protecting Northeast Mississippi homes for over a decade. Born and raised right here in the birthplace of Elvis, we understand the unique roofing challenges that Tupelo homeowners face. From the historic homes near Downtown and Fairpark to the growing neighborhoods of North Tupelo and the established communities around Milam and Joyner, we've helped thousands of families keep their homes safe and dry. Mississippi's humid subtropical climate brings intense summer storms, occasional tornadoes during spring, and heavy rainfall that can test any roof. Our team specializes in the roofing systems that perform best in our local conditions, and we're always just a short drive away when you need us.`,
      weatherChallenges: [
        'Severe thunderstorms with high winds and hail',
        'Tornado season from March through May',
        'High humidity causing moisture-related damage',
        'Heavy rainfall averaging 55 inches annually',
        'Hot summers with temperatures exceeding 90°F'
      ],
      commonRoofTypes: [
        'Architectural asphalt shingles',
        'Traditional 3-tab shingles',
        'Metal roofing (standing seam)',
        'Wood shake on historic homes'
      ],
      neighborhoods: [
        'Downtown Tupelo',
        'North Tupelo',
        'Fairpark',
        'Milam',
        'Joyner',
        'Harrisburg',
        'Parkway',
        'Elvis Presley Heights'
      ],
      landmarks: [
        'Elvis Presley Birthplace',
        'Tupelo Automobile Museum',
        'Natchez Trace Parkway',
        'BancorpSouth Arena',
        'Mall at Barnes Crossing'
      ]
    },
    stats: {
      avgReplacementCost: '$8,500 - $15,000',
      avgRoofAge: '18-22 years',
      stormDamageFrequency: 'High - within Dixie Alley tornado corridor'
    },
    testimonial: {
      name: 'James M.',
      text: 'After the spring storms damaged our roof in North Tupelo, Smart Roof Pricing was there the next day. They worked directly with our insurance company and had our new roof installed within a week. True professionals who care about our community.',
      neighborhood: 'North Tupelo',
      projectType: 'Storm Damage Repair'
    },
    nearbyCities: ['saltillo', 'verona', 'shannon', 'baldwyn', 'guntown']
  },
  {
    slug: 'saltillo',
    name: 'Saltillo',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 5200,
    zipCodes: ['38866'],
    coordinates: { lat: 34.3765, lng: -88.6820 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Services in Saltillo, MS | Expert Roof Repair & Replacement',
    metaDescription: 'Professional roofing services in Saltillo, Mississippi. Local contractor serving Lee County with quality roof repairs, replacements, and storm damage restoration.',
    h1: 'Professional Roofing Services in Saltillo, Mississippi',
    localContent: {
      intro: `Saltillo residents trust Smart Roof Pricing for all their roofing needs. Just a few miles north of our Tupelo headquarters, we consider Saltillo part of our extended family. This growing community along Highway 45 has seen significant residential development, with new subdivisions and established neighborhoods alike needing reliable roofing services. Whether you're in one of Saltillo's newer developments or maintaining an older home near the town center, our team delivers the same quality workmanship and honest service that has made us Northeast Mississippi's preferred roofing contractor.`,
      weatherChallenges: [
        'Severe spring thunderstorms',
        'High humidity and moisture exposure',
        'Heavy rainfall year-round',
        'Occasional winter ice storms'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        '3-tab asphalt shingles'
      ],
      neighborhoods: [
        'Downtown Saltillo',
        'Highway 45 corridor',
        'Saltillo Heights'
      ],
      landmarks: [
        'Saltillo Primary School',
        'Highway 45 Corridor'
      ]
    },
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      avgRoofAge: '15-20 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Patricia H.',
      text: 'We needed our roof replaced before selling our home. Smart Roof Pricing gave us a fair price and finished ahead of schedule. The new roof actually helped us sell faster!',
      projectType: 'Complete Roof Replacement'
    },
    nearbyCities: ['tupelo', 'baldwyn', 'guntown', 'booneville']
  },
  {
    slug: 'baldwyn',
    name: 'Baldwyn',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 3300,
    zipCodes: ['38824'],
    coordinates: { lat: 34.5087, lng: -88.6356 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Contractor in Baldwyn, MS | Storm Damage & Roof Repair',
    metaDescription: 'Expert roofing services in Baldwyn, Mississippi. Trusted local contractor for roof repair, replacement, and storm damage. Serving Lee County homes.',
    h1: 'Expert Roofing Services in Baldwyn, Mississippi',
    localContent: {
      intro: `Baldwyn may be a small town, but the homes here deserve big-time roofing service. Located in northern Lee County, Baldwyn experiences the same challenging weather as the rest of Northeast Mississippi. Our team at Smart Roof Pricing regularly serves Baldwyn homeowners, bringing the same expertise and dedication we're known for throughout the region. From historic homes along Main Street to the residential areas surrounding the community, we provide comprehensive roofing solutions tailored to local conditions and budgets.`,
      weatherChallenges: [
        'Severe thunderstorms and tornadoes',
        'High humidity and heat',
        'Heavy spring and summer rainfall'
      ],
      commonRoofTypes: [
        'Asphalt shingles',
        'Metal roofing',
        'Traditional 3-tab shingles'
      ],
      neighborhoods: [
        'Downtown Baldwyn',
        'Highway 45 area'
      ],
      landmarks: [
        'Brice\'s Cross Roads National Battlefield',
        'Baldwyn Main Street'
      ]
    },
    stats: {
      avgReplacementCost: '$7,000 - $12,000',
      avgRoofAge: '18-25 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Robert T.',
      text: 'Great experience from start to finish. They treated our small-town job with the same care as any big project. Highly recommend Smart Roof Pricing!',
      projectType: 'Roof Repair'
    },
    nearbyCities: ['saltillo', 'tupelo', 'booneville', 'guntown']
  },
  {
    slug: 'verona',
    name: 'Verona',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 3200,
    zipCodes: ['38879'],
    coordinates: { lat: 34.1943, lng: -88.7220 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Services in Verona, MS | Local Roof Repair & Replacement',
    metaDescription: 'Quality roofing services in Verona, Mississippi. Family-owned contractor providing roof repairs, replacements, and inspections in Lee County.',
    h1: 'Quality Roofing Services in Verona, Mississippi',
    localContent: {
      intro: `Verona sits at the crossroads of Northeast Mississippi, and Smart Roof Pricing is proud to serve this growing community. Located just south of Tupelo along the Highway 45 corridor, Verona homeowners benefit from our proximity and quick response times. The town's mix of established homes and new construction means we handle everything from maintenance on older roofing systems to installing the latest materials on newly built homes. Our familiarity with local building codes and weather patterns ensures your roof will stand up to whatever Mississippi throws at it.`,
      weatherChallenges: [
        'Spring severe weather season',
        'Summer heat and humidity',
        'Year-round rainfall'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        'Dimensional shingles'
      ],
      neighborhoods: [
        'Downtown Verona',
        'Highway 45 corridor',
        'Verona Heights'
      ],
      landmarks: [
        'Verona High School',
        'Tombigbee State Park nearby'
      ]
    },
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      avgRoofAge: '15-22 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Angela W.',
      text: 'Smart Roof Pricing replaced our aging roof with beautiful architectural shingles. The crew was professional and cleaned up everything when they finished.',
      projectType: 'Roof Replacement'
    },
    nearbyCities: ['tupelo', 'shannon', 'nettleton', 'amory']
  },
  {
    slug: 'shannon',
    name: 'Shannon',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 1800,
    zipCodes: ['38868'],
    coordinates: { lat: 34.1165, lng: -88.7115 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Contractor in Shannon, MS | Reliable Roof Services',
    metaDescription: 'Reliable roofing services in Shannon, Mississippi. Expert roof repair and replacement from a trusted Lee County contractor. Free estimates available.',
    h1: 'Reliable Roofing Services in Shannon, Mississippi',
    localContent: {
      intro: `Shannon homeowners count on Smart Roof Pricing for dependable service and honest pricing. This close-knit Lee County community south of Tupelo deserves roofing contractors who understand small-town values and deliver big-city quality. Our team treats every Shannon roofing project with the care and attention it deserves, whether it's a simple repair or a complete replacement. We're committed to protecting the homes of this wonderful community.`,
      weatherChallenges: [
        'Severe thunderstorms',
        'High humidity',
        'Seasonal temperature extremes'
      ],
      commonRoofTypes: [
        'Asphalt shingles',
        'Metal roofing'
      ],
      neighborhoods: [
        'Downtown Shannon',
        'Highway 145 area'
      ],
      landmarks: [
        'Shannon High School'
      ]
    },
    stats: {
      avgReplacementCost: '$7,000 - $12,000',
      avgRoofAge: '18-25 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Billy J.',
      text: 'The crew showed up on time and worked hard all day. Our old roof had been leaking for months and now we have complete peace of mind. Fair prices and quality work.',
      projectType: 'Roof Repair'
    },
    nearbyCities: ['tupelo', 'verona', 'nettleton', 'amory']
  },
  {
    slug: 'guntown',
    name: 'Guntown',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 2500,
    zipCodes: ['38849'],
    coordinates: { lat: 34.4432, lng: -88.6598 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Services in Guntown, MS | Expert Local Roofers',
    metaDescription: 'Professional roofing services in Guntown, Mississippi. Local experts for roof repair, replacement, and storm damage. Serving Lee County since 2010.',
    h1: 'Professional Roofing Services in Guntown, Mississippi',
    localContent: {
      intro: `Guntown residents enjoy quick access to our Tupelo-based team for all their roofing needs. This growing northern Lee County community sits along the Highway 45 corridor, making it easy for our crews to respond promptly. From storm damage repairs to complete roof replacements, Smart Roof Pricing brings professional service and quality materials to every Guntown project. We understand the importance of protecting your home and family from Northeast Mississippi's challenging weather.`,
      weatherChallenges: [
        'Spring tornado season',
        'Severe thunderstorms',
        'High humidity'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        '3-tab shingles'
      ],
      neighborhoods: [
        'Downtown Guntown',
        'Highway 45 corridor'
      ],
      landmarks: [
        'Guntown Elementary School'
      ]
    },
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      avgRoofAge: '15-20 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Kevin and Lisa R.',
      text: 'After a bad storm took shingles off our roof, Smart Roof Pricing was out the next morning. They tarped the damage right away and had us scheduled for a full repair within the week.',
      projectType: 'Storm Damage Repair'
    },
    nearbyCities: ['tupelo', 'saltillo', 'baldwyn', 'booneville']
  },
  {
    slug: 'plantersville',
    name: 'Plantersville',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 1200,
    zipCodes: ['38862'],
    coordinates: { lat: 34.2087, lng: -88.6620 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing in Plantersville, MS | Quality Roof Repair & Replacement',
    metaDescription: 'Quality roofing services in Plantersville, Mississippi. Local contractor offering roof repairs, replacements, and inspections. Free estimates.',
    h1: 'Quality Roofing in Plantersville, Mississippi',
    localContent: {
      intro: `Plantersville may be small, but the homes here deserve top-quality roofing service. Located in Lee County just east of Tupelo, this rural community is well within our service area. Smart Roof Pricing provides the same professional service to Plantersville residents that we offer throughout Northeast Mississippi. Whether you need routine maintenance, repairs after a storm, or a complete roof replacement, we're here to help protect your home.`,
      weatherChallenges: [
        'Severe weather exposure',
        'High humidity',
        'Heavy rainfall'
      ],
      commonRoofTypes: [
        'Asphalt shingles',
        'Metal roofing'
      ],
      neighborhoods: [
        'Plantersville community'
      ],
      landmarks: [
        'Plantersville Road'
      ]
    },
    stats: {
      avgReplacementCost: '$7,000 - $12,000',
      avgRoofAge: '20-25 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Martha S.',
      text: 'Living out in the country, I was worried about finding a reliable roofer. Smart Roof Pricing drove out without hesitation and gave me an honest quote. Excellent service.',
      projectType: 'Roof Inspection'
    },
    nearbyCities: ['tupelo', 'verona', 'saltillo']
  },
  {
    slug: 'nettleton',
    name: 'Nettleton',
    county: 'Lee',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 2000,
    zipCodes: ['38858'],
    coordinates: { lat: 34.0890, lng: -88.6220 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Services in Nettleton, MS | Trusted Local Contractor',
    metaDescription: 'Trusted roofing services in Nettleton, Mississippi. Professional roof repair and replacement serving Lee and Monroe Counties. Call for a free estimate.',
    h1: 'Trusted Roofing Services in Nettleton, Mississippi',
    localContent: {
      intro: `Straddling the Lee and Monroe County line, Nettleton homeowners have trusted Smart Roof Pricing to protect their homes. Our team serves this community with the same dedication and quality workmanship we bring to every project. Nettleton's location in the heart of Northeast Mississippi means residents face all the typical weather challenges of the region, from spring storms to summer heat. We're here to ensure your roof can handle whatever comes its way.`,
      weatherChallenges: [
        'Spring severe weather',
        'Summer heat and humidity',
        'Year-round rainfall'
      ],
      commonRoofTypes: [
        'Asphalt shingles',
        'Metal roofing',
        '3-tab shingles'
      ],
      neighborhoods: [
        'Downtown Nettleton',
        'Highway 6 corridor'
      ],
      landmarks: [
        'Nettleton High School'
      ]
    },
    stats: {
      avgReplacementCost: '$7,000 - $12,000',
      avgRoofAge: '18-25 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'George H.',
      text: 'First-class operation from start to finish. They explained everything clearly, showed up when promised, and did quality work at a fair price. Highly recommend.',
      projectType: 'Roof Replacement'
    },
    nearbyCities: ['tupelo', 'verona', 'shannon', 'amory']
  }
]

// Secondary Markets (30-45 min drive)
const secondaryMarketCities: MSCity[] = [
  {
    slug: 'pontotoc',
    name: 'Pontotoc',
    county: 'Pontotoc',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 6100,
    zipCodes: ['38863'],
    coordinates: { lat: 34.2476, lng: -89.0065 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Services in Pontotoc, MS | Professional Roof Repair & Replacement',
    metaDescription: 'Expert roofing services in Pontotoc, Mississippi. Trusted contractor for roof replacement, repair, and storm damage restoration in Pontotoc County.',
    h1: 'Expert Roofing Services in Pontotoc, Mississippi',
    localContent: {
      intro: `Pontotoc homeowners have discovered why Smart Roof Pricing is Northeast Mississippi's preferred roofing contractor. Just a short drive west from our Tupelo headquarters, we serve Pontotoc County with the same commitment to quality and customer service. This charming county seat features historic downtown buildings alongside newer residential developments, each with unique roofing needs. Our team understands the local architecture and weather patterns, ensuring we recommend the right roofing solutions for Pontotoc homes.`,
      weatherChallenges: [
        'Severe thunderstorms with wind and hail',
        'Tornado risk during spring',
        'High humidity year-round',
        'Heavy rainfall'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        'Historic roof restoration'
      ],
      neighborhoods: [
        'Downtown Pontotoc',
        'Highway 15 corridor',
        'Pontotoc Heights'
      ],
      landmarks: [
        'Pontotoc County Courthouse',
        'Downtown Square',
        'Pontotoc City Park'
      ]
    },
    stats: {
      avgReplacementCost: '$8,000 - $14,000',
      avgRoofAge: '18-22 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Michael D.',
      text: 'Smart Roof Pricing came highly recommended, and they exceeded expectations. They replaced our roof on our historic downtown building with materials that match the character of our home.',
      neighborhood: 'Downtown Pontotoc',
      projectType: 'Historic Roof Replacement'
    },
    nearbyCities: ['tupelo', 'oxford', 'new-albany', 'houston']
  },
  {
    slug: 'new-albany',
    name: 'New Albany',
    county: 'Union',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 8800,
    zipCodes: ['38652'],
    coordinates: { lat: 34.4943, lng: -89.0076 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Contractor in New Albany, MS | Quality Roof Services',
    metaDescription: 'Professional roofing services in New Albany, Mississippi. Quality roof repair, replacement, and inspections in Union County. Call for a free estimate.',
    h1: 'Quality Roofing Services in New Albany, Mississippi',
    localContent: {
      intro: `New Albany, the birthplace of William Faulkner, deserves roofing services worthy of its literary heritage. As Union County's largest city, New Albany features a diverse mix of housing, from charming historic homes to modern developments. Smart Roof Pricing serves New Albany homeowners with the same expertise and dedication we bring to every community in Northeast Mississippi. Our team is familiar with the specific challenges that New Albany roofs face, from the humid summers to the occasional severe storm system.`,
      weatherChallenges: [
        'Severe spring storms',
        'High humidity and heat',
        'Occasional hail events',
        'Heavy rainfall'
      ],
      commonRoofTypes: [
        'Architectural asphalt shingles',
        'Metal roofing',
        'Historic roof styles'
      ],
      neighborhoods: [
        'Downtown New Albany',
        'Highway 78 corridor',
        'Tanglefoot Trail area'
      ],
      landmarks: [
        'William Faulkner\'s Birthplace',
        'Tanglefoot Trail',
        'Union County Courthouse'
      ]
    },
    stats: {
      avgReplacementCost: '$8,000 - $14,500',
      avgRoofAge: '17-22 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Sarah L.',
      text: 'After comparing multiple bids, we chose Smart Roof Pricing for their honest assessment and fair pricing. The roof looks beautiful and they even fixed a ventilation issue we didn\'t know we had.',
      projectType: 'Roof Replacement'
    },
    nearbyCities: ['oxford', 'pontotoc', 'booneville', 'tupelo']
  },
  {
    slug: 'booneville',
    name: 'Booneville',
    county: 'Prentiss',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 8700,
    zipCodes: ['38829'],
    coordinates: { lat: 34.6584, lng: -88.5667 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Services in Booneville, MS | Expert Storm Damage Repair',
    metaDescription: 'Expert roofing services in Booneville, Mississippi. Trusted for storm damage repair, roof replacement, and inspections in Prentiss County.',
    h1: 'Expert Roofing Services in Booneville, Mississippi',
    localContent: {
      intro: `Booneville and Prentiss County homeowners trust Smart Roof Pricing for reliable roofing services. As the county seat, Booneville features a mix of residential properties from historic homes near the courthouse to newer subdivisions on the outskirts of town. Northeast Mississippi Community College brings additional housing needs to the area. Our team regularly serves Booneville, bringing professional workmanship and quality materials to every project. We understand the local weather patterns and building styles, ensuring optimal roofing solutions for every home.`,
      weatherChallenges: [
        'Northern MS storm corridor',
        'Spring tornado season',
        'High humidity',
        'Heavy rainfall'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        '3-tab shingles'
      ],
      neighborhoods: [
        'Downtown Booneville',
        'Northeast MS Community College area',
        'Highway 45 corridor'
      ],
      landmarks: [
        'Northeast Mississippi Community College',
        'Prentiss County Courthouse',
        'Brice\'s Cross Roads nearby'
      ]
    },
    stats: {
      avgReplacementCost: '$7,500 - $13,500',
      avgRoofAge: '18-23 years',
      stormDamageFrequency: 'High'
    },
    testimonial: {
      name: 'David K.',
      text: 'The Smart Roof Pricing team handled our insurance claim professionally and made the whole process stress-free. Our new roof looks great and was done in just two days.',
      projectType: 'Insurance Claim Roof Replacement'
    },
    nearbyCities: ['corinth', 'baldwyn', 'saltillo', 'tupelo']
  },
  {
    slug: 'corinth',
    name: 'Corinth',
    county: 'Alcorn',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 14500,
    zipCodes: ['38834', '38835'],
    coordinates: { lat: 34.9343, lng: -88.5195 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Contractor in Corinth, MS | Civil War City Roof Experts',
    metaDescription: 'Professional roofing services in Corinth, Mississippi. Historic and modern roof repair, replacement, and restoration in Alcorn County.',
    h1: 'Professional Roofing Services in Corinth, Mississippi',
    localContent: {
      intro: `Corinth's rich Civil War history includes many historic homes that require specialized roofing care. As Alcorn County's largest city and one of Northeast Mississippi's major communities, Corinth presents unique roofing challenges and opportunities. From the preserved antebellum homes near the Corinth Civil War Interpretive Center to the newer developments along Highway 72, Smart Roof Pricing has the experience to handle any project. Our team appreciates Corinth's architectural heritage and uses appropriate materials and techniques to maintain the character of historic properties while ensuring modern protection.`,
      weatherChallenges: [
        'Northern Mississippi storm systems',
        'Tornado risk',
        'High humidity and heat',
        'Ice storms in winter'
      ],
      commonRoofTypes: [
        'Historic roof restoration',
        'Architectural shingles',
        'Metal roofing',
        'Slate roof repair'
      ],
      neighborhoods: [
        'Downtown Corinth',
        'Corinth Civil War sites area',
        'Highway 72 corridor',
        'Shiloh Road area'
      ],
      landmarks: [
        'Corinth Civil War Interpretive Center',
        'Corinth National Cemetery',
        'Crossroads Museum',
        'Downtown Corinth'
      ]
    },
    stats: {
      avgReplacementCost: '$8,500 - $15,500',
      avgRoofAge: '20-25 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Jennifer R.',
      text: 'We own a historic home near downtown Corinth and needed roofers who understood preservation. Smart Roof Pricing delivered exactly what we needed while respecting the home\'s heritage.',
      neighborhood: 'Downtown Corinth',
      projectType: 'Historic Roof Restoration'
    },
    nearbyCities: ['booneville', 'baldwyn', 'tupelo']
  },
  {
    slug: 'fulton',
    name: 'Fulton',
    county: 'Itawamba',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 4000,
    zipCodes: ['38843'],
    coordinates: { lat: 34.2737, lng: -88.4095 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Services in Fulton, MS | Itawamba County Roof Experts',
    metaDescription: 'Quality roofing services in Fulton, Mississippi. Trusted contractor for roof repair and replacement in Itawamba County. Free estimates available.',
    h1: 'Quality Roofing Services in Fulton, Mississippi',
    localContent: {
      intro: `Fulton, the seat of Itawamba County, is home to the main campus of Itawamba Community College and a tight-knit community that values quality work. Smart Roof Pricing serves Fulton residents with the same professionalism and expertise we bring to every Northeast Mississippi community. From the college area to the residential neighborhoods throughout town, we provide comprehensive roofing services designed to protect your investment and withstand local weather conditions.`,
      weatherChallenges: [
        'Severe thunderstorms',
        'Spring tornado season',
        'Humid summers',
        'Heavy rainfall'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        '3-tab shingles'
      ],
      neighborhoods: [
        'Downtown Fulton',
        'Itawamba Community College area',
        'Highway 78 corridor'
      ],
      landmarks: [
        'Itawamba Community College',
        'Itawamba County Courthouse',
        'Tombigbee State Park nearby'
      ]
    },
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      avgRoofAge: '18-22 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Dr. Amy C.',
      text: 'They did our roof at the college house and did such a great job we had them do our personal residence too. Professional, courteous, and excellent craftsmanship.',
      projectType: 'Roof Replacement'
    },
    nearbyCities: ['tupelo', 'amory', 'aberdeen', 'nettleton']
  },
  {
    slug: 'amory',
    name: 'Amory',
    county: 'Monroe',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 7000,
    zipCodes: ['38821'],
    coordinates: { lat: 33.9843, lng: -88.4884 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Contractor in Amory, MS | Professional Roof Services',
    metaDescription: 'Professional roofing services in Amory, Mississippi. Expert roof repair, replacement, and storm damage restoration in Monroe County.',
    h1: 'Professional Roofing in Amory, Mississippi',
    localContent: {
      intro: `Amory, known as the "City of Beautiful Homes," deserves roofing services that match its reputation. Located in Monroe County along the Tombigbee River, Amory homeowners face unique challenges from the humid river valley climate. Smart Roof Pricing understands these conditions and provides roofing solutions that protect your beautiful home. From the historic districts to newer developments, we deliver quality workmanship and lasting results.`,
      weatherChallenges: [
        'River valley humidity',
        'Severe thunderstorms',
        'Heavy rainfall',
        'Occasional flooding proximity'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        'Historic roof styles'
      ],
      neighborhoods: [
        'Downtown Amory',
        'Historic districts',
        'Highway 278 corridor'
      ],
      landmarks: [
        'Amory Regional Museum',
        'Tombigbee River',
        'Downtown Amory'
      ]
    },
    stats: {
      avgReplacementCost: '$8,000 - $14,000',
      avgRoofAge: '18-22 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Thomas B.',
      text: 'Smart Roof Pricing installed a beautiful new roof on our Amory home. They were professional, on time, and left our property cleaner than they found it.',
      projectType: 'Roof Replacement'
    },
    nearbyCities: ['tupelo', 'aberdeen', 'fulton', 'nettleton']
  },
  {
    slug: 'aberdeen',
    name: 'Aberdeen',
    county: 'Monroe',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 5600,
    zipCodes: ['39730'],
    coordinates: { lat: 33.8251, lng: -88.5437 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Services in Aberdeen, MS | Historic & Modern Roof Care',
    metaDescription: 'Expert roofing services in Aberdeen, Mississippi. Specializing in historic and modern roof repair, replacement, and restoration in Monroe County.',
    h1: 'Expert Roofing Services in Aberdeen, Mississippi',
    localContent: {
      intro: `Aberdeen's stunning collection of antebellum homes and historic architecture makes it one of Mississippi's most charming cities. The Monroe County seat requires roofing contractors who understand both historic preservation and modern building techniques. Smart Roof Pricing serves Aberdeen with specialized expertise in historic roof restoration alongside standard residential services. Whether your home dates to the 1800s or was built last year, we have the skills and materials to protect it.`,
      weatherChallenges: [
        'Tombigbee River valley humidity',
        'Severe weather systems',
        'Heavy rainfall',
        'Summer heat'
      ],
      commonRoofTypes: [
        'Historic slate and metal roofs',
        'Architectural shingles',
        'Standing seam metal',
        'Cedar shake restoration'
      ],
      neighborhoods: [
        'Downtown Aberdeen',
        'Historic District',
        'Commerce Street area'
      ],
      landmarks: [
        'Historic Aberdeen Pilgrimage homes',
        'Monroe County Courthouse',
        'Tombigbee River',
        'Evans Memorial Library'
      ]
    },
    stats: {
      avgReplacementCost: '$8,500 - $16,000',
      avgRoofAge: '25-40 years (historic homes)',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Elizabeth M.',
      text: 'Our 1850s home needed careful roof work. Smart Roof Pricing understood historic preservation requirements and did exceptional work. They even found original materials to match.',
      neighborhood: 'Historic District',
      projectType: 'Historic Roof Restoration'
    },
    nearbyCities: ['amory', 'columbus', 'tupelo', 'west-point']
  },
  {
    slug: 'houston',
    name: 'Houston',
    county: 'Chickasaw',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 3600,
    zipCodes: ['38851'],
    coordinates: { lat: 33.8984, lng: -88.9993 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Contractor in Houston, MS | Chickasaw County Services',
    metaDescription: 'Reliable roofing services in Houston, Mississippi. Professional roof repair and replacement serving Chickasaw County. Call for your free estimate.',
    h1: 'Reliable Roofing Services in Houston, Mississippi',
    localContent: {
      intro: `Houston, the seat of Chickasaw County, is a welcoming community west of Tupelo that Smart Roof Pricing is proud to serve. This small city features friendly neighborhoods and homes that need protection from Northeast Mississippi's challenging weather. Our team regularly travels to Houston to provide the same quality roofing services we're known for throughout the region. From storm damage repairs to complete replacements, we're here to help Houston homeowners.`,
      weatherChallenges: [
        'Severe thunderstorms',
        'Tornado exposure',
        'High humidity',
        'Heavy rainfall'
      ],
      commonRoofTypes: [
        'Asphalt shingles',
        'Metal roofing',
        '3-tab shingles'
      ],
      neighborhoods: [
        'Downtown Houston',
        'Highway 8 corridor'
      ],
      landmarks: [
        'Chickasaw County Courthouse',
        'Houston Main Street'
      ]
    },
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      avgRoofAge: '18-25 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Randy M.',
      text: 'These folks know what they are doing. Quick response, competitive pricing, and they stand behind their work. My roof looks brand new.',
      projectType: 'Roof Replacement'
    },
    nearbyCities: ['pontotoc', 'tupelo', 'okolona', 'starkville']
  }
]

// Tertiary Markets - College Towns & Larger Cities
const tertiaryMarketCities: MSCity[] = [
  {
    slug: 'oxford',
    name: 'Oxford',
    county: 'Lafayette',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 28000,
    zipCodes: ['38655', '38677'],
    coordinates: { lat: 34.3665, lng: -89.5192 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Services in Oxford, MS | Ole Miss Area Roof Experts',
    metaDescription: 'Premium roofing services in Oxford, Mississippi. Expert roof repair and replacement near Ole Miss. Serving Lafayette County homes and businesses.',
    h1: 'Premium Roofing Services in Oxford, Mississippi',
    localContent: {
      intro: `Oxford, home to the University of Mississippi (Ole Miss), is one of Mississippi's most vibrant and sought-after communities. The city blends Southern charm with college-town energy, featuring everything from historic homes near the Square to modern developments throughout Lafayette County. Smart Roof Pricing serves Oxford's diverse housing stock with premium roofing services. Whether you're a longtime Oxford resident, a professor with a historic home, or an investor with rental properties near campus, we provide the quality and reliability Oxford homeowners expect.`,
      weatherChallenges: [
        'North Mississippi storm systems',
        'Spring severe weather',
        'High humidity year-round',
        'Occasional ice storms'
      ],
      commonRoofTypes: [
        'Premium architectural shingles',
        'Metal roofing',
        'Historic slate and metal',
        'Cedar shake'
      ],
      neighborhoods: [
        'The Square area',
        'Ole Miss campus vicinity',
        'South Lamar corridor',
        'College Hill',
        'Country Club area',
        'Highway 6 corridor'
      ],
      landmarks: [
        'University of Mississippi (Ole Miss)',
        'Oxford Square',
        'Rowan Oak (Faulkner\'s home)',
        'Vaught-Hemingway Stadium',
        'Downtown Oxford'
      ]
    },
    stats: {
      avgReplacementCost: '$10,000 - $20,000',
      avgRoofAge: '15-20 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Dr. William P.',
      text: 'As a homeowner near the Ole Miss campus, I needed contractors who understand historic architecture. Smart Roof Pricing exceeded my expectations with their attention to detail and quality materials.',
      neighborhood: 'College Hill',
      projectType: 'Historic Roof Replacement'
    },
    nearbyCities: ['pontotoc', 'new-albany', 'batesville', 'water-valley']
  },
  {
    slug: 'starkville',
    name: 'Starkville',
    county: 'Oktibbeha',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 25000,
    zipCodes: ['39759', '39760', '39762'],
    coordinates: { lat: 33.4504, lng: -88.8184 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Contractor in Starkville, MS | MS State Area Services',
    metaDescription: 'Professional roofing services in Starkville, Mississippi. Expert roof repair and replacement near Mississippi State. Serving Oktibbeha County.',
    h1: 'Professional Roofing Services in Starkville, Mississippi',
    localContent: {
      intro: `Starkville, home to Mississippi State University, combines academic excellence with warm Southern hospitality. The Golden Triangle region's largest city features diverse housing from historic Craftsman homes to modern developments serving the university community. Smart Roof Pricing extends our Northeast Mississippi service area to reach Starkville homeowners who demand quality. We understand the unique needs of college-town properties, from family homes to rental investments, and deliver roofing solutions that last.`,
      weatherChallenges: [
        'Central Mississippi storm corridor',
        'Severe thunderstorms',
        'High humidity',
        'Occasional tornadoes'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        'Premium designer shingles',
        'Historic roof styles'
      ],
      neighborhoods: [
        'Downtown Starkville',
        'MSU campus area',
        'Cotton District',
        'Highway 12 corridor',
        'Old Main Street'
      ],
      landmarks: [
        'Mississippi State University',
        'Davis Wade Stadium',
        'Cotton District',
        'Downtown Starkville',
        'Drill Field'
      ]
    },
    stats: {
      avgReplacementCost: '$9,000 - $18,000',
      avgRoofAge: '15-20 years',
      stormDamageFrequency: 'Moderate to High'
    },
    testimonial: {
      name: 'Coach Mark T.',
      text: 'Needed a reliable roofing company for my investment properties near MSU. Smart Roof Pricing handled multiple properties efficiently and the tenants were impressed with the crews\' professionalism.',
      projectType: 'Multi-Property Roof Replacement'
    },
    nearbyCities: ['columbus', 'west-point', 'aberdeen', 'houston']
  },
  {
    slug: 'columbus',
    name: 'Columbus',
    county: 'Lowndes',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 23000,
    zipCodes: ['39701', '39702', '39703', '39704', '39705'],
    coordinates: { lat: 33.4957, lng: -88.4273 },
    isHQ: false,
    priority: 'high',
    metaTitle: 'Roofing Services in Columbus, MS | Historic & Modern Roof Experts',
    metaDescription: 'Expert roofing services in Columbus, Mississippi. Specializing in historic antebellum and modern roof repair and replacement in Lowndes County.',
    h1: 'Expert Roofing Services in Columbus, Mississippi',
    localContent: {
      intro: `Columbus, Mississippi preserves one of the finest collections of antebellum homes in the South. This Lowndes County city hosts the famous Pilgrimage tour each spring, showcasing stunning historic architecture that requires specialized roofing care. Beyond the historic district, Columbus Air Force Base brings additional housing diversity to the region. Smart Roof Pricing serves Columbus with expertise in both historic preservation and modern roofing systems. Whether maintaining a grand antebellum estate or replacing a roof on a contemporary home, we deliver excellence.`,
      weatherChallenges: [
        'Tombigbee River valley weather',
        'Severe thunderstorms',
        'High humidity',
        'Heat exposure'
      ],
      commonRoofTypes: [
        'Historic slate and metal',
        'Standing seam metal',
        'Architectural shingles',
        'Cedar shake restoration',
        'Copper roofing details'
      ],
      neighborhoods: [
        'Historic Downtown',
        'Columbus Air Force Base area',
        'Highway 45 corridor',
        'Southside',
        'Northside Historic District'
      ],
      landmarks: [
        'Tennessee Williams Home',
        'Columbus Pilgrimage homes',
        'Columbus Air Force Base',
        'Friendship Cemetery',
        'Mississippi University for Women'
      ]
    },
    stats: {
      avgReplacementCost: '$9,000 - $22,000',
      avgRoofAge: '25-50 years (historic) / 15-20 years (modern)',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Catherine S.',
      text: 'Our 1847 home required expert handling. Smart Roof Pricing sourced period-appropriate materials and their craftsmen understood historic preservation. The result is stunning.',
      neighborhood: 'Northside Historic District',
      projectType: 'Antebellum Roof Restoration'
    },
    nearbyCities: ['starkville', 'west-point', 'aberdeen', 'amory']
  },
  {
    slug: 'west-point',
    name: 'West Point',
    county: 'Clay',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 10500,
    zipCodes: ['39773'],
    coordinates: { lat: 33.6076, lng: -88.6503 },
    isHQ: false,
    priority: 'medium',
    metaTitle: 'Roofing Contractor in West Point, MS | Professional Roof Services',
    metaDescription: 'Professional roofing services in West Point, Mississippi. Quality roof repair and replacement in Clay County. Free estimates available.',
    h1: 'Professional Roofing in West Point, Mississippi',
    localContent: {
      intro: `West Point, situated in Clay County along the Tombigbee River, is a growing community that Smart Roof Pricing is pleased to serve. The city's location makes it accessible from our Tupelo base, allowing us to provide the same quality services West Point homeowners deserve. From older homes near downtown to newer developments, we offer comprehensive roofing solutions tailored to local needs and weather conditions.`,
      weatherChallenges: [
        'River valley humidity',
        'Severe thunderstorms',
        'Heavy rainfall',
        'Summer heat'
      ],
      commonRoofTypes: [
        'Architectural shingles',
        'Metal roofing',
        '3-tab asphalt shingles'
      ],
      neighborhoods: [
        'Downtown West Point',
        'Highway 45 corridor',
        'Clay County residential areas'
      ],
      landmarks: [
        'Waverly Mansion nearby',
        'Clay County Courthouse',
        'Tombigbee River'
      ]
    },
    stats: {
      avgReplacementCost: '$8,000 - $14,000',
      avgRoofAge: '18-25 years',
      stormDamageFrequency: 'Moderate'
    },
    testimonial: {
      name: 'Steve and Donna P.',
      text: 'They drove all the way from Tupelo and treated us like we were their most important customer. The attention to detail on our metal roof was impressive.',
      projectType: 'Metal Roof Installation'
    },
    nearbyCities: ['columbus', 'starkville', 'aberdeen', 'houston']
  }
]

// Combine all cities
export const msCities: MSCity[] = [
  ...tupeloMetroCities,
  ...secondaryMarketCities,
  ...tertiaryMarketCities
]

// County data
export const msCounties: MSCounty[] = [
  {
    slug: 'lee-county',
    name: 'Lee County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 85000,
    cities: ['tupelo', 'saltillo', 'baldwyn', 'verona', 'shannon', 'guntown', 'plantersville', 'nettleton'],
    metaTitle: 'Roofing Services in Lee County, MS | Tupelo Area Roofing Experts',
    metaDescription: 'Trusted roofing contractor serving all of Lee County, Mississippi. From Tupelo to Saltillo, Baldwyn to Verona. Free estimates for roof repair and replacement.',
    h1: 'Lee County, Mississippi Roofing Services',
    intro: `Lee County is home to Smart Roof Pricing's headquarters in Tupelo, and we're proud to serve every community throughout the county. From the bustling city of Tupelo to the charming towns of Saltillo, Baldwyn, Verona, Shannon, Guntown, Plantersville, and Nettleton, we provide comprehensive roofing services to protect Lee County homes. Our familiarity with local building codes, weather patterns, and neighborhoods makes us the trusted choice for Lee County homeowners.`,
    stats: {
      avgReplacementCost: '$7,500 - $15,000',
      totalHomes: '32,000+',
      stormDamageFrequency: 'High - Dixie Alley corridor'
    }
  },
  {
    slug: 'pontotoc-county',
    name: 'Pontotoc County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 32000,
    cities: ['pontotoc'],
    metaTitle: 'Roofing Contractor in Pontotoc County, MS | Professional Services',
    metaDescription: 'Professional roofing services throughout Pontotoc County, Mississippi. Expert roof repair and replacement in Pontotoc and surrounding areas.',
    h1: 'Pontotoc County, Mississippi Roofing Services',
    intro: `Pontotoc County residents trust Smart Roof Pricing for all their roofing needs. Just west of our Tupelo headquarters, we serve the county seat of Pontotoc and surrounding communities with the same dedication to quality and customer service that has made us Northeast Mississippi's preferred roofing contractor.`,
    stats: {
      avgReplacementCost: '$8,000 - $14,000',
      totalHomes: '12,000+',
      stormDamageFrequency: 'Moderate to High'
    }
  },
  {
    slug: 'union-county',
    name: 'Union County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 28000,
    cities: ['new-albany'],
    metaTitle: 'Roofing Services in Union County, MS | New Albany Area Experts',
    metaDescription: 'Expert roofing services in Union County, Mississippi. Serving New Albany and surrounding areas with quality roof repair and replacement.',
    h1: 'Union County, Mississippi Roofing Services',
    intro: `Union County, home to the birthplace of William Faulkner, features charming communities that deserve quality roofing services. Smart Roof Pricing serves New Albany and all of Union County with professional roof repair, replacement, and storm damage restoration services.`,
    stats: {
      avgReplacementCost: '$8,000 - $14,500',
      totalHomes: '11,000+',
      stormDamageFrequency: 'Moderate'
    }
  },
  {
    slug: 'prentiss-county',
    name: 'Prentiss County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 25000,
    cities: ['booneville'],
    metaTitle: 'Roofing Contractor in Prentiss County, MS | Booneville Area Services',
    metaDescription: 'Trusted roofing contractor serving Prentiss County, Mississippi. Professional roof repair and replacement in Booneville and surrounding communities.',
    h1: 'Prentiss County, Mississippi Roofing Services',
    intro: `Prentiss County homeowners rely on Smart Roof Pricing for dependable roofing services. From Booneville to the surrounding rural communities, we bring professional workmanship and quality materials to every project in Prentiss County.`,
    stats: {
      avgReplacementCost: '$7,500 - $13,500',
      totalHomes: '10,000+',
      stormDamageFrequency: 'High'
    }
  },
  {
    slug: 'alcorn-county',
    name: 'Alcorn County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 37000,
    cities: ['corinth'],
    metaTitle: 'Roofing Services in Alcorn County, MS | Corinth Area Roof Experts',
    metaDescription: 'Professional roofing services throughout Alcorn County, Mississippi. Historic and modern roof repair, replacement, and restoration in Corinth.',
    h1: 'Alcorn County, Mississippi Roofing Services',
    intro: `Alcorn County's rich Civil War heritage includes many historic homes requiring specialized roofing care. Smart Roof Pricing serves Corinth and all of Alcorn County with expertise in both historic preservation and modern roofing techniques.`,
    stats: {
      avgReplacementCost: '$8,500 - $15,500',
      totalHomes: '15,000+',
      stormDamageFrequency: 'Moderate to High'
    }
  },
  {
    slug: 'itawamba-county',
    name: 'Itawamba County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 23000,
    cities: ['fulton'],
    metaTitle: 'Roofing Contractor in Itawamba County, MS | Fulton Area Services',
    metaDescription: 'Quality roofing services in Itawamba County, Mississippi. Professional roof repair and replacement serving Fulton and surrounding areas.',
    h1: 'Itawamba County, Mississippi Roofing Services',
    intro: `Itawamba County, home to Itawamba Community College, features welcoming communities that trust Smart Roof Pricing. We serve Fulton and the entire county with comprehensive roofing services designed to protect your investment.`,
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      totalHomes: '9,000+',
      stormDamageFrequency: 'Moderate'
    }
  },
  {
    slug: 'monroe-county',
    name: 'Monroe County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 36000,
    cities: ['amory', 'aberdeen', 'nettleton'],
    metaTitle: 'Roofing Services in Monroe County, MS | Amory & Aberdeen Area',
    metaDescription: 'Expert roofing services throughout Monroe County, Mississippi. Serving Amory, Aberdeen, and surrounding communities with quality roof care.',
    h1: 'Monroe County, Mississippi Roofing Services',
    intro: `Monroe County features two distinct cities - Amory, "The City of Beautiful Homes," and Aberdeen with its stunning antebellum architecture. Smart Roof Pricing serves all of Monroe County with expertise in both historic preservation and modern residential roofing.`,
    stats: {
      avgReplacementCost: '$8,000 - $16,000',
      totalHomes: '14,000+',
      stormDamageFrequency: 'Moderate'
    }
  },
  {
    slug: 'chickasaw-county',
    name: 'Chickasaw County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 17000,
    cities: ['houston'],
    metaTitle: 'Roofing Contractor in Chickasaw County, MS | Houston Area Services',
    metaDescription: 'Reliable roofing services in Chickasaw County, Mississippi. Professional roof repair and replacement in Houston and surrounding communities.',
    h1: 'Chickasaw County, Mississippi Roofing Services',
    intro: `Chickasaw County homeowners west of Tupelo trust Smart Roof Pricing for dependable service. We regularly serve Houston and surrounding Chickasaw County communities with professional roofing solutions.`,
    stats: {
      avgReplacementCost: '$7,500 - $13,000',
      totalHomes: '7,000+',
      stormDamageFrequency: 'Moderate to High'
    }
  },
  {
    slug: 'lafayette-county',
    name: 'Lafayette County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 55000,
    cities: ['oxford'],
    metaTitle: 'Roofing Services in Lafayette County, MS | Oxford Area Roof Experts',
    metaDescription: 'Premium roofing services in Lafayette County, Mississippi. Expert roof repair and replacement in Oxford, home of Ole Miss.',
    h1: 'Lafayette County, Mississippi Roofing Services',
    intro: `Lafayette County, home to the University of Mississippi and the charming city of Oxford, represents one of Mississippi's most desirable communities. Smart Roof Pricing extends our service area to serve Lafayette County homeowners with premium roofing services worthy of this exceptional community.`,
    stats: {
      avgReplacementCost: '$10,000 - $20,000',
      totalHomes: '22,000+',
      stormDamageFrequency: 'Moderate'
    }
  },
  {
    slug: 'oktibbeha-county',
    name: 'Oktibbeha County',
    state: 'Mississippi',
    stateCode: 'MS',
    population: 50000,
    cities: ['starkville'],
    metaTitle: 'Roofing Contractor in Oktibbeha County, MS | Starkville Area',
    metaDescription: 'Professional roofing services in Oktibbeha County, Mississippi. Serving Starkville and MS State area with quality roof repair and replacement.',
    h1: 'Oktibbeha County, Mississippi Roofing Services',
    intro: `Oktibbeha County, home to Mississippi State University and Starkville, is a vibrant community that Smart Roof Pricing is proud to serve. We extend our Northeast Mississippi service area to reach Oktibbeha County homeowners who demand quality and reliability.`,
    stats: {
      avgReplacementCost: '$9,000 - $18,000',
      totalHomes: '19,000+',
      stormDamageFrequency: 'Moderate to High'
    }
  }
]

// Helper functions
export function getCityBySlug(slug: string): MSCity | undefined {
  return msCities.find(city => city.slug === slug)
}

export function getAllCities(): MSCity[] {
  return msCities
}

export function getCitiesByPriority(priority: 'high' | 'medium' | 'low'): MSCity[] {
  return msCities.filter(city => city.priority === priority)
}

export function getCitiesByCounty(countySlug: string): MSCity[] {
  const county = getCountyBySlug(countySlug)
  if (!county) return []
  return msCities.filter(city => county.cities.includes(city.slug))
}

export function getCountyBySlug(slug: string): MSCounty | undefined {
  return msCounties.find(county => county.slug === slug)
}

export function getAllCounties(): MSCounty[] {
  return msCounties
}

export function getNearbyCities(citySlug: string): MSCity[] {
  const city = getCityBySlug(citySlug)
  if (!city) return []
  return city.nearbyCities
    .map(slug => getCityBySlug(slug))
    .filter((c): c is MSCity => c !== undefined)
}

export function getHQCity(): MSCity | undefined {
  return msCities.find(city => city.isHQ)
}

export function isValidCitySlug(slug: string): boolean {
  return msCities.some(city => city.slug === slug)
}

export function isValidCountySlug(slug: string): boolean {
  return msCounties.some(county => county.slug === slug)
}

// Get all city slugs for static generation
export function getAllCitySlugs(): string[] {
  return msCities.map(city => city.slug)
}

// Get all county slugs for static generation
export function getAllCountySlugs(): string[] {
  return msCounties.map(county => county.slug)
}
