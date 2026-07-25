'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Sparkles,
  Play,
  Pause,
  Trash2,
  Edit,
  Music,
  Calendar,
  Loader2,
  ExternalLink,
  Send,
} from 'lucide-react'

type SurpriseDrop = {
  id: string
  space_id: string
  user_id: string
  track_name: string
  track_artist: string
  track_album: string
  track_image: string | null
  track_url: string
  preview_url: string | null
  message: string | null
  scheduled_at: string | null
  is_sent: boolean
  created_at: string
}

export default function SurpriseDropsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [drops, setDrops] = useState<SurpriseDrop[]>([])
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
      fetchDrops()
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

  const fetchDrops = async () => {
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
      .from('spotify_surprise_drops')
      .select('*')
      .eq('space_id', space.id)
      .order('created_at', { ascending: false })

    setDrops(data || [])
    setLoading(false)
  }

  const playPreview = useCallback((drop: SurpriseDrop) => {
    if (!drop.preview_url) return

    if (playingId === drop.id && audioRef) {
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

    const audio = new Audio(drop.preview_url)
    audio.onended = () => {
      setPlayingId(null)
      setAudioRef(null)
    }
    audio.play()
    setPlayingId(drop.id)
    setAudioRef(audio)
  }, [playingId, audioRef])

  const deleteDrop = useCallback(async (drop: SurpriseDrop) => {
    if (!confirm(`Delete this surprise drop?`)) return

    setDeleting(drop.id)
    await supabase.from('spotify_surprise_drops').delete().eq('id', drop.id)
    setDrops((prev) => prev.filter((d) => d.id !== drop.id))
    setDeleting(null)
  }, [supabase])

  const sendDrop = useCallback(async (drop: SurpriseDrop) => {
    if (!confirm('Send this drop now to your partner?')) return

    const { error } = await supabase
      .from('spotify_surprise_drops')
      .update({ is_sent: true, scheduled_at: new Date().toISOString() })
      .eq('id', drop.id)

    if (!error) {
      setDrops((prev) =>
        prev.map((d) =>
          d.id === drop.id
            ? { ...d, is_sent: true, scheduled_at: new Date().toISOString() }
            : d
        )
      )
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Surprise Drops</h1>
            <p className="text-gray-600 text-sm">Send unexpected music to your partner</p>
          </div>
          <Link
            href={`/spaces/${slug}/spotify/surprise-drops/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            New Drop
          </Link>
        </div>
      }
    >
      {drops.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 mb-6">
            <Sparkles className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No surprise drops yet</h2>
          <p className="text-gray-600 mb-6">
            Create a surprise music drop to brighten your partner&apos;s day.
          </p>
          <Link
            href={`/spaces/${slug}/spotify/surprise-drops/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-5 w-5" />
            Create Drop
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="group relative rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {/* Track Image */}
              <div className="relative h-44 bg-gradient-to-br from-yellow-100 to-orange-100">
                {drop.track_image ? (
                  <img
                    src={drop.track_image}
                    alt={drop.track_album}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Music className="h-16 w-16 text-yellow-300" />
                  </div>
                )}

                {/* Sent Badge */}
                {drop.is_sent && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Send className="h-3 w-3" />
                    Sent
                  </div>
                )}

                {/* Scheduled Badge */}
                {!drop.is_sent && drop.scheduled_at && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Calendar className="h-3 w-3" />
                    Scheduled
                  </div>
                )}

                {/* Play Button */}
                {drop.preview_url && (
                  <button
                    onClick={() => playPreview(drop)}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-pink-600 shadow-md hover:bg-white hover:scale-110 transition-all"
                  >
                    {playingId === drop.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                )}

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {!drop.is_sent && (
                    <button
                      onClick={() => sendDrop(drop)}
                      className="bg-green-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600"
                      title="Send now"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/spaces/${slug}/spotify/surprise-drops/create?edit=${drop.id}`}
                    className="bg-blue-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteDrop(drop)}
                    disabled={deleting === drop.id}
                    className="bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    {deleting === drop.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                  {drop.track_name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {drop.track_artist} — {drop.track_album}
                </p>

                {drop.message && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2 italic">
                    &quot;{drop.message}&quot;
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {drop.is_sent
                      ? `Sent ${new Date(drop.scheduled_at!).toLocaleDateString()}`
                      : drop.scheduled_at
                        ? `Scheduled ${new Date(drop.scheduled_at).toLocaleDateString()}`
                        : 'Draft'}
                  </div>
                  <a
                    href={drop.track_url}
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
