import Image from 'next/image'
import { BUSINESS_CONFIG } from '@/lib/config/business'

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
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} rounded-xl overflow-hidden`}>
        <Image
          src="/logo.svg"
          alt={BUSINESS_CONFIG.name}
          fill
          className="object-contain"
          priority
        />
      </div>
      <div>
        <h1 className="text-lg font-bold text-white">{BUSINESS_CONFIG.name.split(' ')[0]} Admin</h1>
        {showPortalLabel && (
          <p className="text-sm text-slate-400">Admin Portal</p>
        )}
      </div>
    </div>
  )
}
