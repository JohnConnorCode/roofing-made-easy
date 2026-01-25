// Local Content Section - Unique content per city
import { MSCity } from '@/lib/data/ms-locations'
import { CloudRain, Home, MapPin, Landmark } from 'lucide-react'

interface LocalContentProps {
  city: MSCity
}

export function LocalContent({ city }: LocalContentProps) {
  return (
    <section className="py-12 bg-ink">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Intro Paragraph */}
          <div className="prose prose-invert prose-gold max-w-none mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Your Local Roofing Experts in {city.name}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {city.localContent.intro}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weather Challenges */}
            <div className="bg-slate-deep/50 border border-gold/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <CloudRain className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white">Local Weather Challenges</h3>
              </div>
              <ul className="space-y-2">
                {city.localContent.weatherChallenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-400">
                    <span className="text-gold mt-1">•</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Roof Types */}
            <div className="bg-slate-deep/50 border border-gold/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white">Common Roof Types</h3>
              </div>
              <ul className="space-y-2">
                {city.localContent.commonRoofTypes.map((type, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-400">
                    <span className="text-gold mt-1">•</span>
                    <span>{type}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Neighborhoods */}
            {city.localContent.neighborhoods.length > 0 && (
              <div className="bg-slate-deep/50 border border-gold/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Areas We Serve</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city.localContent.neighborhoods.map((neighborhood, index) => (
                    <span
                      key={index}
                      className="bg-ink/50 border border-gold/10 text-gray-300 text-sm px-3 py-1 rounded-full"
                    >
                      {neighborhood}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Local Landmarks */}
            {city.localContent.landmarks.length > 0 && (
              <div className="bg-slate-deep/50 border border-gold/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Near You</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city.localContent.landmarks.map((landmark, index) => (
                    <span
                      key={index}
                      className="bg-ink/50 border border-gold/10 text-gray-300 text-sm px-3 py-1 rounded-full"
                    >
                      {landmark}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
