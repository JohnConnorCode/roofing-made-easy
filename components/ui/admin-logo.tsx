'use client'

import Image from 'next/image'
import { useBusinessConfig } from '@/lib/config/business-provider'

interface AdminLogoProps {
  size?: 'sm' | 'md'
  showPortalLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
}

export function AdminLogo({
  size = 'md',
  showPortalLabel = false,
  className = '',
}: AdminLogoProps) {
  const config = useBusinessConfig()
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeMap[size]} rounded-xl overflow-hidden`}>
        <Image
          src="/logo.svg"
          alt={config.name}
          fill
          className="object-contain"
          priority
        />
      </div>
      <div>
        <span className="block text-sm font-semibold whitespace-nowrap text-white">
          {config.name}
        </span>
        {showPortalLabel && (
          <span className="block text-xs text-slate-400">Admin</span>
        )}
      </div>
    </div>
  )
}
