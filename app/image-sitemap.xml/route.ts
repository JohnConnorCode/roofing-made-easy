import { getAllCities, getAllCounties } from '@/lib/data/ms-locations'
import { getAllBlogPosts } from '@/lib/data/blog'
import { getAllServices } from '@/lib/data/services'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

interface ImageEntry {
  loc: string
  images: Array<{
    url: string
    title?: string
    caption?: string
    geoLocation?: string
  }>
}

export async function GET() {
  const cities = getAllCities()
  const counties = getAllCounties()
  const blogPosts = getAllBlogPosts()
  const services = getAllServices()

  const imageEntries: ImageEntry[] = []

  // Location images for cities
  cities.forEach(city => {
    imageEntries.push({
      loc: `${BASE_URL}/${city.slug}-roofing`,
      images: [
        {
          url: `${BASE_URL}/images/locations/${city.slug}-roofing.jpg`,
          title: `Roofing Services in ${city.name}, Mississippi`,
          caption: `Professional roofing contractor serving ${city.name}, ${city.county} County, MS`,
          geoLocation: `${city.name}, Mississippi, USA`,
        },
      ],
    })
  })

  // Location images for counties
  counties.forEach(county => {
    imageEntries.push({
      loc: `${BASE_URL}/${county.slug}-roofing`,
      images: [
        {
          url: `${BASE_URL}/images/locations/${county.slug}-roofing.jpg`,
          title: `Roofing Services in ${county.name} County, Mississippi`,
          caption: `Professional roofing contractor serving ${county.name} County, MS`,
          geoLocation: `${county.name} County, Mississippi, USA`,
        },
      ],
    })
  })

  // Blog post images
  blogPosts.forEach(post => {
    if (post.image) {
      imageEntries.push({
        loc: `${BASE_URL}/blog/${post.slug}`,
        images: [
          {
            url: `${BASE_URL}${post.image}`,
            title: post.title,
            caption: post.excerpt,
          },
        ],
      })
    }
  })

  // Service page images (only if image exists)
  services.forEach(service => {
    if (service.image) {
      imageEntries.push({
        loc: `${BASE_URL}/services/${service.slug}`,
        images: [
          {
            url: `${BASE_URL}${service.image}`,
            title: service.name,
            caption: service.shortDescription,
          },
        ],
      })
    }
  })

  // Filter out entries with missing images (e.g., if location image doesn't exist)
  // This is a safety measure - in production, ensure all images referenced exist

  // Default OG image for homepage
  imageEntries.push({
    loc: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/images/og-default.jpg`,
        title: 'Farrell Roofing - Northeast Mississippi Roofing Experts',
        caption: 'Professional roofing services in Tupelo and Northeast Mississippi',
        geoLocation: 'Tupelo, Mississippi, USA',
      },
    ],
  })

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries
  .map(
    entry => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${entry.images
  .map(
    img => `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
${img.title ? `      <image:title>${escapeXml(img.title)}</image:title>\n` : ''}${img.caption ? `      <image:caption>${escapeXml(img.caption)}</image:caption>\n` : ''}${img.geoLocation ? `      <image:geo_location>${escapeXml(img.geoLocation)}</image:geo_location>\n` : ''}    </image:image>`
  )
  .join('\n')}
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
