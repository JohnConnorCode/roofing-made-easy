/**
 * Estimate Accuracy Report API
 * GET - Estimate vs actual cost variance, distribution, monthly trend
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logger } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(profile, 'reports', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    const { data: jobData } = await supabase
      .from('jobs')
      .select('id, job_number, contract_amount, material_cost, labor_cost, created_at, estimate:estimate_id(price_likely, total_material, total_labor)')
      .in('status', ['completed', 'warranty_active', 'closed'])
      .not('estimate_id', 'is', null)
      .limit(500)

    const jobs = (jobData || []) as Array<{
      id: string; job_number: string
      contract_amount: number; material_cost: number; labor_cost: number
      created_at: string
      estimate: { price_likely: number | null; total_material: number | null; total_labor: number | null } | null
    }>

    // Filter to jobs where we have both estimate and actual data
    const analyzable = jobs.filter(j =>
      j.estimate && j.estimate.price_likely && j.estimate.price_likely > 0 && j.contract_amount > 0
    )

    // Calculate variances
    const jobAnalysis = analyzable.map(j => {
      const est = j.estimate!
      const priceVariancePct = ((j.contract_amount - (est.price_likely || 0)) / (est.price_likely || 1)) * 100
      const materialVariancePct = (est.total_material != null && est.total_material > 0 && j.material_cost != null)
        ? ((j.material_cost - est.total_material) / est.total_material) * 100
        : null
      const laborVariancePct = (est.total_labor != null && est.total_labor > 0 && j.labor_cost != null)
        ? ((j.labor_cost - est.total_labor) / est.total_labor) * 100
        : null

      return {
        id: j.id,
        jobNumber: j.job_number,
        contractAmount: j.contract_amount,
        estimatedAmount: est.price_likely || 0,
        variancePct: Math.round(priceVariancePct * 10) / 10,
        materialEstimated: est.total_material || 0,
        materialActual: j.material_cost || 0,
        materialVariancePct: materialVariancePct != null ? Math.round(materialVariancePct * 10) / 10 : null,
        laborEstimated: est.total_labor || 0,
        laborActual: j.labor_cost || 0,
        laborVariancePct: laborVariancePct != null ? Math.round(laborVariancePct * 10) / 10 : null,
        createdAt: j.created_at,
      }
    })

    // Summary
    const variancePcts = jobAnalysis.map(j => j.variancePct)
    const materialVariances = jobAnalysis.map(j => j.materialVariancePct).filter((v): v is number => v != null)
    const laborVariances = jobAnalysis.map(j => j.laborVariancePct).filter((v): v is number => v != null)

    const avgPriceVariancePct = variancePcts.length > 0
      ? Math.round((variancePcts.reduce((a, b) => a + b, 0) / variancePcts.length) * 10) / 10
      : 0
    const avgMaterialVariancePct = materialVariances.length > 0
      ? Math.round((materialVariances.reduce((a, b) => a + b, 0) / materialVariances.length) * 10) / 10
      : 0
    const avgLaborVariancePct = laborVariances.length > 0
      ? Math.round((laborVariances.reduce((a, b) => a + b, 0) / laborVariances.length) * 10) / 10
      : 0

    const overEstimateCount = jobAnalysis.filter(j => j.variancePct < 0).length
    const underEstimateCount = jobAnalysis.filter(j => j.variancePct > 0).length

    // Variance distribution buckets
    const buckets = [
      { label: '0-5%', min: 0, max: 5, count: 0 },
      { label: '5-10%', min: 5, max: 10, count: 0 },
      { label: '10-20%', min: 10, max: 20, count: 0 },
      { label: '20%+', min: 20, max: Infinity, count: 0 },
    ]
    for (const j of jobAnalysis) {
      const absVar = Math.abs(j.variancePct)
      const bucket = buckets.find(b => absVar >= b.min && absVar < b.max)
      if (bucket) bucket.count++
    }

    // Monthly trend
    const monthlyMap = new Map<string, { variances: number[] }>()
    for (const j of jobAnalysis) {
      const month = j.createdAt.substring(0, 7)
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { variances: [] })
      }
      monthlyMap.get(month)!.variances.push(Math.abs(j.variancePct))
    }
    const trend = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        avgAbsVariance: data.variances.length > 0
          ? Math.round((data.variances.reduce((a, b) => a + b, 0) / data.variances.length) * 10) / 10
          : 0,
        jobCount: data.variances.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Top 50 by absolute variance
    const topJobs = [...jobAnalysis]
      .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))
      .slice(0, 50)

    return NextResponse.json({
      summary: {
        jobsAnalyzed: analyzable.length,
        avgPriceVariancePct,
        avgMaterialVariancePct,
        avgLaborVariancePct,
        overEstimateCount,
        underEstimateCount,
      },
      varianceDistribution: buckets.map(b => ({ label: b.label, count: b.count })),
      trend,
      jobs: topJobs,
    })
  } catch (error) {
    logger.error('Estimate accuracy report error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
