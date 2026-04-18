import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Get a Free Roofing Quote',
  description: 'Contact Farrell Roofing for a free estimate. Serving Tupelo and Northeast Mississippi. Call us or fill out our contact form for fast, friendly service.',
  openGraph: {
    title: 'Contact Farrell Roofing | Free Estimates',
    description: 'Get in touch with our roofing experts. Free estimates for Tupelo and Northeast Mississippi.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
