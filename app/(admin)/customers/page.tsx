'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomerCard, type CustomerData } from '@/components/admin/CustomerCard'
import { formatCurrency } from '@/lib/utils'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { AdminPageTransition, FadeInSection, StaggerContainer } from '@/components/admin/page-transition'

const LIMIT = 20

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [offset, setOffset] = useState(0)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0) // Reset pagination on search
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const response = await fetch(`/api/customers?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data.customers || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError('Unable to load customers. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, offset])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  // Calculate aggregate stats
  const stats = {
    totalCustomers: total,
    totalLeads: customers.reduce((sum, c) => sum + c.leads_count, 0),
    totalValue: customers.reduce((sum, c) => sum + c.total_value, 0),
    wonDeals: customers.reduce((sum, c) => sum + c.won_leads, 0)
  }

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your customer relationships</p>
        </div>
      </FadeInSection>

      {/* Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4" staggerDelay={75}>
        <Card className="bg-white border-slate-200">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-slate-100 p-3">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="text-2xl font-bold text-slate-900">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-gold-light/20 p-3">
              <Users className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-100 p-3">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Deals Won</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.wonDeals}</p>
            </div>
          </CardContent>
        </Card>
      </StaggerContainer>

      {/* Search */}
      <FadeInSection delay={400} animation="slide-up">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900"
              />
            </div>
          </CardContent>
        </Card>
      </FadeInSection>

      {/* Customer list */}
      <FadeInSection delay={500} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900">
            {total} Customer{total !== 1 ? 's' : ''}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="mt-3 text-slate-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchCustomers}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-slate-600">No customers found</p>
              <p className="text-sm text-slate-400">
                {search ? 'Try adjusting your search.' : 'Customers will appear here when they create accounts.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-slate-500">
                    Showing {offset + 1}-{Math.min(offset + LIMIT, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                      disabled={offset === 0}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(offset + LIMIT)}
                      disabled={currentPage >= totalPages}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </FadeInSection>
    </AdminPageTransition>
  )
}
