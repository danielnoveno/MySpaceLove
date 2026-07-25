'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Plus, Clock, Heart, Image, MessageCircle, Gamepad2 } from 'lucide-react'
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchSpaces()
    }
  }, [user, authLoading, router])

  const fetchSpaces = async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .or(`user_one_id.eq.${user?.id},user_two_id.eq.${user?.id}`)
      .order('created_at', { ascending: false })

    if (data) {
      setSpaces(data)
    }
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading spaces..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here&apos;s your shared spaces</p>
        </div>
      }
    >
      {/* Spaces Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create New Space Card */}
        <Link
          href="/spaces/create"
          className="group rounded-3xl border-2 border-dashed border-pink-200 bg-white/50 p-8 text-center transition-all hover:border-pink-400 hover:bg-white/80 hover:shadow-lg"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-500 transition-colors group-hover:bg-pink-500 group-hover:text-white">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Create New Space</h3>
          <p className="mt-2 text-sm text-gray-600">Start a new shared space with your partner</p>
        </Link>

        {/* Existing Spaces */}
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`/spaces/${space.slug}`}
            className="group rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-xs text-gray-500">
                {new Date(space.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
              {space.title}
            </h3>
            {space.bio && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{space.bio}</p>
            )}
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-1 text-xs text-pink-600">
                <Clock className="h-3 w-3" />
                Timeline
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-600">
                <Image className="h-3 w-3" />
                Gallery
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                <MessageCircle className="h-3 w-3" />
                Chat
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      {spaces.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/spaces/${spaces[0].slug}/timeline`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm border border-white/70 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Timeline</p>
                <p className="text-xs text-gray-500">View your moments</p>
              </div>
            </Link>

            <Link
              href={`/spaces/${spaces[0].slug}/gallery`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm border border-white/70 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gallery</p>
                <p className="text-xs text-gray-500">Browse photos</p>
              </div>
            </Link>

            <Link
              href={`/spaces/${spaces[0].slug}/messages`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm border border-white/70 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Messages</p>
                <p className="text-xs text-gray-500">Chat with partner</p>
              </div>
            </Link>

            <Link
              href={`/spaces/${spaces[0].slug}/games`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm border border-white/70 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Games</p>
                <p className="text-xs text-gray-500">Play together</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Empty State */}
      {spaces.length === 0 && (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="No spaces yet"
          description="Create your first shared space to start building memories together."
          actionLabel="Create Your Space"
          onAction={() => router.push('/spaces/create')}
        />
      )}
    </AuthenticatedLayout>
  )
}
