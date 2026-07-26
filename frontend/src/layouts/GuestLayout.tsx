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
    <div className="min-h-screen bg-[#faf8f6]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left — Hero */}
        <div className="relative hidden flex-1 overflow-hidden lg:flex">
          {/* Deep warm gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2d1b2e] via-[#3d2236] to-[#1a1218]" />

          {/* Subtle mesh overlay for depth */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(ellipse_at_20%_50%,rgba(180,83,109,0.3),transparent_60%)]" />
            <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,168,0.2),transparent_50%)]" />
            <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(ellipse_at_60%_80%,rgba(200,120,100,0.15),transparent_50%)]" />
          </div>

          {/* Grain texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />

          {/* Floating decorative orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -left-20 top-[15%] h-80 w-80 rounded-full bg-[rgba(200,120,140,0.08)] blur-[80px]" />
            <div className="absolute bottom-[10%] right-[-10%] h-96 w-96 rounded-full bg-[rgba(139,92,168,0.06)] blur-[100px]" />
            <div className="absolute top-[60%] left-[30%] h-64 w-64 rounded-full bg-[rgba(180,83,109,0.05)] blur-[60px]" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-xl flex-col justify-center gap-10 px-14 py-20">
            <FadeIn delay={0.1}>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400/80" />
                {heroContent.badge}
              </span>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-[1.1] text-white">
                {heroContent.title}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg leading-relaxed text-white/55 max-w-[42ch]">
                {heroContent.subtitle}
              </p>
            </FadeIn>

            {hasFeatures && (
              <FadeIn delay={0.4}>
                <ul className="space-y-4">
                  {heroContent.features!.map((feature) => (
                    <li key={feature} className="flex items-start gap-3.5 text-[15px] text-white/50">
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/50" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}

            {heroContent.footer && (
              <FadeIn delay={0.5}>
                <p className="text-sm text-white/35">{heroContent.footer}</p>
              </FadeIn>
            )}
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <div className="relative w-full max-w-md">
            {/* Mobile-only branding */}
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
              <div className="rounded-[2rem] bg-white border border-warm-100 p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
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
