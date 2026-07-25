'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ApplicationLogo from '@/components/ApplicationLogo'
import { Heart, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-pink-200/60 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-purple-200/60 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm backdrop-blur mb-8">
              <Sparkles className="h-4 w-4" />
              Your Private Couple Space
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-rose-900 mb-6">
              Nurture Your Love,
              <br />
              <span className="text-pink-500">Together.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-rose-900/80 max-w-2xl mx-auto mb-12">
              MySpaceLove helps you build a beautiful shared space where memories live,
              surprises unfold, and your connection grows stronger every day.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-pink-600 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-8 py-4 text-lg font-semibold text-rose-700 shadow-sm border border-rose-200 transition hover:bg-white hover:-translate-y-0.5 hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📸',
                title: 'Share Memories',
                description: 'Create timelines, galleries, and journals to capture your special moments together.',
              },
              {
                icon: '💝',
                title: 'Surprise Each Other',
                description: 'Plan surprises with countdowns, secret notes, and thoughtful gifts.',
              },
              {
                icon: '🎵',
                title: 'Stay Connected',
                description: 'Share music, play games, and video call from anywhere in the world.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl bg-white/60 backdrop-blur p-8 shadow-sm border border-white/70 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-rose-900 mb-2">{feature.title}</h3>
                <p className="text-rose-900/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-white/80 backdrop-blur py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span className="font-medium text-pink-500">MySpaceLove</span>
          <span>© {new Date().getFullYear()}</span>
          <Heart className="h-4 w-4 text-pink-500 fill-current" />
        </div>
      </footer>
    </div>
  )
}
