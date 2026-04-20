/**
 * Team & Company Data — Farrell Roofing / Smart Roof Pricing
 * Robert Farrell (owner, Smart Roof Pricing) and Bob Farrell (founder, Farrell Roofing)
 */

export const isRealTeamData = true

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
  founderStory: string
  mission: string
  values: { title: string; description: string }[]
  stats: { label: string; value: string }[]
  licenses: string[]
  certifications: string[]
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Robert Farrell',
    role: 'Owner, Smart Roof Pricing',
    bio: 'Robert grew up in the roofing business watching his father Bob build Farrell Roofing into one of Northeast Mississippi\'s most trusted contractors. He built Smart Roof Pricing to solve a problem he saw firsthand: homeowners have no idea what a roof should cost before the first contractor shows up. That information gap costs people thousands of dollars every year. Smart Roof Pricing fixes it.',
    years: 15,
  },
  {
    id: '2',
    name: 'Bob Farrell',
    role: 'Founder, Farrell Roofing',
    bio: 'Bob Farrell has been roofing across Northeast Mississippi for decades. He built Farrell Roofing on a single standard: install every roof the way you\'d want your own done — right nail count, right ventilation, right flashing. He still runs crews and still gets on roofs. That\'s where he learned everything worth knowing.',
    years: 30,
  },
]

export const companyInfo: CompanyInfo = {
  name: 'Farrell Roofing',
  founded: 2010,
  description: 'Farrell Roofing is a father-and-son operation serving Northeast Mississippi. Bob Farrell built the company. His son Robert built Smart Roof Pricing because homeowners deserve to know what a roof costs before a contractor walks in the door.',
  founderStory: `Bob Farrell started roofing in Northeast Mississippi the way most people do — learning by doing, on someone else's crew, until he knew enough to do it right on his own. He built Farrell Roofing one job at a time, in Fulton, Tupelo, Amory, Saltillo, and the surrounding communities he's lived in his whole life.

Robert grew up in that business. Summers on the job site, weekends helping with estimates, watching his dad fix roofs that other contractors had done wrong — bad nail patterns, no ventilation, flashing that was barely attached. He learned what a properly installed roof looks like, and he learned what it costs.

That's the problem Smart Roof Pricing exists to solve. Most homeowners get their first roofing quote with no idea what the job should actually run. Contractors who know that can charge whatever they want. Robert built the pricing tool so that doesn't happen anymore — so a homeowner in Tupelo or Saltillo or Fulton walks into every conversation already knowing the real number.

Farrell Roofing is also involved in the Itawamba Crossroads Ranch and in training the next generation of roofers in Northeast Mississippi. The industry has a shortage of skilled workers, and both Bob and Robert are committed to fixing that.`,
  mission: 'To give every homeowner in Northeast Mississippi honest, transparent pricing before they ever talk to a contractor — backed by real job data from Farrell Roofing\'s years of installations across the region.',
  values: [
    {
      title: 'Higher caliber, every time',
      description: 'Bob built the company around one standard: the right nail count, the right ventilation, the right flashing — on every job. Not just the ones where someone\'s watching.',
    },
    {
      title: 'Transparency before the sale',
      description: 'Robert built Smart Roof Pricing specifically because homeowners shouldn\'t have to guess what their roof costs. The information exists. It should be available.',
    },
    {
      title: 'Community investment',
      description: 'Farrell Roofing supports the Itawamba Crossroads Ranch and is committed to training the next generation of skilled roofers in Northeast Mississippi.',
    },
    {
      title: 'Stand behind the work',
      description: 'A Farrell installation comes with a real workmanship warranty. If there\'s an installation issue, they fix it. That\'s the deal.',
    },
  ],
  stats: [
    { label: 'Years in Northeast MS', value: '15+' },
    { label: 'Roofs completed', value: '8,500+' },
    { label: 'Communities served', value: '20+' },
  ],
  licenses: [
    'Mississippi State Licensed Roofing Contractor',
    'Fully Bonded & Insured',
    'EPA Lead-Safe Certified',
  ],
  certifications: [],
}
