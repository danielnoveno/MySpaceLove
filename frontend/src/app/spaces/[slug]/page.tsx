'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Clock, Image, MessageCircle, Music, Gamepad2, Heart, FileText, MapPin, Star, MessageSquare, Calendar } from 'lucide-react'
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
          <LoadingSpinner size="lg" text="Loading space..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!space) return null

  const features = [
    { label: 'Timeline', description: 'View your moments', href: `/spaces/${slug}/timeline`, icon: Clock, color: 'bg-pink-100 text-pink-500' },
    { label: 'Gallery', description: 'Browse photos', href: `/spaces/${slug}/gallery`, icon: Image, color: 'bg-purple-100 text-purple-500' },
    { label: 'Messages', description: 'Chat with partner', href: `/spaces/${slug}/messages`, icon: MessageCircle, color: 'bg-blue-100 text-blue-500' },
    { label: 'Music', description: 'Share songs', href: `/spaces/${slug}/spotify`, icon: Music, color: 'bg-green-100 text-green-500' },
    { label: 'Games', description: 'Play together', href: `/spaces/${slug}/games`, icon: Gamepad2, color: 'bg-orange-100 text-orange-500' },
    { label: 'Documents', description: 'Shared files', href: `/spaces/${slug}/docs`, icon: FileText, color: 'bg-indigo-100 text-indigo-500' },
    { label: 'Wishlist', description: 'Dream list', href: `/spaces/${slug}/wishlist`, icon: Star, color: 'bg-yellow-100 text-yellow-500' },
    { label: 'Location', description: 'Share location', href: `/spaces/${slug}/location`, icon: MapPin, color: 'bg-red-100 text-red-500' },
  ]

  return (
    <AuthenticatedLayout
      header={
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-pink-400">Your Space</p>
          <h1 className="text-3xl font-bold text-gray-900">{space.title}</h1>
          {space.bio && (
            <p className="mt-1 text-gray-600">{space.bio}</p>
          )}
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Heart className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{space.title}</h2>
                <p className="text-sm text-white/80">
                  Created {new Date(space.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-white/90 max-w-xl">
              Welcome to your shared space. Explore features together with your partner.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Features</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group flex items-center gap-4 rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm border border-white/70 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${feature.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{feature.label}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
            <p className="text-sm text-gray-500">{stats.events === 1 ? 'Event' : 'Events'}</p>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500 mb-3">
              <Image className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.photos}</p>
            <p className="text-sm text-gray-500">{stats.photos === 1 ? 'Photo' : 'Photos'}</p>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.messages}</p>
            <p className="text-sm text-gray-500">{stats.messages === 1 ? 'Message' : 'Messages'}</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
