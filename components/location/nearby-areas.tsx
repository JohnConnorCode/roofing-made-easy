// Nearby Areas / Internal Linking Component
import { MSCity, getNearbyCities, getCitiesByCounty } from '@/lib/data/ms-locations'
import { MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface NearbyAreasProps {
  city: MSCity
}

export function NearbyAreas({ city }: NearbyAreasProps) {
  const nearbyCities = getNearbyCities(city.slug)

  // Find the county for this city
  const countySlug = `${city.county.toLowerCase()}-county`

  if (nearbyCities.length === 0) return null

  return (
    <section className="py-12 bg-ink">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Also Serving Nearby Areas
          </h2>
          <p className="text-slate-400 text-center mb-8">
            In addition to {city.name}, Farrell Roofing serves these nearby communities in Northeast Mississippi.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {nearbyCities.map((nearbyCity) => (
              <Link
                key={nearbyCity.slug}
                href={`/${nearbyCity.slug}-roofing`}
                className="group flex items-center gap-2 bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-lg p-4 transition-all"
              >
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {nearbyCity.name}
                </span>
              </Link>
            ))}
          </div>

          {/* County Link */}
          <div className="text-center">
            <Link
              href={`/${countySlug}-roofing`}
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <span>View all of {city.county} County</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

interface CountyAreasProps {
  countySlug: string
  countyName: string
}

export function CountyAreas({ countySlug, countyName }: CountyAreasProps) {
  const citiesInCounty = getCitiesByCounty(countySlug)

  if (citiesInCounty.length === 0) return null

  return (
    <section className="py-12 bg-ink">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Cities We Serve in {countyName}
          </h2>
          <p className="text-slate-400 text-center mb-8">
            Farrell Roofing provides comprehensive roofing services throughout {countyName}.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {citiesInCounty.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}-roofing`}
                className="group flex items-center justify-between bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-lg p-4 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {city.name}
                  </span>
                </div>
                {city.isHQ && (
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                    HQ
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
