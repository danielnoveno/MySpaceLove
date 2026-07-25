'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Lock,
  Unlock,
  Play,
  Trash2,
  Music,
  Calendar,
  Loader2,
  ExternalLink,
  Pause,
} from 'lucide-react'

type Capsule = {
  id: string
  space_id: string
  user_id: string
  title: string
  message: string | null
  track_name: string
  track_artist: string
  track_album: string
  track_image: string | null
  track_url: string
  preview_url: string | null
  unlock_at: string
  is_unlocked: boolean
  created_at: string
}

export default function SpotifyCapsulesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      fetchCapsules()
    }
  }, [user, authLoading, slug, router])

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause()
        audioRef.src = ''
      }
    }
  }, [audioRef])

  const fetchCapsules = async () => {
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
      .from('spotify_capsules')
      .select('*')
      .eq('space_id', space.id)
      .order('unlock_at', { ascending: true })

    if (data) {
      const now = new Date()
      const withUnlockStatus = data.map((c: any) => ({
        ...c,
        is_unlocked: new Date(c.unlock_at) <= now,
      }))
      setCapsules(withUnlockStatus)
    }

    setLoading(false)
  }

  const playPreview = useCallback((capsule: Capsule) => {
    if (!capsule.preview_url) return

    if (playingId === capsule.id && audioRef) {
      audioRef.pause()
      audioRef.src = ''
      setPlayingId(null)
      setAudioRef(null)
      return
    }

    if (audioRef) {
      audioRef.pause()
      audioRef.src = ''
    }

    const audio = new Audio(capsule.preview_url)
    audio.onended = () => {
      setPlayingId(null)
      setAudioRef(null)
    }
    audio.play()
    setPlayingId(capsule.id)
    setAudioRef(audio)
  }, [playingId, audioRef])

  const deleteCapsule = useCallback(async (capsule: Capsule) => {
    if (!confirm(`Delete "${capsule.title}"?`)) return

    setDeleting(capsule.id)
    await supabase.from('spotify_capsules').delete().eq('id', capsule.id)
    setCapsules((prev) => prev.filter((c) => c.id !== capsule.id))
    setDeleting(null)
  }, [supabase])

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-pink-400">Spotify</p>
            <h1 className="text-2xl font-bold text-gray-900">Music Capsules</h1>
            <p className="text-gray-600 text-sm">Time-locked songs for special moments</p>
          </div>
          <Link
            href={`/spaces/${slug}/spotify/capsules/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            New Capsule
          </Link>
        </div>
      }
    >
      {capsules.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-6">
            <Music className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No capsules yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first music capsule to lock a song until a special date.
          </p>
          <Link
            href={`/spaces/${slug}/spotify/capsules/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-5 w-5" />
            Create Capsule
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className={`group relative rounded-3xl bg-white/80 backdrop-blur shadow-sm border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                capsule.is_unlocked ? 'border-green-100' : 'border-white/70'
              }`}
            >
              {/* Track Image */}
              <div className="relative h-44 bg-gradient-to-br from-pink-100 to-purple-100">
                {capsule.track_image ? (
                  <img
                    src={capsule.track_image}
                    alt={capsule.track_album}
                    className={`w-full h-full object-cover ${!capsule.is_unlocked ? 'blur-md scale-110' : ''}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Music className="h-16 w-16 text-pink-300" />
                  </div>
                )}

                {/* Lock Overlay */}
                {!capsule.is_unlocked && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Locked</p>
                      <p className="text-xs text-white/80">
                        Unlocks {new Date(capsule.unlock_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Unlocked Badge */}
                {capsule.is_unlocked && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Unlock className="h-3 w-3" />
                    Unlocked
                  </div>
                )}

                {/* Play Button */}
                {capsule.is_unlocked && capsule.preview_url && (
                  <button
                    onClick={() => playPreview(capsule)}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-pink-600 shadow-md hover:bg-white hover:scale-110 transition-all"
                  >
                    {playingId === capsule.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteCapsule(capsule)}
                  disabled={deleting === capsule.id}
                  className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  {deleting === capsule.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                  {capsule.title}
                </h3>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {capsule.track_name} — {capsule.track_artist}
                </p>

                {capsule.message && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2 italic">
                    &quot;{capsule.message}&quot;
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {capsule.is_unlocked ? 'Opened' : 'Opens'} {new Date(capsule.unlock_at).toLocaleDateString()}
                  </div>
                  <a
                    href={capsule.track_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-500 hover:text-pink-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
