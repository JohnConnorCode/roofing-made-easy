import Image from 'next/image'

interface PageHeroProps {
  image: string
  alt: string
  eyebrow?: string
  eyebrowIcon?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
  align?: 'left' | 'center'
}

export function PageHero({
  image,
  alt,
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  children,
  className,
  align = 'left',
}: PageHeroProps) {
  const isCenter = align === 'center'
  return (
    <section className={`relative py-20 md:py-28 overflow-hidden ${className ?? ''}`}>
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/85 via-[#0c0f14]/75 to-[#0c0f14]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,15,20,0.35)_80%)]"
        aria-hidden="true"
      />
      <div
        className={`relative mx-auto max-w-6xl px-4 ${isCenter ? 'text-center' : ''}`}
      >
        <div className={isCenter ? 'max-w-3xl mx-auto' : 'max-w-3xl'}>
          {eyebrow && (
            <p
              className={`inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] animate-slide-up ${
                isCenter ? 'justify-center' : ''
              }`}
            >
              {eyebrowIcon}
              {eyebrow}
            </p>
          )}
          <h1 className="mt-5 text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display animate-slide-up delay-75">
            {title}
          </h1>
          {subtitle && (
            <div className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed animate-slide-up delay-150 max-w-2xl">
              {subtitle}
            </div>
          )}
          {children && <div className="mt-8 animate-slide-up delay-200">{children}</div>}
        </div>
      </div>
    </section>
  )
}
