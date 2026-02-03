// How to Choose a Roofer Section
// Educational content for SEO depth (300-400 words)

import { MSCity } from '@/lib/data/ms-locations'
import {
  FileCheck,
  Shield,
  MessageSquare,
  DollarSign,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface HowToChooseSectionProps {
  city: MSCity
}

export function HowToChooseSection({ city }: HowToChooseSectionProps) {
  const checklist = [
    {
      icon: FileCheck,
      title: 'Verify Licensing & Insurance',
      description: `Confirm the contractor is properly licensed to work in ${city.county} County and carries both liability insurance and workers' compensation coverage. Ask for certificates and verify they're current.`
    },
    {
      icon: MessageSquare,
      title: 'Get Multiple Written Estimates',
      description: `Request detailed written estimates from at least 3 contractors. Compare not just total price, but also materials specified, warranty terms, and project timeline.`
    },
    {
      icon: Award,
      title: 'Check Reviews & References',
      description: `Look for reviews on Google, Facebook, and the BBB. Ask for references from recent jobs in ${city.name} and actually call them to ask about their experience.`
    },
    {
      icon: Shield,
      title: 'Understand Warranty Coverage',
      description: `Quality roofers offer both manufacturer warranties on materials and their own workmanship warranty. Make sure you understand what's covered and for how long.`
    },
    {
      icon: DollarSign,
      title: 'Avoid Large Upfront Payments',
      description: `Reputable contractors typically require a reasonable deposit (10-30%) with the balance due upon completion. Be wary of anyone asking for full payment upfront.`
    },
    {
      icon: Clock,
      title: 'Get Everything in Writing',
      description: `Your contract should specify materials, start date, completion timeline, payment schedule, cleanup responsibilities, and warranty terms before any work begins.`
    }
  ]

  const localConsiderations = [
    `${city.name}'s humid subtropical climate means your roof needs materials that resist algae and mold growth.`,
    `Spring storms in ${city.county} County can bring high winds and hail—consider impact-resistant shingles.`,
    `Ensure your contractor pulls proper permits from ${city.county} County building department.`,
    `Ask about experience with local building codes specific to Northeast Mississippi.`
  ]

  return (
    <section className="py-12 md:py-16 bg-slate-deep">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              How to Choose the Right Roofer in {city.name}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Selecting a roofing contractor is a significant decision. Here's what to look for
              when choosing a roofer in {city.name}, Mississippi.
            </p>
          </div>

          {/* Main Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {checklist.map((item) => (
              <div
                key={item.title}
                className="bg-ink/50 border border-gold/10 rounded-xl p-6 hover:border-gold/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Local Considerations */}
          <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-6 h-6 text-gold shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Local Weather & Permit Considerations
                </h3>
                <p className="text-gray-300">
                  When hiring a roofer in {city.name}, keep these local factors in mind:
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {localConsiderations.map((consideration, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{consideration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Educational Content */}
          <div className="mt-12 prose prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-white mb-4">
              Understanding Roofing Estimates in {city.name}
            </h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              When comparing roofing estimates from contractors in {city.name}, you'll
              typically see costs broken down into materials, labor, and additional items
              like permits and debris removal. The average roof replacement in {city.name}
              ranges from {city.stats.avgReplacementCost}, depending on roof size, pitch,
              and material selection.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Don't automatically choose the lowest bid. Instead, compare what's included:
              the quality of shingles or materials, underlayment specifications, flashing
              work, and warranty terms. A slightly higher quote that includes premium
              materials and a strong workmanship warranty often represents better long-term
              value for {city.name} homeowners.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Given {city.localContent.weatherChallenges[0]?.toLowerCase() || 'local weather conditions'},
              investing in quality materials and professional installation protects your
              home and can save significant money on repairs over your roof's lifetime.
              Most roofs in the {city.name} area last {city.stats.avgRoofAge} with proper
              installation and maintenance.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
