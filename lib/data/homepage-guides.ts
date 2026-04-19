import { Home, Layers, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface HomepageGuide {
  href: string
  eyebrow: string
  title: string
  body: string
  meta: string
  icon: LucideIcon
}

export const HOMEPAGE_GUIDES: HomepageGuide[] = [
  {
    href: '/pricing/roof-replacement-cost',
    eyebrow: 'Pricing guide',
    title: 'What a full roof replacement actually costs',
    body: 'Tear-off, underlayment, shingles, labor, disposal — the real line items, with local Northeast Mississippi numbers.',
    meta: '$14k–$34k typical',
    icon: Home,
  },
  {
    href: '/pricing/metal-roof-cost',
    eyebrow: 'Pricing guide',
    title: 'Metal roofing, priced in plain English',
    body: 'Standing-seam vs screw-down, 24-gauge vs 26, and when the premium is worth it for a Mississippi home.',
    meta: '$18k–$42k typical',
    icon: Layers,
  },
  {
    href: '/pricing/roof-repair-cost',
    eyebrow: 'Pricing guide',
    title: 'When a repair makes more sense than a replacement',
    body: 'Spot-repair vs partial re-roof vs full replacement — how to tell which your roof actually needs.',
    meta: '$400–$4k typical',
    icon: Wrench,
  },
]
