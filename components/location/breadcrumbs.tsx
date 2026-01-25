// Breadcrumb Navigation Component
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbSchema } from '@/components/seo/location-schema'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Build schema items
  const schemaItems = [
    { name: 'Home', url: '/' },
    ...items.map(item => ({ name: item.name, url: item.href }))
  ]

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />

      <nav aria-label="Breadcrumb" className="bg-ink/50 border-b border-gold/10">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 py-3 text-sm overflow-x-auto">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 text-gray-400 hover:text-gold transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
            </li>

            {items.map((item, index) => (
              <li key={item.href} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                {index === items.length - 1 ? (
                  <span className="text-gold font-medium truncate">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-gold transition-colors truncate"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  )
}
