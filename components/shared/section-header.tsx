import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}

/**
 * Canonical section header used across the marketing site.
 *
 * Locks in the editorial tone: gold uppercase eyebrow, display typeface
 * headline with tight tracking, optional lead paragraph underneath.
 * Keep section intros consistent by reaching for this rather than
 * hand-rolling per-page.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={cn('max-w-2xl mb-16', alignClass, className)}>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05] tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
          {description}
        </p>
      )}
    </div>
  )
}

/**
 * Consistent section container wrapper.
 * Provides standard spacing, dark base background, and a subtle
 * top divider so sections stack cleanly across pages.
 */
interface SectionProps {
  id?: string
  children: React.ReactNode
  className?: string
  /** Use when a section should NOT have the standard top border */
  noTopBorder?: boolean
  /** Compact variant with tighter vertical padding */
  compact?: boolean
  /** Aria label for the section */
  ariaLabel?: string
}

export function Section({
  id,
  children,
  className,
  noTopBorder = false,
  compact = false,
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        compact ? 'py-16 md:py-20' : 'py-24 md:py-32',
        'bg-[#0c0f14]',
        !noTopBorder && 'border-t border-slate-900',
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  )
}
