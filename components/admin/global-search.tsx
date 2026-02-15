'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Users, Hammer, Receipt, UserCheck } from 'lucide-react'

interface SearchResult {
  type: 'lead' | 'job' | 'invoice' | 'customer'
  id: string
  title: string
  subtitle: string
  url: string
}

const TYPE_CONFIG = {
  lead: { icon: Users, label: 'Lead', color: 'text-blue-600 bg-blue-100' },
  job: { icon: Hammer, label: 'Job', color: 'text-amber-600 bg-amber-100' },
  invoice: { icon: Receipt, label: 'Invoice', color: 'text-green-600 bg-green-100' },
  customer: { icon: UserCheck, label: 'Customer', color: 'text-purple-600 bg-purple-100' },
}

export function GlobalSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    router.push(result.url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  let flatIndex = 0

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        title="Search (Cmd+K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline text-xs border border-slate-600 rounded px-1.5 py-0.5">
          &#8984;K
        </span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Search panel */}
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search leads, jobs, invoices, customers..."
                className="flex-1 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]) }} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results */}
            {(results.length > 0 || isLoading) && (
              <div className="max-h-80 overflow-y-auto py-2">
                {isLoading && results.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
                )}
                {Object.entries(grouped).map(([type, items]) => {
                  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
                  return (
                    <div key={type}>
                      <p className="px-4 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {config.label}s
                      </p>
                      {items.map((result) => {
                        const Icon = config.icon
                        const idx = flatIndex++
                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 ${
                              idx === selectedIndex ? 'bg-slate-100' : ''
                            }`}
                          >
                            <div className={`p-1.5 rounded ${config.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate">{result.title}</p>
                              <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty state */}
            {query.length >= 2 && !isLoading && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-500">No results for &quot;{query}&quot;</p>
              </div>
            )}

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Type to search</span>
              <div className="flex items-center gap-2">
                <span className="border border-slate-200 rounded px-1 py-0.5">&#8593;&#8595;</span>
                <span>navigate</span>
                <span className="border border-slate-200 rounded px-1 py-0.5">&#9166;</span>
                <span>select</span>
                <span className="border border-slate-200 rounded px-1 py-0.5">esc</span>
                <span>close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
