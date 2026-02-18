'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  RoofSketchInput,
  VariablesDisplay,
  MacroSelector,
  LineItemTable,
  EstimateSummaryCard,
} from '@/components/estimation'
import { getEmptyVariables } from '@/lib/estimation/variables'
import type {
  RoofVariables,
  EstimateMacro,
  DetailedEstimate,
  EstimateLineItem,
} from '@/lib/supabase/types'
import { ArrowLeft, Calculator, Save, FileText, RefreshCw } from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

type EstimateStep = 'measurements' | 'template' | 'line-items' | 'summary'

export default function DetailedEstimateBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.leadId as string
  const { showToast } = useToast()

  const [currentStep, setCurrentStep] = useState<EstimateStep>('measurements')
  const [variables, setVariables] = useState<RoofVariables>(getEmptyVariables())
  const [selectedMacro, setSelectedMacro] = useState<EstimateMacro | null>(null)
  const [estimate, setEstimate] = useState<DetailedEstimate | null>(null)
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch existing sketch if available
  useEffect(() => {
    async function fetchSketch() {
      try {
        const response = await fetch(`/api/leads/${leadId}/sketch`)
        if (response.ok) {
          const data = await response.json()
          if (data.sketch) {
            // Convert sketch to variables
            const sketchVars: RoofVariables = {
              SQ: data.sketch.total_squares,
              SF: data.sketch.total_sqft,
              P: data.sketch.total_perimeter_lf,
              EAVE: data.sketch.total_eave_lf,
              R: data.sketch.total_ridge_lf,
              VAL: data.sketch.total_valley_lf,
              HIP: data.sketch.total_hip_lf,
              RAKE: data.sketch.total_rake_lf,
              SKYLIGHT_COUNT: data.sketch.skylight_count,
              CHIMNEY_COUNT: data.sketch.chimney_count,
              PIPE_COUNT: data.sketch.pipe_boot_count,
              VENT_COUNT: data.sketch.vent_count,
              GUTTER_LF: data.sketch.gutter_lf,
              DS_COUNT: data.sketch.downspout_count,
              slopes: {},
            }
            setVariables(sketchVars)
          }
        }
      } catch {
        // Sketch may not exist yet
      }
    }

    fetchSketch()
  }, [leadId])

  const handleVariablesChange = useCallback((newVars: RoofVariables) => {
    setVariables(newVars)
  }, [])

  const handleMacroSelect = useCallback((macro: EstimateMacro) => {
    setSelectedMacro(macro)
  }, [])

  const handleApplyMacro = async () => {
    if (!selectedMacro?.id) {
      // Blank estimate
      setCurrentStep('line-items')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/macros/${selectedMacro.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          variables,
          overhead_percent: 10,
          profit_percent: 15,
          tax_percent: 0,
          name: selectedMacro.name,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply template')
      }

      const data = await response.json()
      setEstimate(data.estimate)
      setLineItems(data.estimate.line_items || [])
      setCurrentStep('line-items')
      showToast('Template applied successfully', 'success')
    } catch {
      showToast('Failed to apply template', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleInclude = async (id: string, included: boolean) => {
    if (!estimate) return

    try {
      const response = await fetch(
        `/api/leads/${leadId}/detailed-estimate/${estimate.id}/line-items`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, is_included: included }),
        }
      )

      if (!response.ok) throw new Error('Failed to update')

      setLineItems((prev) =>
        prev.map((li) => (li.id === id ? { ...li, is_included: included } : li))
      )

      // Refresh estimate totals
      await recalculateEstimate()
    } catch (error) {
      showToast('Failed to update line item', 'error')
    }
  }

  const handleQuantityChange = async (id: string, quantity: number) => {
    if (!estimate) return

    try {
      const response = await fetch(
        `/api/leads/${leadId}/detailed-estimate/${estimate.id}/line-items`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, quantity }),
        }
      )

      if (!response.ok) throw new Error('Failed to update')

      const data = await response.json()
      setLineItems((prev) =>
        prev.map((li) => (li.id === id ? data.lineItem : li))
      )

      await recalculateEstimate()
    } catch (error) {
      showToast('Failed to update quantity', 'error')
    }
  }

  const handleRemoveItem = async (id: string) => {
    if (!estimate) return

    try {
      const response = await fetch(
        `/api/leads/${leadId}/detailed-estimate/${estimate.id}/line-items?id=${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to remove')

      setLineItems((prev) => prev.filter((li) => li.id !== id))
      await recalculateEstimate()
      showToast('Line item removed', 'success')
    } catch (error) {
      showToast('Failed to remove line item', 'error')
    }
  }

  const recalculateEstimate = async () => {
    if (!estimate) return

    try {
      const response = await fetch(
        `/api/leads/${leadId}/detailed-estimate/${estimate.id}/calculate`,
        { method: 'POST' }
      )

      if (response.ok) {
        const data = await response.json()
        setEstimate(data.estimate)
        setLineItems(data.estimate.line_items || [])
      }
    } catch {
      // Recalculation failures are handled by stale data display
    }
  }

  const handleSaveEstimate = async () => {
    if (!estimate) return

    setIsSaving(true)
    try {
      // Update status to sent or keep as draft
      const response = await fetch(
        `/api/leads/${leadId}/detailed-estimate/${estimate.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'draft' }),
        }
      )

      if (!response.ok) throw new Error('Failed to save')

      showToast('Estimate saved successfully', 'success')
      setCurrentStep('summary')
    } catch (error) {
      showToast('Failed to save estimate', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const steps = [
    { id: 'measurements', label: 'Measurements', number: 1 },
    { id: 'template', label: 'Template', number: 2 },
    { id: 'line-items', label: 'Line Items', number: 3 },
    { id: 'summary', label: 'Summary', number: 4 },
  ]

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Lead
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Detailed Estimate Builder
            </h1>
            <p className="text-slate-500">
              Create a professional line-item estimate
            </p>
          </div>
        </div>
      </div>
      </FadeInSection>

      {/* Progress Steps */}
      <FadeInSection delay={100} animation="slide-up">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (step.id === 'measurements') setCurrentStep('measurements')
                else if (step.id === 'template' && variables.SQ > 0)
                  setCurrentStep('template')
                else if (step.id === 'line-items' && estimate)
                  setCurrentStep('line-items')
                else if (step.id === 'summary' && estimate)
                  setCurrentStep('summary')
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currentStep === step.id
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  currentStep === step.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {step.number}
              </span>
              {step.label}
            </button>
            {index < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-slate-300" />
            )}
          </div>
        ))}
      </div>
      </FadeInSection>

      {/* Step Content */}
      <FadeInSection delay={200} animation="slide-up">
      <div className="max-w-6xl mx-auto">
        {/* Step 1: Measurements */}
        {currentStep === 'measurements' && (
          <div className="space-y-6">
            <RoofSketchInput
              initialVariables={variables}
              onVariablesChange={handleVariablesChange}
              mode="detailed"
            />

            {variables.SQ > 0 && (
              <>
                <VariablesDisplay variables={variables} compact />

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setCurrentStep('template')}
                    rightIcon={<ArrowLeft className="h-4 w-4 rotate-180" />}
                  >
                    Continue to Template
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Template Selection */}
        {currentStep === 'template' && (
          <div className="space-y-6">
            <VariablesDisplay variables={variables} compact />

            <MacroSelector
              onSelect={handleMacroSelect}
              selectedMacroId={selectedMacro?.id}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('measurements')}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyMacro}
                disabled={isLoading}
                leftIcon={
                  isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4" />
                  )
                }
              >
                {selectedMacro?.id ? 'Apply Template' : 'Start Blank'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Line Items */}
        {currentStep === 'line-items' && estimate && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <LineItemTable
                lineItems={lineItems}
                editable
                showCosts
                groupBy="category"
                onToggleInclude={handleToggleInclude}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            </div>

            <div className="space-y-6">
              <VariablesDisplay variables={variables} compact />

              <EstimateSummaryCard
                totalMaterial={estimate.total_material}
                totalLabor={estimate.total_labor}
                totalEquipment={estimate.total_equipment}
                subtotal={estimate.subtotal}
                overheadPercent={estimate.overhead_percent}
                overheadAmount={estimate.overhead_amount}
                profitPercent={estimate.profit_percent}
                profitAmount={estimate.profit_amount}
                taxPercent={estimate.tax_percent}
                taxAmount={estimate.tax_amount}
                priceLow={estimate.price_low}
                priceLikely={estimate.price_likely}
                priceHigh={estimate.price_high}
                variant="compact"
              />

              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSaveEstimate}
                  disabled={isSaving}
                  leftIcon={
                    isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )
                  }
                >
                  Save Estimate
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentStep('template')}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back to Templates
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {currentStep === 'summary' && estimate && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estimate Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Your detailed estimate has been saved and is ready for review.
                </p>

                <EstimateSummaryCard
                  totalMaterial={estimate.total_material}
                  totalLabor={estimate.total_labor}
                  totalEquipment={estimate.total_equipment}
                  subtotal={estimate.subtotal}
                  overheadPercent={estimate.overhead_percent}
                  overheadAmount={estimate.overhead_amount}
                  profitPercent={estimate.profit_percent}
                  profitAmount={estimate.profit_amount}
                  taxPercent={estimate.tax_percent}
                  taxAmount={estimate.tax_amount}
                  priceLow={estimate.price_low}
                  priceLikely={estimate.price_likely}
                  priceHigh={estimate.price_high}
                  variant="full"
                />
              </CardContent>
            </Card>

            <LineItemTable
              lineItems={lineItems.filter((li) => li.is_included)}
              editable={false}
              showCosts
              groupBy="category"
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('line-items')}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Edit Line Items
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Return to Lead
                </Button>
                <Button variant="primary">Generate PDF Quote</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </FadeInSection>
    </AdminPageTransition>
  )
}
