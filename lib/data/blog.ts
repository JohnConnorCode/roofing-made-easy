/**
 * Blog/Resources Data
 *
 * Educational content for SEO and customer education.
 */

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishedAt: string
  readTime: number
  featured?: boolean
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'signs-you-need-new-roof',
    title: '7 Warning Signs You Need a New Roof',
    excerpt: 'Don\'t wait until you see water stains on your ceiling. Learn the early warning signs that indicate your roof may need replacement.',
    content: `
# 7 Warning Signs You Need a New Roof

Your roof protects everything you own, but it doesn't last forever. Here are the key signs that it might be time for a replacement:

## 1. Age of Your Roof
Most asphalt shingle roofs last 20-25 years. If yours is approaching this age, it's time to start planning.

## 2. Curling or Buckling Shingles
Shingles that curl at the edges or buckle in the middle have reached the end of their useful life.

## 3. Missing Shingles
A few missing shingles can be repaired, but widespread loss indicates systemic failure.

## 4. Granules in Gutters
Finding excessive granules in your gutters means your shingles are deteriorating.

## 5. Daylight Through Roof Boards
If you can see light coming through your attic, water can get in too.

## 6. Sagging Roof Deck
A sagging roof indicates structural issues that need immediate attention.

## 7. Higher Energy Bills
A failing roof often means poor insulation and ventilation, leading to higher costs.

## What to Do Next

If you notice any of these signs, get a professional inspection. Many issues can be caught early and repaired, potentially extending your roof's life by years.

[Get a Free Estimate](/estimate) to understand your options and costs.
    `,
    category: 'Maintenance',
    author: 'Carlos Rivera',
    publishedAt: '2024-10-15',
    readTime: 5,
    featured: true,
    tags: ['roof replacement', 'maintenance', 'inspection'],
  },
  {
    id: '2',
    slug: 'asphalt-vs-metal-roofing',
    title: 'Asphalt vs. Metal Roofing: Which Is Right for You?',
    excerpt: 'Comparing cost, durability, and appearance of the two most popular roofing materials.',
    content: `
# Asphalt vs. Metal Roofing: Which Is Right for You?

Choosing between asphalt and metal roofing? Here's what you need to know.

## Asphalt Shingles

**Pros:**
- Lower upfront cost ($3-5 per sq ft)
- Wide variety of colors and styles
- Easy to repair
- Familiar to all contractors

**Cons:**
- Shorter lifespan (20-30 years)
- Less energy efficient
- More susceptible to storm damage

## Metal Roofing

**Pros:**
- Lasts 50+ years
- Highly energy efficient
- Excellent storm resistance
- Low maintenance

**Cons:**
- Higher upfront cost ($7-12 per sq ft)
- Fewer style options
- Specialized installation required

## The Bottom Line

If you plan to stay in your home long-term, metal roofing often provides better value. For shorter-term ownership, asphalt makes financial sense.

[Get estimates for both options](/estimate) to compare costs for your specific roof.
    `,
    category: 'Materials',
    author: 'Mike Farrell',
    publishedAt: '2024-09-28',
    readTime: 4,
    featured: true,
    tags: ['metal roofing', 'asphalt shingles', 'comparison'],
  },
  {
    id: '3',
    slug: 'roof-maintenance-checklist',
    title: 'Seasonal Roof Maintenance Checklist',
    excerpt: 'Simple maintenance tasks that can extend your roof\'s life by years.',
    content: `
# Seasonal Roof Maintenance Checklist

A little maintenance goes a long way. Here's what to do each season.

## Spring

- [ ] Inspect for winter damage
- [ ] Clear debris from roof surface
- [ ] Check and clean gutters
- [ ] Look for moss or algae growth
- [ ] Inspect flashing around vents

## Summer

- [ ] Check attic ventilation
- [ ] Look for heat damage to shingles
- [ ] Trim overhanging branches
- [ ] Inspect for pest damage

## Fall

- [ ] Clear leaves and debris
- [ ] Clean and inspect gutters
- [ ] Check for loose shingles
- [ ] Ensure proper drainage

## Winter

- [ ] Monitor for ice dams
- [ ] Clear heavy snow if safe
- [ ] Check attic for moisture
- [ ] Look for interior water stains

## When to Call a Professional

Some tasks require professional attention:
- Walking on the roof
- Repairing damaged shingles
- Addressing structural issues
- Annual professional inspection

[Schedule an inspection](/estimate) to catch problems early.
    `,
    category: 'Maintenance',
    author: 'Lisa Farrell',
    publishedAt: '2024-09-10',
    readTime: 3,
    tags: ['maintenance', 'checklist', 'seasonal'],
  },
  {
    id: '4',
    slug: 'roof-insurance-claims',
    title: 'How to File a Roof Insurance Claim: Step-by-Step Guide',
    excerpt: 'Navigate the insurance claim process with confidence using this comprehensive guide.',
    content: `
# How to File a Roof Insurance Claim

Storm damage? Here's how to work with your insurance company.

## Step 1: Document the Damage

Before touching anything:
- Take photos and videos
- Note the date and time of damage
- Keep damaged materials if safe

## Step 2: Prevent Further Damage

You're required to mitigate further damage:
- Apply tarps if needed
- Board up holes
- Save receipts for emergency repairs

## Step 3: Contact Your Insurance Company

- File claim promptly (most require 60-day notice)
- Get your claim number
- Ask about deductible and coverage

## Step 4: Get Professional Inspection

Have a licensed contractor:
- Provide detailed damage assessment
- Document with photos
- Prepare repair estimate

## Step 5: Meet with the Adjuster

When the adjuster visits:
- Have your contractor present if possible
- Point out all damage
- Get everything in writing

## Step 6: Review the Settlement

Before accepting:
- Compare to contractor estimate
- Understand what's covered
- Know your appeal rights

## We Can Help

We work with insurance companies regularly and can help document your claim properly.

[Get a free damage assessment](/estimate) with detailed documentation for your claim.
    `,
    category: 'Insurance',
    author: 'Carlos Rivera',
    publishedAt: '2024-08-25',
    readTime: 6,
    featured: true,
    tags: ['insurance', 'storm damage', 'claims'],
  },
  {
    id: '5',
    slug: 'choosing-roofing-contractor',
    title: '10 Questions to Ask Before Hiring a Roofing Contractor',
    excerpt: 'Protect yourself from scams and poor workmanship by asking these essential questions.',
    content: `
# 10 Questions to Ask Before Hiring a Roofing Contractor

Not all roofing contractors are created equal. Ask these questions to protect yourself.

## 1. Are You Licensed and Insured?

Get proof of:
- State contractor license
- General liability insurance
- Workers' compensation

## 2. How Long Have You Been in Business?

Look for established companies with:
- 5+ years in business
- Local reputation
- Physical address

## 3. Will You Provide a Written Estimate?

The estimate should include:
- Itemized costs
- Materials specified
- Timeline
- Payment terms

## 4. What Warranties Do You Offer?

Understand both:
- Manufacturer warranty (materials)
- Workmanship warranty (labor)

## 5. Can You Provide References?

Ask for:
- Recent projects
- Similar scope of work
- Contact information

## 6. Who Will Be On-Site?

Know:
- Project foreman
- Crew size
- Subcontractor usage

## 7. How Do You Handle Permits?

The contractor should:
- Pull necessary permits
- Schedule inspections
- Ensure code compliance

## 8. What's Your Payment Schedule?

Beware of:
- Large upfront payments
- Cash-only demands
- Pressure tactics

## 9. How Do You Protect My Property?

Expect:
- Landscaping protection
- Debris containment
- Daily cleanup

## 10. What Happens If There Are Problems?

Understand:
- Communication process
- Dispute resolution
- Warranty claims

## The Bottom Line

A reputable contractor will answer these questions readily. Hesitation is a red flag.
    `,
    category: 'Guides',
    author: 'Mike Farrell',
    publishedAt: '2024-08-10',
    readTime: 7,
    tags: ['contractor', 'hiring', 'tips'],
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(p => p.featured)
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(p => p.category === category)
}

export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(p => p.tags.includes(tag))
}

export function getCategories(): string[] {
  return [...new Set(blogPosts.map(p => p.category))]
}
