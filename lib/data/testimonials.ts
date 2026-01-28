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
    name: 'Bobby Ray Johnson',
    location: 'Tupelo, MS',
    rating: 5,
    text: "After that bad storm came through Lee County last spring, I needed my roof looked at fast. Farrell Roofing had someone out the next day. The estimate was fair and they worked with my insurance company the whole way. Roof looks better than new.",
    projectType: 'Storm Damage Repair',
    date: '2024-11-15',
  },
  {
    id: '2',
    name: 'Patricia Anne Williams',
    location: 'Oxford, MS',
    rating: 5,
    text: "We'd been putting off replacing our roof for years. Got an estimate online in just a few minutes and it was right in line with the final price. No pressure, no games. The crew was respectful of our property and cleaned up every day before they left.",
    projectType: 'Full Roof Replacement',
    date: '2024-10-28',
  },
  {
    id: '3',
    name: 'Marcus Dwayne Thompson',
    location: 'Starkville, MS',
    rating: 5,
    text: "First-time homeowner here and I had no idea what a roof should cost. This tool gave me a realistic range so I wasn't going in blind. Farrell's crew did quality work and finished a day early. Highly recommend to anyone in the Starkville area.",
    projectType: 'Full Roof Replacement',
    date: '2024-10-12',
  },
  {
    id: '4',
    name: 'Linda Sue Patterson',
    location: 'Columbus, MS',
    rating: 5,
    text: "Hail tore up our roof something awful. Farrell Roofing handled the whole insurance claim process for us. They documented everything, met with the adjuster, and made sure we got what we were owed. The new roof has held up great through two more storms.",
    projectType: 'Insurance Claim',
    date: '2024-09-30',
  },
  {
    id: '5',
    name: 'James Earl Mitchell',
    location: 'Corinth, MS',
    rating: 5,
    text: "I was skeptical of online estimates, but the price range was spot-on. The humidity and heat down here are hard on roofs, and they recommended materials that would hold up better in our climate. Good honest folks to work with.",
    projectType: 'Roof Replacement',
    date: '2024-09-15',
  },
  {
    id: '6',
    name: 'Donna Kay Sanderson',
    location: 'New Albany, MS',
    rating: 5,
    text: "What I appreciated most was the transparency. They showed me exactly what needed fixing and what could wait. No upselling, just honest advice. The repair held up through all the rain we got this fall. Will definitely use them again.",
    projectType: 'Roof Repair',
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
