'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/toast'
import { ProgramCard, EstimateSummary, Breadcrumbs } from '@/components/customer'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  HandHeart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  ALL_ASSISTANCE_PROGRAMS,
  getEligiblePrograms,
  PROGRAM_TYPE_LABELS,
  type AssistanceProgramData,
  type UserEligibilityData,
} from '@/lib/data/assistance-programs'

const INCOME_OPTIONS = [
  { value: '', label: 'Select income range...' },
  { value: '25000', label: 'Under $25,000' },
  { value: '35000', label: '$25,000 - $50,000' },
  { value: '60000', label: '$50,000 - $75,000' },
  { value: '87500', label: '$75,000 - $100,000' },
  { value: '125000', label: '$100,000 - $150,000' },
  { value: '175000', label: 'Over $150,000' },
]

const STATE_OPTIONS = [
  { value: '', label: 'Select state...' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'NY', label: 'New York' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
]

export default function AssistancePage() {
  const { showToast } = useToast()
  const {
    linkedLeads,
    selectedLeadId,
    programApplications,
    eligiblePrograms,
    setEligiblePrograms,
    addProgramApplication,
  } = useCustomerStore()

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')

  // Eligibility form state
  const [eligibilityData, setEligibilityData] = useState<UserEligibilityData>({
    isHomeowner: true,
    isPrimaryResidence: true,
    state: '',
    income: undefined,
    age: undefined,
    isDisabled: false,
    isVeteran: false,
    hasDisasterDeclaration: false,
  })

  // Get current lead data
  const currentLead = linkedLeads.find((l) => l.lead_id === selectedLeadId)
  const estimate = currentLead?.lead?.estimate
  const property = currentLead?.lead?.property

  // Pre-fill state from property
  useEffect(() => {
    if (property?.state && !eligibilityData.state) {
      setEligibilityData((prev) => ({ ...prev, state: property.state || '' }))
    }
  }, [property?.state])

  // Filter and search programs
  const filteredPrograms = useMemo(() => {
    let programs = ALL_ASSISTANCE_PROGRAMS

    // Filter by type
    if (selectedType) {
      programs = programs.filter((p) => p.programType === selectedType)
    }

    // Filter by state
    if (eligibilityData.state) {
      programs = programs.filter((p) => !p.state || p.state === eligibilityData.state)
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      programs = programs.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.programCode?.toLowerCase().includes(query)
      )
    }

    return programs
  }, [selectedType, eligibilityData.state, searchQuery])

  // Check eligibility for filtered programs
  const programsWithEligibility = useMemo(() => {
    return filteredPrograms.map((program) => {
      const { eligible, maybeEligible, notEligible } = getEligiblePrograms(eligibilityData)

      const isEligible = eligible.some((p) => p.id === program.id)
      const isMaybeEligible = maybeEligible.some((p) => p.id === program.id)
      const notEligibleInfo = notEligible.find((n) => n.program.id === program.id)

      return {
        program,
        eligibilityStatus: isEligible
          ? { eligible: true, reasons: [] }
          : isMaybeEligible
          ? undefined  // Unknown
          : notEligibleInfo
          ? { eligible: false, reasons: notEligibleInfo.reasons }
          : undefined,
        applicationStatus: programApplications.find(
          (a) => a.program_id === program.id && a.lead_id === selectedLeadId
        )?.status,
      }
    })
  }, [filteredPrograms, eligibilityData, programApplications, selectedLeadId])

  // Recommended programs: state-matched or eligible, sorted by benefit amount
  const recommendedPrograms = useMemo(() => {
    return programsWithEligibility
      .filter((p) => p.eligibilityStatus?.eligible || (eligibilityData.state && p.program.state === eligibilityData.state))
      .sort((a, b) => (b.program.maxBenefitAmount || 0) - (a.program.maxBenefitAmount || 0))
  }, [programsWithEligibility, eligibilityData.state])

  const handleStartApplication = async (program: AssistanceProgramData) => {
    if (!selectedLeadId) {
      showToast('Please select a property first', 'error')
      return
    }

    try {
      const response = await fetch('/api/customer/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          programId: program.id,
          status: 'researching',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to track')
      }

      const data = await response.json()
      addProgramApplication(data)
      showToast(`Now tracking ${program.name}`, 'success')

      // Open application URL if available
      if (program.applicationUrl) {
        window.open(program.applicationUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to track', 'error')
    }
  }

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ALL_ASSISTANCE_PROGRAMS.forEach((p) => {
      counts[p.programType] = (counts[p.programType] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/portal' },
          { label: 'Programs' },
        ]} />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Assistance Programs</h1>
          <p className="text-slate-400">Find programs that can help fund your roofing project</p>
        </div>
      </div>

      {/* Current estimate summary */}
      {estimate && (
        <EstimateSummary
          estimate={{
            priceLow: estimate.price_low,
            priceLikely: estimate.price_likely,
            priceHigh: estimate.price_high,
          }}
          property={{
            address: property?.street_address || undefined,
            city: property?.city || undefined,
            state: property?.state || undefined,
          }}
          compact
          showActions={false}
        />
      )}

      {/* Search + Type pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Horizontal type pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              !selectedType
                ? 'bg-gold-light/20 text-gold-light border border-gold-light/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            )}
          >
            All ({ALL_ASSISTANCE_PROGRAMS.length})
          </button>
          {Object.entries(PROGRAM_TYPE_LABELS).map(([value, info]) => (
            <button
              key={value}
              onClick={() => setSelectedType(selectedType === value ? '' : value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedType === value
                  ? 'bg-gold-light/20 text-gold-light border border-gold-light/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              )}
            >
              {info.icon} {info.label} ({typeCounts[value] || 0})
            </button>
          ))}
        </div>

        {/* Eligibility filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gold-light hover:text-gold-hover transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          {showFilters ? 'Hide eligibility filters' : 'Answer a few questions for personalized results'}
          {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Eligibility filters */}
      {showFilters && (
        <Card variant="dark" className="border-slate-700">
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Select
                value={eligibilityData.state || ''}
                onChange={(value) => setEligibilityData({ ...eligibilityData, state: value })}
                options={STATE_OPTIONS}
              />

              <Select
                value={eligibilityData.income?.toString() || ''}
                onChange={(value) => setEligibilityData({
                  ...eligibilityData,
                  income: value ? parseInt(value) : undefined,
                  areaMedianIncome: value ? 80000 : undefined,
                  povertyLevel: value ? 30000 : undefined,
                })}
                options={INCOME_OPTIONS}
              />

              <Input
                type="number"
                placeholder="Age (optional)"
                value={eligibilityData.age || ''}
                onChange={(e) => setEligibilityData({
                  ...eligibilityData,
                  age: e.target.value ? parseInt(e.target.value) : undefined,
                })}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Checkbox
                name="isHomeowner"
                label="I own my home"
                checked={eligibilityData.isHomeowner}
                onChange={(e) => setEligibilityData({
                  ...eligibilityData,
                  isHomeowner: e.target.checked,
                })}
              />
              <Checkbox
                name="isPrimaryResidence"
                label="Primary residence"
                checked={eligibilityData.isPrimaryResidence}
                onChange={(e) => setEligibilityData({
                  ...eligibilityData,
                  isPrimaryResidence: e.target.checked,
                })}
              />
              <Checkbox
                name="isVeteran"
                label="Veteran"
                checked={eligibilityData.isVeteran}
                onChange={(e) => setEligibilityData({
                  ...eligibilityData,
                  isVeteran: e.target.checked,
                })}
              />
              <Checkbox
                name="isDisabled"
                label="Disabled"
                checked={eligibilityData.isDisabled}
                onChange={(e) => setEligibilityData({
                  ...eligibilityData,
                  isDisabled: e.target.checked,
                })}
              />
              <Checkbox
                name="hasDisasterDeclaration"
                label="Disaster declared in my area"
                checked={eligibilityData.hasDisasterDeclaration}
                onChange={(e) => setEligibilityData({
                  ...eligibilityData,
                  hasDisasterDeclaration: e.target.checked,
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended for You section */}
      {recommendedPrograms.length > 0 && !searchQuery && !selectedType && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">Recommended for You</h2>
            {filteredPrograms.length > 3 && (
              <span className="text-sm text-gold-light">
                See all {filteredPrograms.length} programs below
              </span>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {recommendedPrograms.slice(0, 3).map(({ program, eligibilityStatus, applicationStatus }) => (
              <ProgramCard
                key={program.id}
                program={program}
                eligibilityStatus={eligibilityStatus}
                applicationStatus={applicationStatus}
                onApply={() => handleStartApplication(program)}
                onTrack={() => {
                  if (program.applicationUrl) {
                    window.open(program.applicationUrl, '_blank', 'noopener,noreferrer')
                  }
                }}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
          {eligibilityData.state && ` for ${eligibilityData.state}`}
        </p>
        {programsWithEligibility.filter((p) => p.eligibilityStatus?.eligible).length > 0 && (
          <span className="text-sm text-success font-medium">
            {programsWithEligibility.filter((p) => p.eligibilityStatus?.eligible).length} may be eligible
          </span>
        )}
      </div>

      {/* Programs list */}
      {filteredPrograms.length === 0 ? (
        <Card variant="dark" className="border-slate-700">
          <CardContent className="py-8 text-center">
            <HandHeart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No Programs Found</h3>
            <p className="text-slate-400 mb-3">
              {searchQuery
                ? `No matches for "${searchQuery}". Try "grant", "rebate", or "weatherization".`
                : selectedType || eligibilityData.state
                ? 'No matches with current filters.'
                : 'Try adjusting your filters or search query to find more programs.'}
            </p>
            {(searchQuery || selectedType) && (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => { setSearchQuery(''); setSelectedType('') }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programsWithEligibility.map(({ program, eligibilityStatus, applicationStatus }) => (
            <ProgramCard
              key={program.id}
              program={program}
              eligibilityStatus={eligibilityStatus}
              applicationStatus={applicationStatus}
              onApply={() => handleStartApplication(program)}
              onTrack={() => {
                if (program.applicationUrl) {
                  window.open(program.applicationUrl, '_blank', 'noopener,noreferrer')
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
