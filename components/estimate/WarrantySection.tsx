'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WARRANTIES } from '@/lib/data/estimate-content'
import { Shield, Award, Star } from 'lucide-react'

const WARRANTY_ICONS = {
  workmanship: Shield,
  manufacturer: Award,
  extended: Star,
}

export function WarrantySection() {
  return (
    <Card className="border-slate-700/50 bg-[#161a23]">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
            5
          </span>
          Warranty Protection
        </CardTitle>
        <p className="text-slate-400 text-sm mt-1">
          Your investment is protected by comprehensive warranties
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {WARRANTIES.map((warranty) => {
            const Icon = WARRANTY_ICONS[warranty.type]
            return (
              <div
                key={warranty.type}
                className="p-5 rounded-xl bg-gradient-to-b from-[#1a1f2e] to-[#161a23] border border-slate-700/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-[#3d7a5a]/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#3d7a5a]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#3d7a5a]">{warranty.duration}</p>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-100 mb-2">{warranty.name}</h4>
                <p className="text-sm text-slate-400 mb-4">{warranty.description}</p>

                <ul className="space-y-2">
                  {warranty.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg
                        className="h-4 w-4 text-[#3d7a5a] shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Peace of mind message */}
        <div className="mt-6 p-4 rounded-lg bg-[#3d7a5a]/10 border border-[#3d7a5a]/30">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#3d7a5a] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-100">Peace of Mind Guarantee</p>
              <p className="text-sm text-slate-400">
                If you&apos;re not completely satisfied with our workmanship, we&apos;ll make it
                right. Our reputation is built on standing behind every project we complete.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
