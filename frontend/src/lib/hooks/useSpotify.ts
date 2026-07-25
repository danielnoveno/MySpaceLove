'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SpotifyCapsule = {
  id: number
  space_id: number
  title: string
  description: string | null
  playlist_url: string
  cover_image: string | null
  created_by: string
  created_at: string
}

export type SpotifySurpriseDrop = {
  id: number
  space_id: number
  title: string
  message: string | null
  playlist_url: string
  unlock_date: string
  created_by: string
  created_at: string
}

export type SpotifyListeningPlan = {
  id: number
  space_id: number
  title: string
  description: string | null
  playlist_url: string
  scheduled_date: string | null
  created_by: string
  created_at: string
}

export type SpotifyConnection = {
  id: number
  space_id: number
  access_token: string
  refresh_token: string
  expires_at: string
  spotify_user_id: string | null
  display_name: string | null
  connected_at: string
}

type UseSpotifyReturn = {
  connection: SpotifyConnection | null
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
    title: string
    description?: string
    playlist_url: string
    cover_image?: string
  }) => Promise<{ error?: string; capsule?: SpotifyCapsule }>
  deleteCapsule: (id: number) => Promise<{ error?: string }>
  fetchSurpriseDrops: (spaceId: number) => Promise<void>
  createSurpriseDrop: (data: {
    space_id: number
    title: string
    message?: string
    playlist_url: string
    unlock_date: string
  }) => Promise<{ error?: string; drop?: SpotifySurpriseDrop }>
  deleteSurpriseDrop: (id: number) => Promise<{ error?: string }>
  fetchListeningPlans: (spaceId: number) => Promise<void>
  createListeningPlan: (data: {
    space_id: number
    title: string
    description?: string
    playlist_url: string
    scheduled_date?: string
  }) => Promise<{ error?: string; plan?: SpotifyListeningPlan }>
  deleteListeningPlan: (id: number) => Promise<{ error?: string }>
}

export function useSpotify(): UseSpotifyReturn {
  const [connection, setConnection] = useState<SpotifyConnection | null>(null)
  const [capsules, setCapsules] = useState<SpotifyCapsule[]>([])
  const [surpriseDrops, setSurpriseDrops] = useState<SpotifySurpriseDrop[]>([])
  const [listeningPlans, setListeningPlans] = useState<SpotifyListeningPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const getAccessToken = useCallback(async (spaceId: number): Promise<string | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('spotify_connections')
        .select('*')
        .eq('space_id', spaceId)
        .single()

      if (fetchError || !data) return null

      if (new Date(data.expires_at) < new Date()) {
        const refreshResponse = await fetch('/api/spotify/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: data.refresh_token }),
        })

        if (!refreshResponse.ok) return null

        const refreshed = await refreshResponse.json()
        await supabase
          .from('spotify_connections')
          .update({
            access_token: refreshed.access_token,
            expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          })
          .eq('id', data.id)

        setConnection({ ...data, access_token: refreshed.access_token, expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString() })
        return refreshed.access_token
      }

      setConnection(data)
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
        .from('spotify_connections')
        .delete()
        .eq('space_id', spaceId)

      if (deleteError) return { error: deleteError.message }

      setConnection(null)
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
    title: string
    description?: string
    playlist_url: string
    cover_image?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: capsule, error: insertError } = await supabase
        .from('spotify_capsules')
        .insert({
          space_id: data.space_id,
          title: data.title,
          description: data.description || null,
          playlist_url: data.playlist_url,
          cover_image: data.cover_image || null,
          created_by: user.id,
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
      .order('unlock_date', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSurpriseDrops(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createSurpriseDrop = useCallback(async (data: {
    space_id: number
    title: string
    message?: string
    playlist_url: string
    unlock_date: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: drop, error: insertError } = await supabase
        .from('spotify_surprise_drops')
        .insert({
          space_id: data.space_id,
          title: data.title,
          message: data.message || null,
          playlist_url: data.playlist_url,
          unlock_date: data.unlock_date,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setSurpriseDrops((prev) => [...prev, drop].sort((a, b) => new Date(a.unlock_date).getTime() - new Date(b.unlock_date).getTime()))
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
      .from('spotify_listening_plans')
      .select('*')
      .eq('space_id', spaceId)
      .order('scheduled_date', { ascending: true })

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
    playlist_url: string
    scheduled_date?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: plan, error: insertError } = await supabase
        .from('spotify_listening_plans')
        .insert({
          space_id: data.space_id,
          title: data.title,
          description: data.description || null,
          playlist_url: data.playlist_url,
          scheduled_date: data.scheduled_date || null,
          created_by: user.id,
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
        .from('spotify_listening_plans')
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
    connection,
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
