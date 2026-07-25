'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Music,
  ListPlus,
  Link as LinkIcon,
  Loader2,
  Check,
  Play,
  Pause,
  AlertCircle,
  GripVertical,
  X,
  Plus,
} from 'lucide-react'

type TrackInput = {
  track_name: string
  track_artist: string
  track_album: string
  track_image: string | null
  track_url: string
  preview_url: string | null
}

export default function CreateListeningPlanPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tracks, setTracks] = useState<TrackInput[]>([])
  const [trackUrl, setTrackUrl] = useState('')
  const [fetchingTrack, setFetchingTrack] = useState(false)
  const [trackError, setTrackError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      ;(async () => {
        const { data: space } = await supabase
          .from('spaces')
          .select('id')
          .eq('slug', slug)
          .single()

        if (space) {
          setSpaceId(space.id)
        } else {
          router.push('/dashboard')
        }
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause()
        audioRef.src = ''
      }
    }
  }, [audioRef])

  const addTrack = useCallback(async () => {
    const spotifyMatch = trackUrl.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/)
    if (!spotifyMatch) {
      setTrackError('Please enter a valid Spotify track or album URL')
      return
    }

    setFetchingTrack(true)
    setTrackError('')

    try {
      const res = await fetch(`/api/spotify/track?url=${encodeURIComponent(trackUrl)}`)
      if (!res.ok) throw new Error('Failed to fetch track info')

      const data = await res.json()

      if (tracks.some((t) => t.track_url === data.track_url)) {
        setTrackError('This track is already in the list')
        setFetchingTrack(false)
        return
      }

      setTracks((prev) => [...prev, {
        track_name: data.name,
        track_artist: data.artists,
        track_album: data.album,
        track_image: data.image_url,
        track_url: data.track_url,
        preview_url: data.preview_url,
      }])
      setTrackUrl('')
    } catch {
      setTrackError('Could not fetch track info')
    }
    setFetchingTrack(false)
  }, [trackUrl, tracks])

  const removeTrack = useCallback((idx: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const togglePlay = useCallback((track: TrackInput, idx: number) => {
    if (!track.preview_url) return

    if (playingIdx === idx && audioRef) {
      audioRef.pause()
      audioRef.src = ''
      setPlayingIdx(null)
      setAudioRef(null)
      return
    }

    if (audioRef) {
      audioRef.pause()
      audioRef.src = ''
    }

    const audio = new Audio(track.preview_url)
    audio.onended = () => {
      setPlayingIdx(null)
      setAudioRef(null)
    }
    audio.play()
    setPlayingIdx(idx)
    setAudioRef(audio)
  }, [playingIdx, audioRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!spaceId || !title.trim()) {
      setError('Please enter a plan title.')
      return
    }

    if (tracks.length === 0) {
      setError('Please add at least one track.')
      return
    }

    setSubmitting(true)
    setError('')

    const { data: plan, error: planError } = await supabase
      .from('spotify_listening_plans')
      .insert({
        space_id: spaceId,
        user_id: user!.id,
        title: title.trim(),
        description: description.trim() || null,
      })
      .select()
      .single()

    if (planError) {
      setError(planError.message)
      setSubmitting(false)
      return
    }

    const trackInserts = tracks.map((track, idx) => ({
      plan_id: plan.id,
      track_name: track.track_name,
      track_artist: track.track_artist,
      track_album: track.track_album,
      track_image: track.track_image,
      track_url: track.track_url,
      preview_url: track.preview_url,
      position: idx,
    }))

    const { error: tracksError } = await supabase
      .from('spotify_listening_plan_tracks')
      .insert(trackInserts)

    if (tracksError) {
      setError(tracksError.message)
      setSubmitting(false)
      return
    }

    if (audioRef) {
      audioRef.pause()
      audioRef.src = ''
    }

    router.push(`/spaces/${slug}/spotify/listening-plans`)
  }

  if (authLoading) {
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
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}/spotify/listening-plans`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Listening Plan</h1>
            <p className="text-gray-600 text-sm">Curate a playlist for you and your partner</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Plan Details */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Plan Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Date Night Vibes, Road Trip Mix..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this playlist about?"
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Add Track */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="trackUrl" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-pink-500" />
                Add Spotify Track
              </span>
            </label>

            <div className="flex gap-2">
              <input
                id="trackUrl"
                type="url"
                value={trackUrl}
                onChange={(e) => setTrackUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTrack()
                  }
                }}
                placeholder="https://open.spotify.com/track/..."
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={addTrack}
                disabled={fetchingTrack || !trackUrl.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {fetchingTrack ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </div>

            {trackError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {trackError}
              </p>
            )}
          </div>

          {/* Track List */}
          {tracks.length > 0 && (
            <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListPlus className="h-4 w-4 text-pink-500" />
                <h3 className="text-sm font-medium text-gray-700">
                  Track List ({tracks.length} track{tracks.length !== 1 ? 's' : ''})
                </h3>
              </div>

              <div className="space-y-2">
                {tracks.map((track, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl bg-pink-50/50 p-3 group"
                  >
                    <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                    <span className="text-xs text-gray-400 w-5 text-center shrink-0">{idx + 1}</span>

                    {track.track_image ? (
                      <img
                        src={track.track_image}
                        alt={track.track_album}
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                        <Music className="h-5 w-5 text-pink-300" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{track.track_name}</p>
                      <p className="text-xs text-gray-500 truncate">{track.track_artist}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {track.preview_url && (
                        <button
                          type="button"
                          onClick={() => togglePlay(track, idx)}
                          className="p-1.5 text-pink-500 hover:bg-pink-100 rounded-full transition-colors"
                        >
                          {playingIdx === idx ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeTrack(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/spotify/listening-plans`}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !title.trim() || tracks.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
