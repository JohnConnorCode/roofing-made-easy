import { MetadataRoute } from 'next'
import { getAllCities, getAllCounties } from '@/lib/data/ms-locations'
import { getAllServices } from '@/lib/data/services'
import { getAllBlogPosts } from '@/lib/data/blog'
import { getAllServiceSlugs } from '@/lib/data/ms-services'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'
  const currentDate = new Date()

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
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/service-areas`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/financing`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/referral`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // City location pages - highest priority for local SEO
  const cityPages: MetadataRoute.Sitemap = cities.map(city => ({
    url: `${baseUrl}/${city.slug}-roofing`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: city.isHQ ? 1.0 : city.priority === 'high' ? 0.95 : 0.85,
  }))

  // County location pages
  const countyPages: MetadataRoute.Sitemap = counties.map(county => ({
    url: `${baseUrl}/${county.slug}-roofing`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Service pages
  const servicePages: MetadataRoute.Sitemap = services.map(service => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: currentDate,
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
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        // Higher priority for high-priority cities
        priority: city.isHQ ? 0.85 : city.priority === 'high' ? 0.8 : 0.7,
      })
    }
  }

  return [
    ...staticPages,
    ...cityPages,
    ...countyPages,
    ...servicePages,
    ...blogPages,
    ...serviceCityPages,
  ]
}

// Also export a separate sitemap for images (optional enhancement)
export async function generateSitemaps() {
  // Return array of sitemap IDs if you want to split into multiple sitemaps
  // This is useful for very large sites (>50,000 URLs)
  return [{ id: 0 }]
}
