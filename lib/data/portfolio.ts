/**
 * Portfolio/Projects Data
 *
 * Completed projects for the portfolio gallery.
 * Updated January 2026 with recent projects.
 */

export interface PortfolioProject {
  id: string
  title: string
  slug: string
  location: string
  projectType: string
  description: string
  scope: string[]
  materials: string[]
  duration: string
  completedDate: string
  beforeImage?: string
  afterImage?: string
  galleryImages?: string[]
  testimonial?: {
    text: string
    author: string
  }
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: '1',
    title: 'Historic Craftsman Home Restoration',
    slug: 'craftsman-home-restoration',
    location: 'Tupelo, MS',
    projectType: 'Full Roof Replacement',
    description: 'Complete roof replacement on a 1920s Craftsman-style home in downtown Tupelo. The project required careful attention to preserve the home\'s historic character while upgrading to modern, weather-resistant materials suited for Mississippi\'s humid climate. We matched the original roofline aesthetics while significantly improving energy efficiency and storm resistance.',
    scope: [
      'Complete tear-off of aging shingle roof',
      'Deck repair and reinforcement',
      'New synthetic underlayment for humidity protection',
      'Architectural shingles installation',
      'Restored decorative rafter tails',
      'Improved attic ventilation system',
      'Custom copper flashing details',
    ],
    materials: ['GAF Timberline HDZ', 'Synthetic underlayment', 'Copper drip edge', 'Ridge vent system'],
    duration: '4 days',
    completedDate: '2025-11-15',
    testimonial: {
      text: 'They treated our old house with the respect it deserves. The new roof fits the historic style perfectly while giving us modern protection.',
      author: 'The Henderson Family',
    },
  },
  {
    id: '2',
    title: 'Spring Storm Emergency Repair',
    slug: 'storm-damage-emergency',
    location: 'Oxford, MS',
    projectType: 'Storm Damage Repair',
    description: 'Emergency response after severe spring storms rolled through Lafayette County. We tarped the roof within hours of the call, worked directly with the homeowner\'s insurance company, and completed full repairs within two weeks. The project included addressing hidden water damage that could have caused significant structural issues if left untreated.',
    scope: [
      'Emergency tarping same day',
      'Complete insurance documentation with photos',
      'Partial re-roof (65%)',
      'Gutter replacement',
      'Fascia and soffit repair',
      'Interior water damage assessment',
    ],
    materials: ['Owens Corning Duration Storm', 'Aluminum seamless gutters', 'Ice & water shield'],
    duration: '2 days',
    completedDate: '2025-10-22',
    testimonial: {
      text: 'They were out the same afternoon the storm hit. Handled everything with our insurance and made a stressful situation easy to deal with.',
      author: 'Mark & Susan T.',
    },
  },
  {
    id: '3',
    title: 'Ranch Home Standing Seam Metal Upgrade',
    slug: 'metal-roof-installation',
    location: 'Starkville, MS',
    projectType: 'Metal Roof Installation',
    description: 'Premium standing seam metal roof installation on a sprawling ranch home near Mississippi State University. The homeowners wanted a roof that would handle Mississippi\'s extreme heat and severe storms for decades with minimal maintenance. The reflective finish has already reduced their summer cooling costs by over 20%.',
    scope: [
      'Complete tear-off of old asphalt shingles',
      'Solid deck installation over existing decking',
      'Synthetic underlayment with thermal barrier',
      'Standing seam metal panels installation',
      'Custom ridge caps and trim',
      'Enhanced ventilation system',
      'Snow guards installation',
    ],
    materials: ['Standing seam steel panels (26 gauge)', 'Kynar 500 finish in Charcoal Gray', 'Synthetic underlayment', 'Stainless steel fasteners'],
    duration: '5 days',
    completedDate: '2025-08-10',
    testimonial: {
      text: 'The metal roof looks incredible and we love knowing it\'ll outlast us. Our energy bills dropped immediately and our insurance premium went down 25%.',
      author: 'The Blackwell Family',
    },
  },
  {
    id: '4',
    title: 'Townhome Community Re-Roof Project',
    slug: 'townhome-community',
    location: 'Columbus, MS',
    projectType: 'Commercial Roofing',
    description: 'Large-scale roofing project covering 12 units in a townhome community. We coordinated closely with the HOA board to minimize disruption to residents, completed the project in carefully planned phases, and upgraded the entire community to impact-resistant shingles that qualified all homeowners for insurance discounts.',
    scope: [
      'Phased installation approach over 3 weeks',
      'Complete tear-off and disposal',
      'New decking replacement where needed',
      'Impact-resistant shingles for Class 4 rating',
      'New ridge vent system throughout',
      'Gutter system upgrade',
      'HOA compliance documentation',
    ],
    materials: ['CertainTeed Landmark IR', 'Continuous ridge vent system', 'Aluminum gutters with leaf guards'],
    duration: '3 weeks',
    completedDate: '2025-06-01',
  },
  {
    id: '5',
    title: 'Southern Colonial Full Replacement',
    slug: 'southern-colonial-replacement',
    location: 'Corinth, MS',
    projectType: 'Roof Replacement',
    description: 'Full roof replacement on a traditional Southern Colonial home with steep pitches and six dormers. The complex roofline required experienced crews and careful planning to ensure proper water shedding and ventilation. We upgraded the ventilation system to address moisture issues in the attic that had been causing premature shingle deterioration.',
    scope: [
      'Old shingle removal and disposal',
      'Comprehensive structural inspection',
      'Complete deck assessment and repairs',
      'Ice and water shield at all valleys and dormers',
      'Premium architectural shingles',
      'All dormer flashing replacement',
      'Powered attic ventilator installation',
    ],
    materials: ['GAF Timberline Ultra HD in Weathered Wood', 'GAF Cobra exhaust vent', 'Ice & water shield', 'Solar-powered attic fan'],
    duration: '5 days',
    completedDate: '2025-05-15',
  },
  {
    id: '6',
    title: 'Hail Damage Insurance Restoration',
    slug: 'hail-damage-claim',
    location: 'New Albany, MS',
    projectType: 'Insurance Claim',
    description: 'Complete roof replacement after significant hail damage from a late spring storm. We provided thorough documentation that resulted in full replacement approval from the insurance company. The homeowners upgraded to impact-resistant shingles, which not only provide better protection but also qualify them for ongoing insurance discounts.',
    scope: [
      'Comprehensive damage inspection and documentation',
      'Detailed insurance documentation with 150+ photos',
      'Adjuster meeting coordination and advocacy',
      'Complete tear-off',
      'Impact-resistant Class 4 shingles',
      'New gutter system with downspout extensions',
      'Soffit vent cleaning and repair',
    ],
    materials: ['Owens Corning Duration Storm IR', 'Synthetic underlayment', '6" aluminum gutters'],
    duration: '3 days',
    completedDate: '2025-04-20',
    testimonial: {
      text: 'They made the insurance process completely painless. Actually got more from the claim than we expected and the new roof is beautiful.',
      author: 'James L.',
    },
  },
  {
    id: '7',
    title: 'Modern Farmhouse New Construction',
    slug: 'modern-farmhouse-new',
    location: 'Pontotoc, MS',
    projectType: 'New Construction',
    description: 'New construction roofing for a modern farmhouse design featuring a combination of standing seam metal over the main structure and architectural shingles on the dormers and porch areas. This mixed-material approach gave the homeowners the durability of metal with the traditional aesthetics they wanted on visible accent areas.',
    scope: [
      'New construction coordination with builder',
      'Standing seam metal on main roof sections',
      'Architectural shingles on accent areas',
      'Custom transition flashing between materials',
      'Continuous soffit and ridge ventilation',
      'Gutters with rain collection system prep',
    ],
    materials: ['Standing seam metal in Matte Black', 'GAF Timberline HDZ in Charcoal', 'Custom fabricated flashing', 'Half-round copper gutters'],
    duration: '6 days',
    completedDate: '2026-01-10',
    testimonial: {
      text: 'The combination of metal and shingles looks exactly like we envisioned. Smart Roof Pricing understood our vision and executed it perfectly.',
      author: 'The Morrison Family',
    },
  },
  {
    id: '8',
    title: 'Historic Church Roof Restoration',
    slug: 'historic-church-restoration',
    location: 'Holly Springs, MS',
    projectType: 'Commercial Roofing',
    description: 'Careful restoration of a 120-year-old church roof in Holly Springs. The project required matching the original slate appearance while using modern materials that met budget constraints. We worked with the congregation and local historical society to ensure the finished product honored the building\'s heritage.',
    scope: [
      'Historical documentation and planning',
      'Careful removal preserving architectural details',
      'Structural assessment and reinforcement',
      'Synthetic slate installation',
      'Copper flashing and accents restoration',
      'Steeple and cross resealing',
      'Gutter restoration with copper downspouts',
    ],
    materials: ['DaVinci Bellaforte synthetic slate', 'Copper flashing and accents', 'Heavy-duty synthetic underlayment'],
    duration: '2 weeks',
    completedDate: '2025-09-08',
    testimonial: {
      text: 'Our church looks magnificent. They respected our budget while giving us a roof that honors the building\'s 120-year history.',
      author: 'First Presbyterian Church Board',
    },
  },
]

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return portfolioProjects.find(p => p.slug === slug)
}

export function getAllProjects(): PortfolioProject[] {
  return portfolioProjects
}

export function getProjectsByType(type: string): PortfolioProject[] {
  return portfolioProjects.filter(p =>
    p.projectType.toLowerCase().includes(type.toLowerCase())
  )
}
