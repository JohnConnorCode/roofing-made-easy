// Local Statistics Component
import { MSCity, MSCounty } from '@/lib/data/ms-locations'
import { DollarSign, Clock, CloudLightning, Home } from 'lucide-react'

interface LocalStatsProps {
  city?: MSCity
  county?: MSCounty
}

export function LocalStats({ city, county }: LocalStatsProps) {
  const locationName = city?.name || county?.name || ''

  if (!city && !county) return null

  // Build stat items based on whether we have city or county data
  const statItems = city
    ? [
        {
          icon: DollarSign,
          label: 'Average Roof Cost',
          value: city.stats.avgReplacementCost,
          description: `in ${locationName}`
        },
        {
          icon: Clock,
          label: 'Average Roof Age',
          value: city.stats.avgRoofAge,
          description: 'in the area'
        },
        {
          icon: CloudLightning,
          label: 'Storm Risk',
          value: city.stats.stormDamageFrequency,
          description: 'annual exposure'
        }
      ]
    : county
    ? [
        {
          icon: DollarSign,
          label: 'Average Roof Cost',
          value: county.stats.avgReplacementCost,
          description: `in ${locationName}`
        },
        {
          icon: Home,
          label: 'Total Homes',
          value: county.stats.totalHomes,
          description: 'in county'
        },
        {
          icon: CloudLightning,
          label: 'Storm Risk',
          value: county.stats.stormDamageFrequency,
          description: 'annual exposure'
        }
      ]
    : []

  return (
    <section className="py-12 bg-slate-deep">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          Roofing Statistics for {locationName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="bg-ink/50 border border-gold/10 rounded-xl p-6 text-center hover:border-gold/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                <stat.icon className="w-6 h-6 text-gold" />
              </div>
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
