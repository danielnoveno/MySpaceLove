'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import { Clock, Image, MessageCircle, Music, Gamepad2, Heart, FileText, MapPin, Star, Calendar, Sparkles, Users } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

type Space = {
  id: number
  slug: string
  title: string
  bio: string | null
  user_one_id: string
  user_two_id: string | null
  created_at: string
}

export default function SpaceDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  const [space, setSpace] = useState<Space | null>(null)
  const [stats, setStats] = useState({ events: 0, photos: 0, messages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && slug) {
      fetchSpace()
    }
  }, [user, authLoading, slug, router])

  const fetchSpace = async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      router.push('/spaces')
      return
    }

    if (data.user_one_id !== user?.id && data.user_two_id !== user?.id) {
      router.push('/spaces')
      return
    }

    setSpace(data)

    // Fetch stats
    const [eventsRes, photosRes, messagesRes] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('space_id', data.id),
      supabase.from('photos').select('id', { count: 'exact', head: true }).eq('space_id', data.id),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('space_id', data.id),
    ])

    setStats({
      events: eventsRes.count ?? 0,
      photos: photosRes.count ?? 0,
      messages: messagesRes.count ?? 0,
    })
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Memuat ruang..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!space) return null

  const features = [
    { label: 'Timeline', description: 'Lihat momen Anda', href: `/spaces/${slug}/timeline`, icon: Clock, color: 'bg-brand-50 text-brand-500' },
    { label: 'Galeri', description: 'Jelajahi foto', href: `/spaces/${slug}/gallery`, icon: Image, color: 'bg-coral-50 text-coral-500' },
    { label: 'Pesan', description: 'Chat dengan pasangan', href: `/spaces/${slug}/messages`, icon: MessageCircle, color: 'bg-warm-100 text-warm-500' },
    { label: 'Musik', description: 'Bagikan lagu', href: `/spaces/${slug}/spotify`, icon: Music, color: 'bg-brand-50 text-brand-400' },
    { label: 'Permainan', description: 'Main bersama', href: `/spaces/${slug}/games`, icon: Gamepad2, color: 'bg-coral-50 text-coral-400' },
    { label: 'Dokumen', description: 'File bersama', href: `/spaces/${slug}/docs`, icon: FileText, color: 'bg-warm-100 text-warm-600' },
    { label: 'Wishlist', description: 'Daftar impian', href: `/spaces/${slug}/wishlist`, icon: Star, color: 'bg-brand-50 text-brand-500' },
    { label: 'Lokasi', description: 'Bagikan lokasi', href: `/spaces/${slug}/locations`, icon: MapPin, color: 'bg-coral-50 text-coral-500' },
  ]

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <FadeIn>
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-coral-500 p-8 text-white shadow-xl shadow-brand-500/25 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Heart className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{space.title}</h2>
                  <p className="text-sm text-white/80">
                    Dibuat {new Date(space.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p className="text-white/90 max-w-xl text-lg">
                Selamat datang di ruang berbagi Anda. Jelajahi fitur-fitur bersama pasangan.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <div>
          <FadeIn delay={0.1}>
            <h3 className="text-lg font-semibold text-warm-900 mb-6">Fitur</h3>
          </FadeIn>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <StaggerItem key={feature.href}>
                  <Link
                    href={feature.href}
                    className="group flex items-center gap-4 rounded-2xl bg-white border border-warm-100 p-5 transition-all hover:shadow-lg hover:shadow-warm-900/5 hover:-translate-y-0.5"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-warm-900 group-hover:text-brand-600 transition-colors">{feature.label}</p>
                      <p className="text-xs text-warm-500">{feature.description}</p>
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>

        {/* Quick Stats */}
        <FadeIn delay={0.2}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white border border-warm-100 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-warm-900">{stats.events}</p>
              <p className="text-sm text-warm-500">{stats.events === 1 ? 'Event' : 'Event'}</p>
            </div>
            <div className="rounded-2xl bg-white border border-warm-100 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500 mb-3">
                <Image className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-warm-900">{stats.photos}</p>
              <p className="text-sm text-warm-500">{stats.photos === 1 ? 'Foto' : 'Foto'}</p>
            </div>
            <div className="rounded-2xl bg-white border border-warm-100 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-100 text-warm-500 mb-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-warm-900">{stats.messages}</p>
              <p className="text-sm text-warm-500">{stats.messages === 1 ? 'Pesan' : 'Pesan'}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </AuthenticatedLayout>
  )
}
