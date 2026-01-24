/**
 * Team & Company Data
 *
 * Information about the company and team members.
 */

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
    bio: 'Mike started Farrell Roofing over 20 years ago with a simple mission: provide honest, quality roofing services without the typical contractor runaround. A third-generation roofer, he learned the trade from his father and grandfather.',
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
  name: 'Farrell Roofing',
  founded: 2003,
  description: 'Farrell Roofing has been protecting homes and families for over two decades. What started as a small family operation has grown into one of the region\'s most trusted roofing companies, but we\'ve never lost sight of our roots.',
  mission: 'To provide every homeowner with honest, transparent, and high-quality roofing services. We believe you deserve to know exactly what you\'re paying for and why.',
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
    { label: 'Years in Business', value: '20+' },
    { label: 'Roofs Completed', value: '8,500+' },
    { label: 'Customer Rating', value: '4.9/5' },
    { label: 'Team Members', value: '45+' },
  ],
  licenses: [
    'State Licensed Roofing Contractor',
    'Fully Bonded & Insured',
    'EPA Lead-Safe Certified',
  ],
  certifications: [
    'GAF Master Elite Contractor',
    'Owens Corning Preferred Contractor',
    'CertainTeed SELECT ShingleMaster',
    'BBB A+ Rating',
  ],
}
