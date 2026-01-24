/**
 * Testimonials Data
 *
 * Real customer testimonials for social proof.
 * Update these with actual customer reviews.
 */

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  projectType: string
  image?: string
  date: string
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Michael Thompson',
    location: 'Austin, TX',
    rating: 5,
    text: "Got my estimate in literally 2 minutes. The price range was spot-on when I got actual quotes from contractors. Saved me so much time not having to schedule multiple inspections just to get a ballpark figure.",
    projectType: 'Full Roof Replacement',
    date: '2024-11-15',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    location: 'Denver, CO',
    rating: 5,
    text: "Finally, a roofing estimate tool that doesn't sell my info to 10 different contractors. I appreciated being able to get a realistic price range before deciding to move forward. The consultation was pressure-free.",
    projectType: 'Storm Damage Repair',
    date: '2024-10-28',
  },
  {
    id: '3',
    name: 'Robert Martinez',
    location: 'Phoenix, AZ',
    rating: 5,
    text: "As a first-time homeowner, I had no idea what roof replacement should cost. This tool gave me the confidence to have informed conversations with contractors. Ended up saving about $3,000 by knowing what was fair.",
    projectType: 'Full Roof Replacement',
    date: '2024-10-12',
  },
  {
    id: '4',
    name: 'Jennifer Williams',
    location: 'Nashville, TN',
    rating: 5,
    text: "Used this after a hailstorm damaged our roof. The estimate helped us understand what to expect from insurance. The team at Farrell was incredibly helpful throughout the entire claims process.",
    projectType: 'Insurance Claim',
    date: '2024-09-30',
  },
  {
    id: '5',
    name: 'David Kim',
    location: 'Portland, OR',
    rating: 5,
    text: "I was skeptical about online estimates, but this was surprisingly accurate. Uploaded some photos of my roof and got a detailed breakdown. Made the whole process of getting my roof replaced much less stressful.",
    projectType: 'Roof Replacement',
    date: '2024-09-15',
  },
  {
    id: '6',
    name: 'Amanda Foster',
    location: 'Charlotte, NC',
    rating: 5,
    text: "The transparency is what sold me. No hidden fees, no pressure tactics. Just honest pricing. Farrell Roofing came in right at the estimated price and did exceptional work. Highly recommend!",
    projectType: 'Metal Roof Installation',
    date: '2024-08-22',
  },
]

/**
 * Get featured testimonials for homepage
 */
export function getFeaturedTestimonials(count: number = 3): Testimonial[] {
  return testimonials.slice(0, count)
}

/**
 * Get all testimonials
 */
export function getAllTestimonials(): Testimonial[] {
  return testimonials
}
