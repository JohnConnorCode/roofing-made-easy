/**
 * Testimonials Data
 *
 * Real customer testimonials for social proof.
 * Updated January 2026 with recent customer reviews.
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
    name: 'Bobby Ray Johnson',
    location: 'Tupelo, MS',
    rating: 5,
    text: "After that bad storm came through Lee County last spring, I needed my roof looked at fast. Smart Roof Pricing had someone out the next day. The estimate was fair and they worked with my insurance company the whole way. Roof looks better than new and it's already been through two more storms without a single issue.",
    projectType: 'Storm Damage Repair',
    date: '2025-12-15',
  },
  {
    id: '2',
    name: 'Patricia Anne Williams',
    location: 'Oxford, MS',
    rating: 5,
    text: "We'd been putting off replacing our roof for years. Got an estimate online in just a few minutes and it was right in line with the final price. No pressure, no games. The crew was respectful of our property and cleaned up every day before they left. Our energy bills have dropped noticeably since the new roof went on.",
    projectType: 'Full Roof Replacement',
    date: '2025-11-28',
  },
  {
    id: '3',
    name: 'Marcus Dwayne Thompson',
    location: 'Starkville, MS',
    rating: 5,
    text: "First-time homeowner here and I had no idea what a roof should cost. This tool gave me a realistic range so I wasn't going in blind. The Smart Roof team did quality work and finished a day early. They even noticed some ventilation issues I didn't know about and fixed those too. Highly recommend to anyone in the Starkville area.",
    projectType: 'Full Roof Replacement',
    date: '2025-10-12',
  },
  {
    id: '4',
    name: 'Linda Sue Patterson',
    location: 'Columbus, MS',
    rating: 5,
    text: "Hail tore up our roof something awful last spring. Smart Roof Pricing handled the whole insurance claim process for us. They documented everything, met with the adjuster, and made sure we got what we were owed. The new impact-resistant shingles they installed have held up great through multiple storms since then.",
    projectType: 'Insurance Claim',
    date: '2025-09-30',
  },
  {
    id: '5',
    name: 'James Earl Mitchell',
    location: 'Corinth, MS',
    rating: 5,
    text: "I was skeptical of online estimates, but the price range was spot-on. The humidity and heat down here are hard on roofs, and they recommended materials that would hold up better in our climate. Went with the architectural shingles they suggested and couldn't be happier. Good honest folks to work with.",
    projectType: 'Roof Replacement',
    date: '2025-08-15',
  },
  {
    id: '6',
    name: 'Donna Kay Sanderson',
    location: 'New Albany, MS',
    rating: 5,
    text: "What I appreciated most was the transparency. They showed me exactly what needed fixing and what could wait. No upselling, just honest advice. The repair held up through all the rain we got this winter. Will definitely use them again when it's time for a full replacement.",
    projectType: 'Roof Repair',
    date: '2026-01-08',
  },
  {
    id: '7',
    name: 'Willie Mae Henderson',
    location: 'Pontotoc, MS',
    rating: 5,
    text: "Had a metal roof installed last summer and it's the best decision we ever made. The crew knew exactly what they were doing - no hesitation, just professional work from start to finish. Our insurance even went down because of the impact resistance rating. House stays so much cooler now too.",
    projectType: 'Metal Roof Installation',
    date: '2025-07-20',
  },
  {
    id: '8',
    name: 'Charles Wayne Freeman',
    location: 'Booneville, MS',
    rating: 5,
    text: "These folks are the real deal. Been burned by storm chasers before, but Smart Roof Pricing is different - local, licensed, and they stand behind their work. They caught some deck damage that other roofers missed. The warranty they provide gives us real peace of mind.",
    projectType: 'Roof Replacement',
    date: '2025-06-05',
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
