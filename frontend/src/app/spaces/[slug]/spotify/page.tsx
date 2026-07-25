'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Music,
  Disc3,
  Headphones,
  CalendarClock,
  Sparkles,
  Link as LinkIcon,
  Unplug,
  Play,
  Loader2,
} from 'lucide-react'

type SpotifyTokens = {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  display_name: string | null
}

type NowPlaying = {
  name: string
  artists: string
  album: string
  image_url: string
  preview_url: string | null
  spotify_url: string
}

export default function SpotifyDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [tokens, setTokens] = useState<SpotifyTokens | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false)
  const [capsuleCount, setCapsuleCount] = useState(0)
  const [dropCount, setDropCount] = useState(0)
  const [planCount, setPlanCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      fetchTokens()
    }
  }, [user, authLoading, slug, router])

  const fetchTokens = async () => {
    setLoading(true)

    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user!.id)
      .single()

    setTokens(data)

    if (data) {
      fetchCounts(space.id)
      fetchNowPlaying()
    }

    setLoading(false)
  }

  const fetchCounts = async (spaceId: string) => {
    const [capsules, drops, plans] = await Promise.all([
      supabase.from('spotify_capsules').select('id', { count: 'exact', head: true }).eq('space_id', spaceId),
      supabase.from('spotify_surprise_drops').select('id', { count: 'exact', head: true }).eq('space_id', spaceId),
      supabase.from('spotify_listening_plans').select('id', { count: 'exact', head: true }).eq('space_id', spaceId),
    ])

    setCapsuleCount(capsules.count ?? 0)
    setDropCount(drops.count ?? 0)
    setPlanCount(plans.count ?? 0)
  }

  const fetchNowPlaying = async () => {
    setNowPlayingLoading(true)
    try {
      const res = await fetch('/api/spotify/now-playing')
      if (res.ok) {
        const data = await res.json()
        setNowPlaying(data)
      }
    } catch {
      // Silently fail
    }
    setNowPlayingLoading(false)
  }

  const connectSpotify = useCallback(async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/spotify/auth-url')
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch {
      setConnecting(false)
    }
  }, [])

  const disconnectSpotify = useCallback(async () => {
    if (!confirm('Disconnect your Spotify account?')) return

    await supabase.from('spotify_tokens').delete().eq('user_id', user!.id)
    setTokens(null)
    setNowPlaying(null)
    setCapsuleCount(0)
    setDropCount(0)
    setPlanCount(0)
  }, [supabase, user])

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-pink-400">Music</p>
          <h1 className="text-2xl font-bold text-gray-900">Spotify Dashboard</h1>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Connection Status */}
        <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${tokens ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Music className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Spotify Account</h2>
                {tokens ? (
                  <p className="text-sm text-green-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Connected {tokens.display_name ? `as ${tokens.display_name}` : ''}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>

            <div>
              {tokens ? (
                <button
                  onClick={disconnectSpotify}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectSpotify}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ed760] disabled:opacity-50"
                >
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  Connect Spotify
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Now Playing */}
        {tokens && (
          <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50/50 backdrop-blur shadow-sm border border-green-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Disc3 className={`h-5 w-5 text-green-600 ${nowPlaying ? 'animate-spin' : ''}`} />
              <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider">Now Playing</h3>
            </div>

            {nowPlayingLoading ? (
              <div className="flex items-center gap-3 text-green-700/70">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Checking what&apos;s playing...</span>
              </div>
            ) : nowPlaying ? (
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={nowPlaying.image_url}
                    alt={nowPlaying.album}
                    className="h-20 w-20 rounded-2xl object-cover shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Play className="h-3 w-3 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{nowPlaying.name}</p>
                  <p className="text-sm text-gray-600 truncate">{nowPlaying.artists}</p>
                  <p className="text-xs text-gray-500 truncate">{nowPlaying.album}</p>
                </div>
                <a
                  href={nowPlaying.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full bg-[#1DB954] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1ed760] transition-colors"
                >
                  Open in Spotify
                </a>
              </div>
            ) : (
              <div className="text-green-700/60 text-sm">
                <p>Nothing playing right now. Start a song on Spotify to see it here.</p>
              </div>
            )}

            <button
              onClick={fetchNowPlaying}
              disabled={nowPlayingLoading}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 transition-colors"
            >
              <Loader2 className={`h-3 w-3 ${nowPlayingLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Features</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href={`/spaces/${slug}/spotify/capsules`}
              className="group flex flex-col items-center gap-3 rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-8 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-500 group-hover:scale-110 transition-transform">
                <CalendarClock className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Capsules</p>
                <p className="text-sm text-gray-500">{capsuleCount} capsule{capsuleCount !== 1 ? 's' : ''}</p>
              </div>
            </Link>

            <Link
              href={`/spaces/${slug}/spotify/surprise-drops`}
              className="group flex flex-col items-center gap-3 rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-8 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Surprise Drops</p>
                <p className="text-sm text-gray-500">{dropCount} drop{dropCount !== 1 ? 's' : ''}</p>
              </div>
            </Link>

            <Link
              href={`/spaces/${slug}/spotify/listening-plans`}
              className="group flex flex-col items-center gap-3 rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-8 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500 group-hover:scale-110 transition-transform">
                <Headphones className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Listening Plans</p>
                <p className="text-sm text-gray-500">{planCount} plan{planCount !== 1 ? 's' : ''}</p>
              </div>
            </Link>
          </div>
        </div>

        {!tokens && (
          <div className="rounded-3xl bg-pink-50/80 backdrop-blur border border-pink-100 p-8 text-center">
            <Headphones className="h-12 w-12 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Spotify to Get Started</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Link your Spotify account to create music capsules, send surprise drops, and plan listening sessions with your partner.
            </p>
            <button
              onClick={connectSpotify}
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ed760] disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              Connect Spotify
            </button>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
