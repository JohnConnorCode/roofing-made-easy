import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

  return {
    rules: [
      // Default rules for all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login/',
          '/leads/',
          '/_next/',
          '/private/',
        ],
      },
      // Google bot - full access to public content
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/login/', '/leads/'],
      },
      // Bing bot - full access to public content
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/login/', '/leads/'],
      },
      // AI Crawlers - 2026 AI Discoverability
      // GPTBot (OpenAI/ChatGPT)
      {
        userAgent: 'GPTBot',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/services/', '/blog/', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/login/', '/leads/', '/dashboard/'],
      },
      // Claude-Web (Anthropic/Claude)
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/services/', '/blog/', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/login/', '/leads/', '/dashboard/'],
      },
      // Anthropic AI
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/services/', '/blog/', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/login/', '/leads/', '/dashboard/'],
      },
      // PerplexityBot
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/services/', '/blog/', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/login/', '/leads/', '/dashboard/'],
      },
      // Google-Extended (Gemini/Bard training)
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/services/', '/blog/', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/login/', '/leads/', '/dashboard/'],
      },
      // CCBot (Common Crawl - used by many AI models)
      {
        userAgent: 'CCBot',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/services/', '/blog/', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/login/', '/leads/', '/dashboard/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
    host: baseUrl,
  }
}
