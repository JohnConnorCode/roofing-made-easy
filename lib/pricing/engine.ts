import type { PricingRule, Intake, Property } from '@/lib/supabase/types'
import type { RoofIssue } from '@/stores/funnelStore'

export interface PricingInput {
  intake: Partial<Intake>
  property?: Partial<Property>
  detectedIssues?: string[]
}

export interface PricingAdjustment {
  name: string
  ruleKey: string
  impact: number
  description: string
  category: string
}

export interface PricingResult {
  priceLow: number
  priceLikely: number
  priceHigh: number
  baseCost: number
  materialCost: number
  laborCost: number
  adjustments: PricingAdjustment[]
  inputSnapshot: PricingInput
  rulesSnapshot: PricingRule[]
}

export class PricingEngine {
  private rules: PricingRule[]
  private rulesByKey: Map<string, PricingRule>
  private rulesByCategory: Map<string, PricingRule[]>

  constructor(rules: PricingRule[]) {
    this.rules = rules.filter((r) => r.is_active)
    this.rulesByKey = new Map(this.rules.map((r) => [r.rule_key, r]))
    this.rulesByCategory = new Map()

    for (const rule of this.rules) {
      const category = rule.rule_category
      if (!this.rulesByCategory.has(category)) {
        this.rulesByCategory.set(category, [])
      }
      this.rulesByCategory.get(category)!.push(rule)
    }
  }

  getRule(key: string): PricingRule | undefined {
    return this.rulesByKey.get(key)
  }

  getRulesByCategory(category: string): PricingRule[] {
    return this.rulesByCategory.get(category) || []
  }

  calculateEstimate(input: PricingInput): PricingResult {
    const adjustments: PricingAdjustment[] = []
    let baseCost = 0
    let totalMultiplier = 1

    const { intake } = input
    const roofSize = intake.roof_size_sqft || 2000 // Default estimate

    // Step 1: Get base rate based on job type
    const jobType = intake.job_type || 'repair'
    const baseRuleKey = `base_${jobType === 'full_replacement' ? 'replacement' : jobType}`
    const baseRule = this.getRule(baseRuleKey) || this.getRule('base_repair')

    if (baseRule) {
      if (baseRule.unit === 'sqft') {
        baseCost = (baseRule.base_rate || 0) * roofSize
      } else if (baseRule.unit === 'linear_ft') {
        // Estimate linear feet from square footage (perimeter estimate)
        const linearFt = Math.sqrt(roofSize) * 4
        baseCost = (baseRule.base_rate || 0) * linearFt
      } else {
        baseCost = baseRule.base_rate || baseRule.flat_fee || 0
      }

      adjustments.push({
        name: baseRule.display_name,
        ruleKey: baseRule.rule_key,
        impact: baseCost,
        description: `Base ${jobType.replace('_', ' ')} rate`,
        category: 'base',
      })
    }

    // Step 2: Apply material multiplier
    if (intake.roof_material) {
      const materialRule = this.getRule(`material_${intake.roof_material}`)
      if (materialRule && materialRule.multiplier !== 1) {
        totalMultiplier *= materialRule.multiplier
        adjustments.push({
          name: materialRule.display_name,
          ruleKey: materialRule.rule_key,
          impact: 0, // Calculated after all multipliers
          description: `${(materialRule.multiplier * 100 - 100).toFixed(0)}% for ${materialRule.display_name.toLowerCase()}`,
          category: 'material',
        })
      }
    }

    // Step 3: Apply pitch multiplier
    if (intake.roof_pitch) {
      const pitchRule = this.getRule(`pitch_${intake.roof_pitch}`)
      if (pitchRule && pitchRule.multiplier !== 1) {
        totalMultiplier *= pitchRule.multiplier
        adjustments.push({
          name: pitchRule.display_name,
          ruleKey: pitchRule.rule_key,
          impact: 0,
          description: `${(pitchRule.multiplier * 100 - 100).toFixed(0)}% for ${pitchRule.display_name.toLowerCase()}`,
          category: 'pitch',
        })
      }
    }

    // Step 4: Apply story multiplier
    if (intake.stories && intake.stories > 1) {
      const storyRule = this.getRule(`story_${Math.min(intake.stories, 3)}`)
      if (storyRule && storyRule.multiplier !== 1) {
        totalMultiplier *= storyRule.multiplier
        adjustments.push({
          name: storyRule.display_name,
          ruleKey: storyRule.rule_key,
          impact: 0,
          description: `${(storyRule.multiplier * 100 - 100).toFixed(0)}% for ${intake.stories} stories`,
          category: 'stories',
        })
      }
    }

    // Step 5: Apply urgency multiplier
    if (intake.timeline_urgency) {
      const urgencyRule = this.getRule(`urgency_${intake.timeline_urgency}`)
      if (urgencyRule && urgencyRule.multiplier !== 1) {
        totalMultiplier *= urgencyRule.multiplier
        adjustments.push({
          name: urgencyRule.display_name,
          ruleKey: urgencyRule.rule_key,
          impact: 0,
          description:
            urgencyRule.multiplier > 1
              ? `${(urgencyRule.multiplier * 100 - 100).toFixed(0)}% urgency premium`
              : `${(100 - urgencyRule.multiplier * 100).toFixed(0)}% flexible scheduling discount`,
          category: 'urgency',
        })
      }
    }

    // Step 6: Add feature flat fees
    const features: [string, boolean | undefined, string][] = [
      ['feature_skylights', intake.has_skylights, 'Skylight work'],
      ['feature_chimneys', intake.has_chimneys, 'Chimney flashing'],
      ['feature_solar', intake.has_solar_panels, 'Solar panel handling'],
    ]

    for (const [ruleKey, hasFeature, description] of features) {
      if (hasFeature) {
        const featureRule = this.getRule(ruleKey)
        if (featureRule && featureRule.flat_fee) {
          adjustments.push({
            name: featureRule.display_name,
            ruleKey: featureRule.rule_key,
            impact: featureRule.flat_fee,
            description,
            category: 'feature',
          })
        }
      }
    }

    // Step 7: Add issue-based fees
    const issues = (intake.issues as RoofIssue[]) || []
    for (const issue of issues) {
      const issueRule = this.getRule(`issue_${issue}`)
      if (issueRule && issueRule.flat_fee) {
        adjustments.push({
          name: issueRule.display_name,
          ruleKey: issueRule.rule_key,
          impact: issueRule.flat_fee,
          description: `Repair for ${issueRule.display_name.toLowerCase()}`,
          category: 'issue',
        })
      }
    }

    // Calculate costs
    const multipliedBase = baseCost * totalMultiplier

    // Update multiplier adjustments with actual impact
    for (const adj of adjustments) {
      if (adj.impact === 0 && ['material', 'pitch', 'stories', 'urgency'].includes(adj.category)) {
        const rule = this.getRule(adj.ruleKey)
        if (rule) {
          adj.impact = baseCost * (rule.multiplier - 1)
        }
      }
    }

    // Sum all flat fees
    const flatFees = adjustments
      .filter((a) => ['feature', 'issue'].includes(a.category))
      .reduce((sum, a) => sum + a.impact, 0)

    const priceLikely = multipliedBase + flatFees

    // Apply minimum charge
    const minRule = this.getRule(
      jobType === 'full_replacement' ? 'min_replacement' : 'min_repair'
    )
    const minCharge = minRule?.min_charge || 350
    const finalLikely = Math.max(priceLikely, minCharge)

    // Get range multipliers
    const lowMultiplier = this.getRule('range_low')?.multiplier || 0.85
    const highMultiplier = this.getRule('range_high')?.multiplier || 1.25

    const priceLow = Math.round(finalLikely * lowMultiplier)
    const priceHigh = Math.round(finalLikely * highMultiplier)

    // Rough cost breakdown (60% labor, 40% material for roofing)
    const materialCost = Math.round(finalLikely * 0.4)
    const laborCost = Math.round(finalLikely * 0.6)

    return {
      priceLow,
      priceLikely: Math.round(finalLikely),
      priceHigh,
      baseCost: Math.round(baseCost),
      materialCost,
      laborCost,
      adjustments: adjustments.filter((a) => a.impact !== 0),
      inputSnapshot: input,
      rulesSnapshot: this.rules,
    }
  }
}

// Default pricing rules for fallback when DB is unavailable
export const DEFAULT_PRICING_RULES: Partial<PricingRule>[] = [
  { rule_key: 'base_replacement', rule_category: 'job_type', base_rate: 4.5, unit: 'sqft', multiplier: 1, flat_fee: 0, is_active: true, display_name: 'Full Replacement Base' },
  { rule_key: 'base_repair', rule_category: 'job_type', base_rate: 150, unit: 'flat', multiplier: 1, flat_fee: 0, is_active: true, display_name: 'Repair Base' },
  { rule_key: 'base_inspection', rule_category: 'job_type', base_rate: 250, unit: 'flat', multiplier: 1, flat_fee: 0, is_active: true, display_name: 'Inspection Base' },
  { rule_key: 'material_asphalt_shingle', rule_category: 'material', multiplier: 1.0, flat_fee: 0, is_active: true, display_name: 'Asphalt Shingle' },
  { rule_key: 'material_metal', rule_category: 'material', multiplier: 2.2, flat_fee: 0, is_active: true, display_name: 'Metal Roofing' },
  { rule_key: 'material_tile', rule_category: 'material', multiplier: 2.5, flat_fee: 0, is_active: true, display_name: 'Tile Roofing' },
  { rule_key: 'pitch_flat', rule_category: 'pitch', multiplier: 0.9, flat_fee: 0, is_active: true, display_name: 'Flat Pitch' },
  { rule_key: 'pitch_steep', rule_category: 'pitch', multiplier: 1.25, flat_fee: 0, is_active: true, display_name: 'Steep Pitch' },
  { rule_key: 'story_2', rule_category: 'stories', multiplier: 1.15, flat_fee: 0, is_active: true, display_name: '2 Stories' },
  { rule_key: 'story_3', rule_category: 'stories', multiplier: 1.35, flat_fee: 0, is_active: true, display_name: '3+ Stories' },
  { rule_key: 'urgency_emergency', rule_category: 'urgency', multiplier: 1.5, flat_fee: 0, is_active: true, display_name: 'Emergency' },
  { rule_key: 'urgency_asap', rule_category: 'urgency', multiplier: 1.2, flat_fee: 0, is_active: true, display_name: 'ASAP' },
  { rule_key: 'feature_skylights', rule_category: 'feature', multiplier: 1, flat_fee: 350, is_active: true, display_name: 'Skylights' },
  { rule_key: 'feature_chimneys', rule_category: 'feature', multiplier: 1, flat_fee: 450, is_active: true, display_name: 'Chimneys' },
  { rule_key: 'feature_solar', rule_category: 'feature', multiplier: 1, flat_fee: 1500, is_active: true, display_name: 'Solar Panels' },
  { rule_key: 'issue_leaks', rule_category: 'issue', multiplier: 1, flat_fee: 500, is_active: true, display_name: 'Active Leaks' },
  { rule_key: 'issue_missing_shingles', rule_category: 'issue', multiplier: 1, flat_fee: 150, is_active: true, display_name: 'Missing Shingles' },
  { rule_key: 'issue_storm_damage', rule_category: 'issue', multiplier: 1, flat_fee: 750, is_active: true, display_name: 'Storm Damage' },
  { rule_key: 'range_low', rule_category: 'range', multiplier: 0.85, flat_fee: 0, is_active: true, display_name: 'Low Estimate' },
  { rule_key: 'range_high', rule_category: 'range', multiplier: 1.25, flat_fee: 0, is_active: true, display_name: 'High Estimate' },
  { rule_key: 'min_replacement', rule_category: 'minimum', multiplier: 1, flat_fee: 0, min_charge: 3500, is_active: true, display_name: 'Minimum Replacement' },
  { rule_key: 'min_repair', rule_category: 'minimum', multiplier: 1, flat_fee: 0, min_charge: 350, is_active: true, display_name: 'Minimum Repair' },
]
