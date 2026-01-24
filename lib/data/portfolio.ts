/**
 * Portfolio/Projects Data
 *
 * Completed projects for the portfolio gallery.
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
    title: 'Victorian Home Complete Restoration',
    slug: 'victorian-home-restoration',
    location: 'Austin, TX',
    projectType: 'Full Roof Replacement',
    description: 'Complete roof replacement on a historic Victorian home. The project required careful attention to preserve the home\'s architectural character while upgrading to modern, durable materials.',
    scope: [
      'Complete tear-off of 3-layer roof',
      'Deck repair and reinforcement',
      'New synthetic underlayment',
      'Architectural shingles installation',
      'Custom copper flashing',
      'Period-appropriate ventilation',
    ],
    materials: ['GAF Timberline HDZ', 'Copper flashing', 'Synthetic underlayment'],
    duration: '4 days',
    completedDate: '2024-09-15',
    testimonial: {
      text: 'They treated our 100-year-old home with the respect it deserves. The new roof looks like it belongs on the house.',
      author: 'The Henderson Family',
    },
  },
  {
    id: '2',
    title: 'Storm Damage Emergency Repair',
    slug: 'storm-damage-emergency',
    location: 'Round Rock, TX',
    projectType: 'Storm Damage Repair',
    description: 'Emergency response after severe hailstorm. We tarped the roof within hours, worked with the insurance company, and completed full repairs within two weeks.',
    scope: [
      'Emergency tarping',
      'Insurance documentation',
      'Partial re-roof (60%)',
      'Gutter replacement',
      'Fascia repair',
    ],
    materials: ['Owens Corning Duration', 'Aluminum seamless gutters'],
    duration: '2 days',
    completedDate: '2024-08-22',
    testimonial: {
      text: 'They were at our house the same day the storm hit. Handled everything with our insurance. Stress-free experience during a stressful time.',
      author: 'Mark & Susan T.',
    },
  },
  {
    id: '3',
    title: 'Metal Roof Installation',
    slug: 'metal-roof-installation',
    location: 'Lakeway, TX',
    projectType: 'Metal Roof Installation',
    description: 'Premium standing seam metal roof installation on a modern lakefront home. The homeowners wanted a roof that would last 50+ years with minimal maintenance.',
    scope: [
      'Complete tear-off',
      'Solid deck installation',
      'Synthetic underlayment',
      'Standing seam metal panels',
      'Custom ridge caps',
      'Snow guards installation',
    ],
    materials: ['Standing seam steel panels', 'Kynar 500 finish', 'Synthetic underlayment'],
    duration: '5 days',
    completedDate: '2024-07-10',
    testimonial: {
      text: 'The metal roof is stunning. We love the look and knowing we\'ll never have to replace it again.',
      author: 'The Blackwell Family',
    },
  },
  {
    id: '4',
    title: 'Multi-Family Complex Re-Roof',
    slug: 'multi-family-complex',
    location: 'Cedar Park, TX',
    projectType: 'Commercial Roofing',
    description: 'Large-scale roofing project covering 12 units in a townhome community. Coordinated with HOA and minimized disruption to residents.',
    scope: [
      'Phased installation approach',
      'Tear-off and disposal',
      'New decking where needed',
      'Impact-resistant shingles',
      'New ventilation system',
      'Gutter system upgrade',
    ],
    materials: ['CertainTeed Landmark IR', 'Ridge vent system', 'Aluminum gutters'],
    duration: '3 weeks',
    completedDate: '2024-06-01',
  },
  {
    id: '5',
    title: 'Tile to Shingle Conversion',
    slug: 'tile-to-shingle-conversion',
    location: 'Georgetown, TX',
    projectType: 'Roof Replacement',
    description: 'Converted aging concrete tile roof to architectural shingles. The structural changes required careful engineering to ensure proper load distribution.',
    scope: [
      'Tile removal and disposal',
      'Structural assessment',
      'Deck repair',
      'New underlayment system',
      'Premium shingle installation',
      'Updated flashing',
    ],
    materials: ['GAF Timberline Ultra HD', 'GAF Cobra vent', 'Ice & water shield'],
    duration: '4 days',
    completedDate: '2024-05-15',
  },
  {
    id: '6',
    title: 'Solar-Ready Roof Upgrade',
    slug: 'solar-ready-roof',
    location: 'Pflugerville, TX',
    projectType: 'Full Roof Replacement',
    description: 'New roof installation designed to accommodate future solar panel installation. Reinforced structure and strategic layout for optimal panel placement.',
    scope: [
      'Complete roof replacement',
      'Structural reinforcement',
      'Conduit pre-installation',
      'High-efficiency underlayment',
      'Reflective shingles',
      'Solar mounting prep',
    ],
    materials: ['CertainTeed Solaris', 'Reinforced decking', 'UV-resistant underlayment'],
    duration: '3 days',
    completedDate: '2024-04-20',
    testimonial: {
      text: 'Planning ahead for solar was a great decision. The roof is ready whenever we are.',
      author: 'James L.',
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
