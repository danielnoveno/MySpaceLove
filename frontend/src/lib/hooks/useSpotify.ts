'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: spotify_tokens
// Columns: id, user_id, space_id, access_token, refresh_token, expires_in, expires_at, scope, token_type, shared_playlist_id
export type SpotifyToken = {
  id: number
  user_id: string
  space_id: number | null
  access_token: string
  refresh_token: string | null
  expires_in: number
  expires_at: string
  scope: string | null
  token_type: string
  shared_playlist_id: string | null
  created_at: string
  updated_at: string
}

// Schema: spotify_capsules
// Columns: id, space_id, user_id, spotify_track_id, track_name, artists, moment, description, saved_at, preview_url
export type SpotifyCapsule = {
  id: number
  space_id: number
  user_id: string
  spotify_track_id: string
  track_name: string
  artists: string
  moment: string | null
  description: string | null
  saved_at: string | null
  preview_url: string | null
  created_at: string
  updated_at: string
}

// Schema: spotify_surprise_drops
// Columns: id, space_id, user_id, spotify_track_id, track_name, artists, scheduled_for, note, curator_name
export type SpotifySurpriseDrop = {
  id: number
  space_id: number
  user_id: string
  spotify_track_id: string
  track_name: string
  artists: string
  scheduled_for: string
  note: string | null
  curator_name: string | null
  created_at: string
  updated_at: string
}

// Schema: listening_plans
// Columns: id, space_id, user_id, title, description, scheduled_at, spotify_playlist_id
export type SpotifyListeningPlan = {
  id: number
  space_id: number
  user_id: string
  title: string
  description: string | null
  scheduled_at: string | null
  spotify_playlist_id: string | null
  created_at: string
  updated_at: string
}

type UseSpotifyReturn = {
  token: SpotifyToken | null
  capsules: SpotifyCapsule[]
  surpriseDrops: SpotifySurpriseDrop[]
  listeningPlans: SpotifyListeningPlan[]
  loading: boolean
  error: string | null
  getAccessToken: (spaceId: number) => Promise<string | null>
  connectSpotify: (spaceId: number) => Promise<{ error?: string; url?: string }>
  disconnectSpotify: (spaceId: number) => Promise<{ error?: string }>
  fetchCapsules: (spaceId: number) => Promise<void>
  createCapsule: (data: {
    space_id: number
    spotify_track_id: string
    track_name: string
    artists: string
    moment?: string
    description?: string
    saved_at?: string
    preview_url?: string
  }) => Promise<{ error?: string; capsule?: SpotifyCapsule }>
  deleteCapsule: (id: number) => Promise<{ error?: string }>
  fetchSurpriseDrops: (spaceId: number) => Promise<void>
  createSurpriseDrop: (data: {
    space_id: number
    spotify_track_id: string
    track_name: string
    artists: string
    scheduled_for: string
    note?: string
    curator_name?: string
  }) => Promise<{ error?: string; drop?: SpotifySurpriseDrop }>
  deleteSurpriseDrop: (id: number) => Promise<{ error?: string }>
  fetchListeningPlans: (spaceId: number) => Promise<void>
  createListeningPlan: (data: {
    space_id: number
    title: string
    description?: string
    spotify_playlist_id?: string
    scheduled_at?: string
  }) => Promise<{ error?: string; plan?: SpotifyListeningPlan }>
  deleteListeningPlan: (id: number) => Promise<{ error?: string }>
}

export function useSpotify(): UseSpotifyReturn {
  const [token, setToken] = useState<SpotifyToken | null>(null)
  const [capsules, setCapsules] = useState<SpotifyCapsule[]>([])
  const [surpriseDrops, setSurpriseDrops] = useState<SpotifySurpriseDrop[]>([])
  const [listeningPlans, setListeningPlans] = useState<SpotifyListeningPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const getAccessToken = useCallback(async (spaceId: number): Promise<string | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('space_id', spaceId)
        .single()

      if (fetchError || !data) return null

      // Check if token is expired
      if (new Date(data.expires_at) < new Date()) {
        // Try refresh via API route
        const refreshResponse = await fetch('/api/spotify/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: data.refresh_token }),
        })

        if (!refreshResponse.ok) return null

        const refreshed = await refreshResponse.json()
        const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

        await supabase
          .from('spotify_tokens')
          .update({
            access_token: refreshed.access_token,
            expires_in: refreshed.expires_in,
            expires_at: newExpiresAt,
          })
          .eq('id', data.id)

        const updatedToken = { ...data, access_token: refreshed.access_token, expires_at: newExpiresAt }
        setToken(updatedToken)
        return refreshed.access_token
      }

      setToken(data)
      return data.access_token
    } catch {
      return null
    }
  }, [supabase])

  const connectSpotify = useCallback(async (spaceId: number) => {
    try {
      const response = await fetch(`/api/spotify/auth?space_id=${spaceId}`)
      const { url } = await response.json()
      if (!url) return { error: 'Failed to get Spotify auth URL' }
      window.location.href = url
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect Spotify'
      setError(message)
      return { error: message }
    }
  }, [])

  const disconnectSpotify = useCallback(async (spaceId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('spotify_tokens')
        .delete()
        .eq('space_id', spaceId)

      if (deleteError) return { error: deleteError.message }

      setToken(null)
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect Spotify'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const fetchCapsules = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('spotify_capsules')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCapsules(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createCapsule = useCallback(async (data: {
    space_id: number
    spotify_track_id: string
    track_name: string
    artists: string
    moment?: string
    description?: string
    saved_at?: string
    preview_url?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: capsule, error: insertError } = await supabase
        .from('spotify_capsules')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          spotify_track_id: data.spotify_track_id,
          track_name: data.track_name,
          artists: data.artists,
          moment: data.moment || null,
          description: data.description || null,
          saved_at: data.saved_at || null,
          preview_url: data.preview_url || null,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setCapsules((prev) => [capsule, ...prev])
      return { capsule }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create capsule'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteCapsule = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('spotify_capsules')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setCapsules((prev) => prev.filter((c) => c.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete capsule'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const fetchSurpriseDrops = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('spotify_surprise_drops')
      .select('*')
      .eq('space_id', spaceId)
      .order('scheduled_for', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSurpriseDrops(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createSurpriseDrop = useCallback(async (data: {
    space_id: number
    spotify_track_id: string
    track_name: string
    artists: string
    scheduled_for: string
    note?: string
    curator_name?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: drop, error: insertError } = await supabase
        .from('spotify_surprise_drops')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          spotify_track_id: data.spotify_track_id,
          track_name: data.track_name,
          artists: data.artists,
          scheduled_for: data.scheduled_for,
          note: data.note || null,
          curator_name: data.curator_name || null,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setSurpriseDrops((prev) => [...prev, drop].sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()))
      return { drop }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create surprise drop'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteSurpriseDrop = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('spotify_surprise_drops')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setSurpriseDrops((prev) => prev.filter((d) => d.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete surprise drop'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const fetchListeningPlans = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('listening_plans')
      .select('*')
      .eq('space_id', spaceId)
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setListeningPlans(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createListeningPlan = useCallback(async (data: {
    space_id: number
    title: string
    description?: string
    spotify_playlist_id?: string
    scheduled_at?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: plan, error: insertError } = await supabase
        .from('listening_plans')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          spotify_playlist_id: data.spotify_playlist_id || null,
          scheduled_at: data.scheduled_at || null,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setListeningPlans((prev) => [plan, ...prev])
      return { plan }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create listening plan'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteListeningPlan = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('listening_plans')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setListeningPlans((prev) => prev.filter((p) => p.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete listening plan'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  return {
    token,
    capsules,
    surpriseDrops,
    listeningPlans,
    loading,
    error,
    getAccessToken,
    connectSpotify,
    disconnectSpotify,
    fetchCapsules,
    createCapsule,
    deleteCapsule,
    fetchSurpriseDrops,
    createSurpriseDrop,
    deleteSurpriseDrop,
    fetchListeningPlans,
    createListeningPlan,
    deleteListeningPlan,
  }
}
