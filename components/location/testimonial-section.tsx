// Location-specific Testimonial Section
import { MSCity } from '@/lib/data/ms-locations'
import { Star, Quote, MapPin } from 'lucide-react'

interface TestimonialSectionProps {
  city: MSCity
}

export function TestimonialSection({ city }: TestimonialSectionProps) {
  if (!city.testimonial) return null

  const { testimonial } = city

  return (
    <section className="py-12 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            What {city.name} Homeowners Say
          </h2>

          <div className="bg-slate-deep/70 border border-gold/20 rounded-2xl p-8 relative">
            {/* Quote Icon */}
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                <Quote className="w-4 h-4 text-ink" />
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-lg text-gray-300 leading-relaxed mb-6">
              &ldquo;{testimonial.text}&rdquo;
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white font-semibold">{testimonial.name}</p>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  {testimonial.neighborhood && (
                    <>
                      <MapPin className="w-4 h-4 text-gold" />
                      <span>{testimonial.neighborhood}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{testimonial.projectType}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-400">Verified Customer</p>
                <p className="text-sm text-gold">{city.name}, MS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
