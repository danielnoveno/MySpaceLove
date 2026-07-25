'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// Schema: nobar_schedules table
// Columns: id, space_id, created_by, title, description, scheduled_for, platform, created_at, updated_at
// Schema: nobar_participants table
// Columns: id, space_id, user_id, display_name, is_host, audio_enabled, video_enabled, screen_sharing, status, last_seen_at, created_at, updated_at

export type NobarParticipant = {
  id: number
  space_id: number
  user_id: string
  display_name: string | null
  is_host: boolean
  audio_enabled: boolean
  video_enabled: boolean
  screen_sharing: boolean
  status: string
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export type NobarSession = {
  id: number
  space_id: number
  created_by: string | null
  title: string
  description: string | null
  scheduled_for: string
  platform: string | null
  created_at: string
  updated_at: string
  participants?: NobarParticipant[]
}

type UseNobarReturn = {
  sessions: NobarSession[]
  loading: boolean
  error: string | null
  fetchSessions: (spaceId: number) => Promise<void>
  createSession: (data: {
    space_id: number
    title: string
    scheduled_for: string
    platform?: string
    description?: string
  }) => Promise<{ error?: string; session?: NobarSession }>
  joinSession: (spaceId: number, sessionId: number) => Promise<{ error?: string }>
  leaveSession: (spaceId: number, sessionId: number) => Promise<{ error?: string }>
  deleteSession: (id: number) => Promise<{ error?: string }>
  fetchParticipants: (sessionId: number) => Promise<NobarParticipant[]>
  subscribeToSession: (spaceId: number, callback?: (session: NobarSession) => void) => void
  unsubscribeFromSession: () => void
}

export function useNobar(): UseNobarReturn {
  const [sessions, setSessions] = useState<NobarSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase])

  const fetchSessions = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('nobar_schedules')
      .select('*')
      .eq('space_id', spaceId)
      .order('scheduled_for', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createSession = useCallback(async (data: {
    space_id: number
    title: string
    scheduled_for: string
    platform?: string
    description?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: session, error: insertError } = await supabase
        .from('nobar_schedules')
        .insert({
          space_id: data.space_id,
          title: data.title,
          scheduled_for: data.scheduled_for,
          platform: data.platform || null,
          description: data.description || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      // Auto-join as host
      await supabase
        .from('nobar_participants')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          is_host: true,
          status: 'online',
        })

      setSessions((prev) => [session, ...prev])
      return { session }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const joinSession = useCallback(async (spaceId: number, sessionId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { error: upsertError } = await supabase
        .from('nobar_participants')
        .upsert({
          space_id: spaceId,
          user_id: user.id,
          status: 'online',
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'space_id,user_id' })

      if (upsertError) return { error: upsertError.message }
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join session'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const leaveSession = useCallback(async (_spaceId: number, _sessionId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { error: updateError } = await supabase
        .from('nobar_participants')
        .update({ status: 'offline', last_seen_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (updateError) return { error: updateError.message }
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave session'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteSession = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('nobar_schedules')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setSessions((prev) => prev.filter((s) => s.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const fetchParticipants = useCallback(async (sessionId: number): Promise<NobarParticipant[]> => {
    const { data, error: fetchError } = await supabase
      .from('nobar_participants')
      .select('*')
      .eq('space_id', sessionId)
      .order('created_at', { ascending: true })

    if (fetchError) return []
    return data || []
  }, [supabase])

  const subscribeToSession = useCallback((spaceId: number, callback?: (session: NobarSession) => void) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    channelRef.current = supabase
      .channel(`nobar-space-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nobar_schedules',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSession = payload.new as NobarSession
            setSessions((prev) => {
              if (prev.some((s) => s.id === newSession.id)) return prev
              return [newSession, ...prev]
            })
            callback?.(newSession)
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as NobarSession
            setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s))
            callback?.(updated)
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id: number }
            setSessions((prev) => prev.filter((s) => s.id !== old.id))
          }
        }
      )
      .subscribe()
  }, [supabase])

  const unsubscribeFromSession = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [supabase])

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    joinSession,
    leaveSession,
    deleteSession,
    fetchParticipants,
    subscribeToSession,
    unsubscribeFromSession,
  }
}
