'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Copy, Check, Send } from 'lucide-react'

const LETTER_TYPES = [
  { value: 'initial_claim', label: 'Initial Claim' },
  { value: 'supplement', label: 'Supplement Request' },
  { value: 'appeal', label: 'Appeal' },
] as const

type LetterType = (typeof LETTER_TYPES)[number]['value']

interface ClaimLetterGeneratorProps {
  leadId?: string
}

export default function ClaimLetterGenerator({ leadId }: ClaimLetterGeneratorProps) {
  const [letterType, setLetterType] = useState<LetterType>('initial_claim')
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!leadId) {
      setError('No lead ID provided. Please start from your claim dashboard.')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedLetter('')

    try {
      const response = await fetch('/api/customer/insurance/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterType, leadId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || `Request failed with status ${response.status}`)
      }

      const data = await response.json()
      setGeneratedLetter(data.letter || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate letter. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    if (!generatedLetter) return

    try {
      await navigator.clipboard.writeText(generatedLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard.')
    }
  }

  return (
    <Card variant="dark" className="bg-[#1a1f2e] border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a25c]/20">
            <FileText className="h-5 w-5 text-[#c9a25c]" />
          </div>
          <CardTitle className="text-slate-100">Claim Letter Generator</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Letter Type Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Letter Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LETTER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setLetterType(type.value)}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-all border',
                    letterType === type.value
                      ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                      : 'bg-[#0c0f14] border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={isLoading}
            leftIcon={!isLoading ? <Send className="h-4 w-4" /> : undefined}
          >
            {isLoading ? 'Generating...' : 'Generate Letter'}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Generated Letter Display */}
          {generatedLetter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Generated Letter
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-[#c9a25c]"
                  leftIcon={
                    copied
                      ? <Check className="h-4 w-4 text-green-400" />
                      : <Copy className="h-4 w-4" />
                  }
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                rows={14}
                className={cn(
                  'w-full rounded-lg border bg-[#0c0f14] border-slate-700 p-4',
                  'text-sm text-slate-200 leading-relaxed',
                  'focus:outline-none focus:ring-2 focus:ring-[#c9a25c]/50 focus:border-[#c9a25c]',
                  'resize-y placeholder:text-slate-600'
                )}
              />
              <p className="text-xs text-slate-500">
                You can edit this letter before copying. Review all details for accuracy.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
