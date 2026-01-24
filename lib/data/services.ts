/**
 * Services Data
 *
 * Information about roofing services offered.
 */

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
