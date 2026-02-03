// Contractor Types Educational Section
// Educational content about types of contractors, NOT fake company listings

import { ContractorType, getContractorTypesForCity } from '@/lib/data/ms-competitors'
import { MSCity } from '@/lib/data/ms-locations'
import { CheckCircle, AlertCircle, Building2 } from 'lucide-react'

interface ContractorTypesListingProps {
  city: MSCity
}

// Main export - now educational content about contractor types
export function CompetitorListing({ city }: ContractorTypesListingProps) {
  const contractorTypes = getContractorTypesForCity(city.slug)

  return (
    <section className="py-12 bg-ink/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Types of Roofing Contractors in {city.name}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Understanding the different types of roofing contractors can help you find
              the right fit for your project. Here are the main categories you will encounter
              when searching for roofers in {city.county} County.
            </p>
          </div>

          {/* Contractor Type Cards */}
          <div className="space-y-6">
            {contractorTypes.map((type) => (
              <ContractorTypeCard key={type.id} contractorType={type} city={city} />
            ))}
          </div>

          {/* Advice Box */}
          <div className="mt-10 p-6 bg-gold/5 border border-gold/20 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">
              Our Recommendation
            </h3>
            <p className="text-slate-300 leading-relaxed">
              When choosing a roofing contractor in {city.name}, we recommend getting at least
              three written estimates, verifying licensing and insurance with the Mississippi
              State Board of Contractors, and checking online reviews from verified customers.
              Ask for local references and a detailed contract before signing.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ContractorTypeCardProps {
  contractorType: ContractorType
  city: MSCity
}

function ContractorTypeCard({ contractorType, city }: ContractorTypeCardProps) {
  return (
    <div className="bg-slate-deep border border-gold/10 rounded-xl p-6 hover:border-gold/20 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-ink/50 border border-gold/10 rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            {contractorType.type}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-relaxed mb-6">
        {contractorType.description}
      </p>

      {/* Two columns: Best For and Considerations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Best For */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Best For
          </h4>
          <ul className="space-y-2">
            {contractorType.bestFor.map((item, index) => (
              <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Considerations */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Things to Consider
          </h4>
          <ul className="space-y-2">
            {contractorType.considerations.map((item, index) => (
              <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Legacy interface for backward compatibility
interface CompetitorCompany {
  id: string
  name: string
  description: string
  services: string[]
  yearsInBusiness?: number
  serviceArea: string
}

// Legacy props interface - competitors param is now ignored
interface LegacyCompetitorListingProps {
  city: MSCity
  competitors?: CompetitorCompany[]
}

// Named export for flexibility
export { ContractorTypeCard }
