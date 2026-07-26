'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import ApplicationLogo from '@/components/ApplicationLogo'
import { FadeIn } from '@/components/motion'
import { Heart } from 'lucide-react'

type GuestLayoutProps = {
  children: ReactNode
  hero?: {
    badge?: string
    title?: string
    subtitle?: string
    features?: string[]
    footer?: string
  }
}

export default function GuestLayout({ children, hero }: GuestLayoutProps) {
  const heroContent = {
    badge: hero?.badge ?? 'MySpaceLove',
    title: hero?.title ?? 'MySpaceLove membantu Anda memelihara ruang berbagi yang indah.',
    subtitle: hero?.subtitle ?? 'Buat ritual, bagikan memori, dan saling mengejutkan dari mana saja.',
    features: hero?.features ?? [
      'Kumpulkan milestone, jurnal, dan galeri dalam satu ruang privat.',
      'Koordinasi kejutan dengan panduan dan prompts harian.',
      'Tetap dekat dengan countdown, playlist, dan banyak lagi.',
    ],
    footer: hero?.footer ?? null,
  }

  const hasFeatures = Array.isArray(heroContent.features) && heroContent.features.length > 0

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left — Hero */}
        <div className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-coral-500 text-white lg:flex">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-xl flex-col justify-center gap-8 px-12 py-16">
            <FadeIn delay={0.1}>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                {heroContent.badge}
              </span>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
                {heroContent.title}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg leading-relaxed text-white/80">
                {heroContent.subtitle}
              </p>
            </FadeIn>

            {hasFeatures && (
              <FadeIn delay={0.4}>
                <ul className="space-y-4 text-base text-white/80">
                  {heroContent.features!.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Heart className="mt-1 h-5 w-5 text-white/60 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}

            {heroContent.footer && (
              <FadeIn delay={0.5}>
                <p className="text-sm text-white/60">{heroContent.footer}</p>
              </FadeIn>
            )}
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <div className="relative w-full max-w-md">
            <FadeIn delay={0.1}>
              <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
                <Link href="/" className="inline-flex items-center justify-center">
                  <ApplicationLogo className="h-12 w-auto text-brand-500" />
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  {heroContent.badge}
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-3xl bg-white border border-warm-100 p-8 shadow-xl shadow-warm-900/5">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                  <Link href="/" className="hidden lg:inline-flex items-center justify-center">
                    <ApplicationLogo className="h-12 w-auto text-brand-500" />
                  </Link>
                </div>
                <div className="space-y-6">{children}</div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
