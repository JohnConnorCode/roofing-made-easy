'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useBusinessConfig } from '@/lib/config/business-provider'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  linkToHome?: boolean
}

const sizeMap = {
  xs: 'h-8 w-8',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
}

const textSizeMap = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

export function Logo({
  size = 'md',
  showText = true,
  className = '',
  linkToHome = true,
}: LogoProps) {
  const config = useBusinessConfig()

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} rounded-xl overflow-hidden shadow-lg glow-gold`}>
        <Image
          src="/logo.svg"
          alt={config.name}
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div>
          <span className={`block ${textSizeMap[size]} font-bold text-slate-100 tracking-tight`}>
            {config.name}
          </span>
          <span className="block text-xs text-slate-400">{config.address.city}, {config.address.stateCode}</span>
        </div>
      )}
    </div>
  )

  if (linkToHome) {
    return <Link href="/">{content}</Link>
  }

  return content
}
