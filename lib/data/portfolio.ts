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
    title: 'Historic Craftsman Home Restoration',
    slug: 'craftsman-home-restoration',
    location: 'Tupelo, MS',
    projectType: 'Full Roof Replacement',
    description: 'Complete roof replacement on a 1920s Craftsman-style home in downtown Tupelo. The project required careful attention to preserve the home\'s historic character while upgrading to modern, weather-resistant materials suited for Mississippi\'s humid climate.',
    scope: [
      'Complete tear-off of aging shingle roof',
      'Deck repair and reinforcement',
      'New synthetic underlayment for humidity protection',
      'Architectural shingles installation',
      'Restored decorative rafter tails',
      'Improved attic ventilation',
    ],
    materials: ['GAF Timberline HDZ', 'Synthetic underlayment', 'Copper drip edge'],
    duration: '4 days',
    completedDate: '2024-09-15',
    testimonial: {
      text: 'They treated our old house with the respect it deserves. The new roof fits the style perfectly.',
      author: 'The Henderson Family',
    },
  },
  {
    id: '2',
    title: 'Spring Storm Emergency Repair',
    slug: 'storm-damage-emergency',
    location: 'Oxford, MS',
    projectType: 'Storm Damage Repair',
    description: 'Emergency response after severe spring storms rolled through Lafayette County. We tarped the roof within hours of the call, worked directly with the homeowner\'s insurance company, and completed full repairs within two weeks.',
    scope: [
      'Emergency tarping same day',
      'Complete insurance documentation',
      'Partial re-roof (65%)',
      'Gutter replacement',
      'Fascia and soffit repair',
    ],
    materials: ['Owens Corning Duration', 'Aluminum seamless gutters'],
    duration: '2 days',
    completedDate: '2024-08-22',
    testimonial: {
      text: 'They were out the same afternoon the storm hit. Handled everything with our insurance. Made a stressful situation easy.',
      author: 'Mark & Susan T.',
    },
  },
  {
    id: '3',
    title: 'Ranch Home Metal Roof Upgrade',
    slug: 'metal-roof-installation',
    location: 'Starkville, MS',
    projectType: 'Metal Roof Installation',
    description: 'Premium standing seam metal roof installation on a sprawling ranch home. The homeowners wanted a roof that would handle Mississippi\'s heat and storms for decades with minimal maintenance.',
    scope: [
      'Complete tear-off of old shingles',
      'Solid deck installation',
      'Synthetic underlayment',
      'Standing seam metal panels',
      'Custom ridge caps',
      'Enhanced ventilation system',
    ],
    materials: ['Standing seam steel panels', 'Kynar 500 finish', 'Synthetic underlayment'],
    duration: '5 days',
    completedDate: '2024-07-10',
    testimonial: {
      text: 'The metal roof looks sharp and we love knowing it\'ll outlast us. Worth every penny.',
      author: 'The Blackwell Family',
    },
  },
  {
    id: '4',
    title: 'Townhome Community Re-Roof',
    slug: 'townhome-community',
    location: 'Columbus, MS',
    projectType: 'Commercial Roofing',
    description: 'Large-scale roofing project covering 8 units in a townhome community. Coordinated with the HOA to minimize disruption to residents and completed the project in phases.',
    scope: [
      'Phased installation approach',
      'Tear-off and disposal',
      'New decking where needed',
      'Impact-resistant shingles for storm protection',
      'New ridge vent system',
      'Gutter system upgrade',
    ],
    materials: ['CertainTeed Landmark IR', 'Ridge vent system', 'Aluminum gutters'],
    duration: '2 weeks',
    completedDate: '2024-06-01',
  },
  {
    id: '5',
    title: 'Southern Colonial Full Replacement',
    slug: 'southern-colonial-replacement',
    location: 'Corinth, MS',
    projectType: 'Roof Replacement',
    description: 'Full roof replacement on a traditional Southern Colonial home. The steep pitch and multiple dormers required careful planning and experienced crews to ensure proper water shedding.',
    scope: [
      'Old shingle removal and disposal',
      'Structural inspection',
      'Complete deck assessment',
      'Ice and water shield at valleys',
      'Premium architectural shingles',
      'Dormer flashing replacement',
    ],
    materials: ['GAF Timberline Ultra HD', 'GAF Cobra vent', 'Ice & water shield'],
    duration: '4 days',
    completedDate: '2024-05-15',
  },
  {
    id: '6',
    title: 'Hail Damage Insurance Claim',
    slug: 'hail-damage-claim',
    location: 'New Albany, MS',
    projectType: 'Insurance Claim',
    description: 'Complete roof replacement after significant hail damage. We documented all damage for the insurance claim, met with the adjuster on-site, and coordinated the full replacement once the claim was approved.',
    scope: [
      'Comprehensive damage inspection',
      'Insurance documentation and photos',
      'Adjuster meeting coordination',
      'Complete tear-off',
      'Impact-resistant shingles',
      'New gutter system',
    ],
    materials: ['CertainTeed Landmark IR', 'Synthetic underlayment', 'Aluminum gutters'],
    duration: '3 days',
    completedDate: '2024-04-20',
    testimonial: {
      text: 'They made the insurance process painless. Got more from the claim than we expected.',
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
