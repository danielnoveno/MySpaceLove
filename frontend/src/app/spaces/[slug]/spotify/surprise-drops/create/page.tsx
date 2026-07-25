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
  Sparkles,
} from 'lucide-react'

type TrackPreview = {
  name: string
  artists: string
  album: string
  image_url: string
  preview_url: string | null
  track_url: string
} | null

export default function CreateSurpriseDropPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [trackUrl, setTrackUrl] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
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

    if (!spaceId || !trackPreview) {
      setError('Please fetch a track preview first.')
      return
    }

    setSubmitting(true)
    setError('')

    const payload = {
      space_id: spaceId,
      user_id: user!.id,
      track_name: trackPreview.name,
      track_artist: trackPreview.artists,
      track_album: trackPreview.album,
      track_image: trackPreview.image_url,
      track_url: trackPreview.track_url,
      preview_url: trackPreview.preview_url,
      message: message.trim() || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      is_sent: !scheduledAt,
    }

    const { error: insertError } = await supabase
      .from('spotify_surprise_drops')
      .insert(payload)

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    if (audioRef) {
      audioRef.pause()
      audioRef.src = ''
    }

    router.push(`/spaces/${slug}/spotify/surprise-drops`)
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
            href={`/spaces/${slug}/spotify/surprise-drops`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Surprise Drop</h1>
            <p className="text-gray-600 text-sm">Send a surprise music track</p>
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

          {/* Track URL */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="trackUrl" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-pink-500" />
                Spotify Track URL
              </span>
            </label>
            <input
              id="trackUrl"
              type="url"
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              required
            />

            {trackError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {trackError}
              </p>
            )}

            {fetchingTrack && (
              <div className="mt-3 flex items-center gap-2 text-sm text-pink-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching track info...
              </div>
            )}

            {trackPreview && !fetchingTrack && (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-yellow-50/80 p-4">
                <div className="relative shrink-0">
                  {trackPreview.image_url ? (
                    <img
                      src={trackPreview.image_url}
                      alt={trackPreview.album}
                      className="h-20 w-20 rounded-xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Music className="h-8 w-8 text-yellow-300" />
                    </div>
                  )}
                  {trackPreview.preview_url && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {playing ? (
                        <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="flex gap-1">
                            <div className="w-1 h-4 bg-pink-600 rounded-full animate-pulse" />
                            <div className="w-1 h-3 bg-pink-600 rounded-full animate-pulse" />
                            <div className="w-1 h-4 bg-pink-600 rounded-full animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-4 w-4 text-pink-600 ml-0.5" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{trackPreview.name}</p>
                  <p className="text-sm text-gray-600 truncate">{trackPreview.artists}</p>
                  <p className="text-xs text-gray-500 truncate">{trackPreview.album}</p>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-pink-500" />
                Message (optional)
              </span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a little note with your surprise..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Schedule */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                Schedule (optional)
              </span>
            </label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
            <p className="mt-2 text-xs text-gray-500">Leave empty to send immediately</p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/spotify/surprise-drops`}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !trackPreview}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {scheduledAt ? 'Schedule Drop' : 'Send Now'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
