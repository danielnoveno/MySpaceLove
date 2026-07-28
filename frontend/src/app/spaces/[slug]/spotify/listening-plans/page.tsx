'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import AppImage from '@/components/AppImage'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Headphones,
  Trash2,
  Edit,
  Music,
  ExternalLink,
  ListMusic,
  Loader2,
  Play,
  Pause,
} from 'lucide-react'

type PlanTrack = {
  id: string
  plan_id: string
  track_name: string
  track_artist: string
  track_album: string
  track_image: string | null
  track_url: string
  preview_url: string | null
  position: number
}

type ListeningPlan = {
  id: string
  space_id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  tracks: PlanTrack[]
}

export default function ListeningPlansPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [plans, setPlans] = useState<ListeningPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const fetchPlans = useCallback(async () => {
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

    const { data: plansData } = await supabase
      .from('spotify_listening_plans')
      .select('*')
      .eq('space_id', space.id)
      .order('created_at', { ascending: false })

    if (!plansData) {
      setPlans([])
      setLoading(false)
      return
    }

    const plansWithTracks = await Promise.all(
      plansData.map(async (plan) => {
        const { data: tracks } = await supabase
          .from('spotify_listening_plan_tracks')
          .select('*')
          .eq('plan_id', plan.id)
          .order('position', { ascending: true })

        return { ...plan, tracks: tracks || [] }
      })
    )

    setPlans(plansWithTracks)
    setLoading(false)
  }, [slug, supabase])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      const timeout = setTimeout(fetchPlans, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, slug, router, fetchPlans])

  const playPreview = useCallback((track: PlanTrack) => {
    if (!track.preview_url) return

    if (playingId === track.id && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      setPlayingId(null)
      audioRef.current = null
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    const audio = new Audio(track.preview_url)
    audio.onended = () => {
      setPlayingId(null)
      audioRef.current = null
    }
    audio.play()
    setPlayingId(track.id)
    audioRef.current = audio
  }, [playingId])

  const deletePlan = useCallback(async (plan: ListeningPlan) => {
    if (!confirm(`Delete "${plan.title}"?`)) return

    setDeleting(plan.id)

    await supabase.from('spotify_listening_plan_tracks').delete().eq('plan_id', plan.id)
    await supabase.from('spotify_listening_plans').delete().eq('id', plan.id)

    setPlans((prev) => prev.filter((p) => p.id !== plan.id))
    setDeleting(null)
  }, [supabase])

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Spotify</p>
            <h1 className="text-2xl font-bold text-warm-900">Listening Plans</h1>
            <p className="text-warm-600 text-sm">Curated playlists to enjoy together</p>
          </div>
          <Link
            href={`/spaces/${slug}/spotify/listening-plans/create`}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </Link>
        </div>
      }
    >
      {plans.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-6">
            <Headphones className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-warm-900 mb-2">No listening plans yet</h2>
          <p className="text-warm-600 mb-6">
            Create your first listening plan to curate music for you and your partner.
          </p>
          <Link
            href={`/spaces/${slug}/spotify/listening-plans/create`}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <Plus className="h-5 w-5" />
            Create Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group rounded-3xl bg-white border border-warm-100 shadow-xl shadow-warm-900/5 overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                    <ListMusic className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-warm-900">{plan.title}</h3>
                    {plan.description && (
                      <p className="text-sm text-warm-600 line-clamp-1">{plan.description}</p>
                    )}
                    <p className="text-xs text-warm-400 mt-0.5">
                      {plan.tracks.length} track{plan.tracks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/spaces/${slug}/spotify/listening-plans/create?edit=${plan.id}`}
                    className="p-2 text-warm-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deletePlan(plan)}
                    disabled={deleting === plan.id}
                    className="p-2 text-warm-400 hover:text-coral-600 hover:bg-coral-50 rounded-full transition-colors"
                  >
                    {deleting === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Track List */}
              {plan.tracks.length > 0 ? (
                <div className="px-6 pb-6">
                  <div className="rounded-2xl border border-warm-100 divide-y divide-warm-50">
                    {plan.tracks.map((track, idx) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 py-3 px-4 hover:bg-brand-50/50 transition-colors"
                      >
                        <span className="text-xs text-warm-400 w-5 text-center shrink-0">
                          {idx + 1}
                        </span>

                        {track.track_image ? (
                          <AppImage
                            src={track.track_image}
                            alt={track.track_album}
                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                            <Music className="h-5 w-5 text-brand-300" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-warm-900 truncate">{track.track_name}</p>
                          <p className="text-xs text-warm-500 truncate">{track.track_artist}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {track.preview_url && (
                            <button
                              onClick={() => playPreview(track)}
                              className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-full transition-colors"
                            >
                              {playingId === track.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <a
                            href={track.track_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-warm-400 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 pb-6">
                  <p className="text-sm text-warm-500 text-center py-4">No tracks added yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
