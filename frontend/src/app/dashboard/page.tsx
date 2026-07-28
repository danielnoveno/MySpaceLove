'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import { Plus, Clock, Heart, Image as ImageIcon, MessageCircle, Gamepad2, Sparkles } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

type Space = {
  id: number
  slug: string
  title: string
  bio: string | null
  created_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSpaces = useCallback(async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .or(`user_one_id.eq.${user?.id},user_two_id.eq.${user?.id}`)
      .order('created_at', { ascending: false })

    if (data) {
      setSpaces(data)
    }
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      const timeout = setTimeout(fetchSpaces, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, router, fetchSpaces])

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Memuat ruang..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <Sparkles className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">Selamat datang kembali!</h1>
              <p className="text-warm-500">Berikut ruang berbagi Anda</p>
            </div>
          </div>
        </FadeIn>
      }
    >
      <div className="space-y-8">
        {/* Create New Space Card */}
        <FadeIn delay={0.1}>
          <Link
            href="/spaces/create"
            className="group block rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-8 text-center transition-all hover:border-brand-400 hover:bg-brand-50 hover:shadow-lg hover:shadow-brand-500/10"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-500 transition-all group-hover:bg-brand-500 group-hover:text-white group-hover:scale-110">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-warm-900">Buat Ruang Baru</h3>
            <p className="mt-2 text-sm text-warm-500">Mulai ruang berbagi baru dengan pasangan Anda</p>
          </Link>
        </FadeIn>

        {/* Existing Spaces */}
        {spaces.length > 0 && (
          <div>
            <FadeIn delay={0.2}>
              <h2 className="text-lg font-semibold text-warm-900 mb-4">Ruang Anda</h2>
            </FadeIn>
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <StaggerItem key={space.id}>
                  <Link
                    href={`/spaces/${space.slug}`}
                    className="group block rounded-3xl bg-white border border-warm-100 p-6 transition-all hover:shadow-xl hover:shadow-warm-900/5 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-coral-500 text-white shadow-lg shadow-brand-500/25">
                        <Heart className="h-7 w-7" />
                      </div>
                      <span className="text-xs text-warm-400">
                        {new Date(space.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-warm-900 group-hover:text-brand-600 transition-colors">
                      {space.title}
                    </h3>
                    {space.bio && (
                      <p className="mt-2 text-sm text-warm-500 line-clamp-2">{space.bio}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
                        <Clock className="h-3 w-3" />
                        Timeline
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 px-3 py-1 text-xs font-medium text-coral-600">
                        <ImageIcon className="h-3 w-3" />
                        Galeri
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-3 py-1 text-xs font-medium text-warm-600">
                        <MessageCircle className="h-3 w-3" />
                        Pesan
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* Quick Actions */}
        {spaces.length > 0 && (
          <FadeIn delay={0.3}>
            <div>
              <h2 className="text-lg font-semibold text-warm-900 mb-4">Aksi Cepat</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href={`/spaces/${spaces[0].slug}/timeline`}
                  className="group flex items-center gap-4 rounded-2xl bg-white border border-warm-100 p-5 transition-all hover:shadow-lg hover:shadow-warm-900/5 hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 group-hover:text-brand-600 transition-colors">Timeline</p>
                    <p className="text-xs text-warm-500">Lihat momen Anda</p>
                  </div>
                </Link>

                <Link
                  href={`/spaces/${spaces[0].slug}/gallery`}
                  className="group flex items-center gap-4 rounded-2xl bg-white border border-warm-100 p-5 transition-all hover:shadow-lg hover:shadow-warm-900/5 hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500 transition-colors group-hover:bg-coral-500 group-hover:text-white">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 group-hover:text-coral-600 transition-colors">Galeri</p>
                    <p className="text-xs text-warm-500">Jelajahi foto</p>
                  </div>
                </Link>

                <Link
                  href={`/spaces/${spaces[0].slug}/messages`}
                  className="group flex items-center gap-4 rounded-2xl bg-white border border-warm-100 p-5 transition-all hover:shadow-lg hover:shadow-warm-900/5 hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-100 text-warm-500 transition-colors group-hover:bg-warm-500 group-hover:text-white">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 group-hover:text-warm-600 transition-colors">Pesan</p>
                    <p className="text-xs text-warm-500">Chat dengan pasangan</p>
                  </div>
                </Link>

                <Link
                  href={`/spaces/${spaces[0].slug}/games`}
                  className="group flex items-center gap-4 rounded-2xl bg-white border border-warm-100 p-5 transition-all hover:shadow-lg hover:shadow-warm-900/5 hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-400 transition-colors group-hover:bg-brand-400 group-hover:text-white">
                    <Gamepad2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 group-hover:text-brand-500 transition-colors">Permainan</p>
                    <p className="text-xs text-warm-500">Main bersama</p>
                  </div>
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Empty State */}
        {spaces.length === 0 && (
          <EmptyState
            icon={<Heart className="h-12 w-12" />}
            title="Belum ada ruang"
            description="Buat ruang berbagi pertama Anda untuk mulai membangun kenangan bersama."
            actionLabel="Buat Ruang Anda"
            onAction={() => router.push('/spaces/create')}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}
