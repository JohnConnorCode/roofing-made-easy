// Shared Stat Card Component
// Reusable stat display used across location and comparison pages

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  description: string
  variant?: 'default' | 'compact'
}

export function StatCard({ icon: Icon, label, value, description, variant = 'default' }: StatCardProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-slate-deep border border-gold/10 rounded-xl p-6 text-center hover:border-gold/30 transition-colors">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
          <Icon className="w-6 h-6 text-gold" />
        </div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    )
  }

  return (
    <div className="bg-ink/50 border border-gold/10 rounded-xl p-6 text-center hover:border-gold/30 transition-colors">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
        <Icon className="w-6 h-6 text-gold" />
      </div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}
