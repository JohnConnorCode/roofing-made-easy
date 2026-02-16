/**
 * Team & Company Data
 *
 * Information about the company and team members.
 *
 * IMPORTANT: Set isRealTeamData to true only when real team information is available.
 * Using placeholder team data in production can hurt credibility and SEO.
 */

// Set to true ONLY when you have real team member data
export const isRealTeamData = false

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image?: string
  years?: number
}

export interface CompanyInfo {
  name: string
  founded: number
  description: string
  mission: string
  values: { title: string; description: string }[]
  stats: { label: string; value: string }[]
  licenses: string[]
  certifications: string[]
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Mike Farrell',
    role: 'Founder & CEO',
    bio: 'Mike founded Farrell Roofing over 20 years ago and created Smart Roof Pricing to give homeowners the honest pricing information they deserve. A third-generation roofer, he learned the trade from his father and grandfather.',
    years: 25,
  },
  {
    id: '2',
    name: 'Lisa Farrell',
    role: 'Operations Manager',
    bio: 'Lisa manages day-to-day operations and ensures every customer receives the attention they deserve. She\'s the friendly voice you\'ll hear when you call and the one making sure your project stays on track.',
    years: 18,
  },
  {
    id: '3',
    name: 'Carlos Rivera',
    role: 'Lead Estimator',
    bio: 'Carlos has inspected over 5,000 roofs in his career. His expertise in assessing roof conditions and providing accurate estimates is unmatched. He designed the algorithm behind our online estimate tool.',
    years: 15,
  },
  {
    id: '4',
    name: 'James Mitchell',
    role: 'Project Foreman',
    bio: 'James leads our installation crews with precision and care. He\'s known for his attention to detail and for treating every home like it\'s his own. His crews consistently receive 5-star reviews.',
    years: 12,
  },
]

export const companyInfo: CompanyInfo = {
  name: 'Smart Roof Pricing',
  founded: 2010,
  description: 'Smart Roof Pricing was built by Farrell Roofing, a family-owned company that has been protecting homes and families for over a decade. We created this tool because we believe every homeowner deserves to know what their roof should cost before talking to a single contractor.',
  mission: 'To give every homeowner honest, transparent, and accurate roofing estimates. We believe you deserve to know exactly what you\'re paying for and why, powered by real data from real projects.',
  values: [
    {
      title: 'Honesty First',
      description: 'We\'ll never recommend work you don\'t need or hide costs in fine print.',
    },
    {
      title: 'Quality Craftsmanship',
      description: 'Every roof we install is one we\'d be proud to put on our own home.',
    },
    {
      title: 'Respect Your Time',
      description: 'We show up when we say we will and finish when we promise.',
    },
    {
      title: 'Stand Behind Our Work',
      description: 'Our warranties mean something. If there\'s an issue, we\'ll fix it.',
    },
  ],
  stats: [
    { label: 'Years in Business', value: '15+' },
    { label: 'Roofs Completed', value: '8,500+' },
    // Customer rating removed - only show when BUSINESS_CONFIG.reviews.googleRating is set
    { label: 'Team Members', value: '45+' },
  ],
  licenses: [
    'State Licensed Roofing Contractor',
    'Fully Bonded & Insured',
    'EPA Lead-Safe Certified',
  ],
  // Certifications are now gated behind BUSINESS_CONFIG.credentials flags
  // and displayed conditionally in the about page
  certifications: [],
}
