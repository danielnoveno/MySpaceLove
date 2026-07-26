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
  Calendar,
  MessageSquare,
  Link as LinkIcon,
  Loader2,
  Check,
  Play,
  AlertCircle,
} from 'lucide-react'

type TrackPreview = {
  name: string
  artists: string
  album: string
  image_url: string
  preview_url: string | null
  track_url: string
} | null

export default function CreateCapsulePage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [trackUrl, setTrackUrl] = useState('')
  const [unlockAt, setUnlockAt] = useState('')
  const [trackPreview, setTrackPreview] = useState<TrackPreview>(null)
  const [fetchingTrack, setFetchingTrack] = useState(false)
  const [trackError, setTrackError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
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

  const fetchTrackPreview = useCallback(async () => {
    const spotifyMatch = trackUrl.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/)
    if (!spotifyMatch) {
      setTrackError('Please enter a valid Spotify track or album URL')
      return
    }

    setFetchingTrack(true)
    setTrackError('')
    setTrackPreview(null)

    try {
      const res = await fetch(`/api/spotify/track?url=${encodeURIComponent(trackUrl)}`)
      if (!res.ok) {
        throw new Error('Failed to fetch track info')
      }
      const data = await res.json()
      setTrackPreview(data)
    } catch {
      setTrackError('Could not fetch track info. Check the URL and try again.')
    }
    setFetchingTrack(false)
  }, [trackUrl])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (trackUrl.trim()) {
        fetchTrackPreview()
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [trackUrl, fetchTrackPreview])

  const togglePlay = useCallback(() => {
    if (!trackPreview?.preview_url) return

    if (playing && audioRef) {
      audioRef.pause()
      audioRef.src = ''
      setPlaying(false)
      setAudioRef(null)
      return
    }

    const audio = new Audio(trackPreview.preview_url)
    audio.onended = () => {
      setPlaying(false)
      setAudioRef(null)
    }
    audio.play()
    setPlaying(true)
    setAudioRef(audio)
  }, [playing, audioRef, trackPreview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!spaceId || !trackPreview || !unlockAt) {
      setError('Please fill in all required fields and fetch a track preview.')
      return
    }

    const unlockDate = new Date(unlockAt)
    if (unlockDate <= new Date()) {
      setError('Unlock date must be in the future.')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('spotify_capsules')
      .insert({
        space_id: spaceId,
        user_id: user!.id,
        title: title.trim() || trackPreview.name,
        message: message.trim() || null,
        track_name: trackPreview.name,
        track_artist: trackPreview.artists,
        track_album: trackPreview.album,
        track_image: trackPreview.image_url,
        track_url: trackPreview.track_url,
        preview_url: trackPreview.preview_url,
        unlock_at: unlockDate.toISOString(),
      })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    if (audioRef) {
      audioRef.pause()
      audioRef.src = ''
    }

    router.push(`/spaces/${slug}/spotify/capsules`)
  }

  if (authLoading) {
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
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}/spotify/capsules`}
            className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-warm-900">Create Capsule</h1>
            <p className="text-warm-600 text-sm">Lock a song until a special date</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Track URL */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label htmlFor="trackUrl" className="block text-sm font-medium text-warm-700 mb-2">
              <span className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-brand-500" />
                Spotify Track or Album URL
              </span>
            </label>
            <input
              id="trackUrl"
              type="url"
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full rounded-2xl border border-warm-200 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              required
            />

            {trackError && (
              <p className="mt-2 text-xs text-coral-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {trackError}
              </p>
            )}

            {fetchingTrack && (
              <div className="mt-3 flex items-center gap-2 text-sm text-brand-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching track info...
              </div>
            )}

            {trackPreview && !fetchingTrack && (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-brand-50/80 p-4">
                <div className="relative shrink-0">
                  {trackPreview.image_url ? (
                    <img
                      src={trackPreview.image_url}
                      alt={trackPreview.album}
                      className="h-20 w-20 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-brand-100 flex items-center justify-center">
                      <Music className="h-8 w-8 text-brand-300" />
                    </div>
                  )}
                  {trackPreview.preview_url && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {playing ? (
                        <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="flex gap-1">
                            <div className="w-1 h-4 bg-brand-600 rounded-full animate-pulse" />
                            <div className="w-1 h-3 bg-brand-600 rounded-full animate-pulse" />
                            <div className="w-1 h-4 bg-brand-600 rounded-full animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-4 w-4 text-brand-600 ml-0.5" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-warm-900 truncate">{trackPreview.name}</p>
                  <p className="text-sm text-warm-600 truncate">{trackPreview.artists}</p>
                  <p className="text-xs text-warm-500 truncate">{trackPreview.album}</p>
                </div>
                <a
                  href={trackPreview.track_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-brand-500 hover:text-brand-600"
                >
                  <LinkIcon className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-2">
              <span className="flex items-center gap-2">
                <Music className="h-4 w-4 text-brand-500" />
                Capsule Title
              </span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our Song, Anniversary Track..."
              className="w-full rounded-2xl border border-warm-200 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
            />
            <p className="mt-2 text-xs text-warm-500">Leave blank to use the track name</p>
          </div>

          {/* Message */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label htmlFor="message" className="block text-sm font-medium text-warm-700 mb-2">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-500" />
                Message (optional)
              </span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to reveal with this song..."
              rows={3}
              className="w-full rounded-2xl border border-warm-200 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Unlock Date */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label htmlFor="unlockAt" className="block text-sm font-medium text-warm-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-500" />
                Unlock Date &amp; Time
              </span>
            </label>
            <input
              id="unlockAt"
              type="datetime-local"
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
              className="w-full rounded-2xl border border-warm-200 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/spotify/capsules`}
              className="rounded-2xl px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !trackPreview || !unlockAt}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Capsule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
