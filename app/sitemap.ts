import { MetadataRoute } from 'next'
import { getAllCities, getAllCounties } from '@/lib/data/ms-locations'
import { getAllServices } from '@/lib/data/services'
import { getAllBlogPosts } from '@/lib/data/blog'
import { getAllServiceSlugs } from '@/lib/data/ms-services'
import { isRealPortfolioData } from '@/lib/data/portfolio'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

  // Use fixed dates for static content - only update when content actually changes
  const staticContentDate = new Date('2026-02-11')
  const pricingContentDate = new Date('2026-02-11')

  // Get all dynamic content
  const cities = getAllCities()
  const counties = getAllCounties()
  const services = getAllServices()
  const blogPosts = getAllBlogPosts()
  const msServiceSlugs = getAllServiceSlugs()

  // Static pages with priority ordering
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: staticContentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/service-areas`,
      lastModified: staticContentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...(isRealPortfolioData ? [{
      url: `${baseUrl}/portfolio`,
      lastModified: staticContentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }] : []),
    {
      url: `${baseUrl}/blog`,
      lastModified: staticContentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/financing`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/insurance-help`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/assistance-programs`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/referral`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: staticContentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticContentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // Pricing pages - high priority for SEO
  const pricingPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/pricing`,
      lastModified: pricingContentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing/roof-replacement-cost`,
      lastModified: pricingContentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing/metal-roof-cost`,
      lastModified: pricingContentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing/roof-repair-cost`,
      lastModified: pricingContentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ]

  // City location pages - highest priority for local SEO
  const cityPages: MetadataRoute.Sitemap = cities.map(city => ({
    url: `${baseUrl}/${city.slug}-roofing`,
    lastModified: staticContentDate,
    changeFrequency: 'weekly' as const,
    priority: city.isHQ ? 1.0 : city.priority === 'high' ? 0.95 : 0.85,
  }))

  // County location pages
  const countyPages: MetadataRoute.Sitemap = counties.map(county => ({
    url: `${baseUrl}/${county.slug}-roofing`,
    lastModified: staticContentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Service pages
  const servicePages: MetadataRoute.Sitemap = services.map(service => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: staticContentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.7 : 0.6,
  }))

  // Service + City combo pages (high-value for local SEO)
  // Generate for all cities, not just high priority
  const serviceCityPages: MetadataRoute.Sitemap = []

  for (const service of msServiceSlugs) {
    for (const city of cities) {
      serviceCityPages.push({
        url: `${baseUrl}/${service}-${city.slug}-ms`,
        lastModified: staticContentDate,
        changeFrequency: 'monthly' as const,
        // Higher priority for high-priority cities
        priority: city.isHQ ? 0.85 : city.priority === 'high' ? 0.8 : 0.7,
      })
    }
  }

  // Comparison pages - "Best Roofers in [City]" (high priority for local SEO)
  const comparisonPages: MetadataRoute.Sitemap = cities.map(city => ({
    url: `${baseUrl}/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}`,
    lastModified: staticContentDate,
    changeFrequency: 'monthly' as const,
    priority: city.isHQ ? 0.9 : city.priority === 'high' ? 0.85 : 0.75,
  }))

  return [
    ...staticPages,
    ...pricingPages,
    ...cityPages,
    ...countyPages,
    ...servicePages,
    ...blogPages,
    ...serviceCityPages,
    ...comparisonPages,
  ]
}