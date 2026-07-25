'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type NobarSession = {
  id: number
  space_id: number
  title: string
  date: string
  platform: string | null
  notes: string | null
  created_by: string
  created_at: string
  participants: string[]
}

type UseNobarReturn = {
  sessions: NobarSession[]
  loading: boolean
  error: string | null
  fetchSessions: (spaceId: number) => Promise<void>
  createSession: (data: {
    space_id: number
    title: string
    date: string
    platform?: string
    notes?: string
  }) => Promise<{ error?: string; session?: NobarSession }>
  joinSession: (sessionId: number) => Promise<{ error?: string }>
  leaveSession: (sessionId: number) => Promise<{ error?: string }>
  deleteSession: (id: number) => Promise<{ error?: string }>
  subscribeToSession: (sessionId: number, callback?: (session: NobarSession) => void) => void
  unsubscribeFromSession: () => void
}

export function useNobar(): UseNobarReturn {
  const [sessions, setSessions] = useState<NobarSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

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
      .from('nobar_sessions')
      .select('*')
      .eq('space_id', spaceId)
      .order('date', { ascending: false })

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
    date: string
    platform?: string
    notes?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: session, error: insertError } = await supabase
        .from('nobar_sessions')
        .insert({
          space_id: data.space_id,
          title: data.title,
          date: data.date,
          platform: data.platform || null,
          notes: data.notes || null,
          created_by: user.id,
          participants: [user.id],
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setSessions((prev) => [session, ...prev])
      return { session }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const joinSession = useCallback(async (sessionId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const session = sessions.find((s) => s.id === sessionId)
      if (!session) return { error: 'Session not found' }

      if (session.participants?.includes(user.id)) {
        return { error: 'Already joined' }
      }

      const updatedParticipants = [...(session.participants || []), user.id]

      const { error: updateError } = await supabase
        .from('nobar_sessions')
        .update({ participants: updatedParticipants })
        .eq('id', sessionId)

      if (updateError) return { error: updateError.message }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, participants: updatedParticipants } : s
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join session'
      setError(message)
      return { error: message }
    }
  }, [sessions, supabase])

  const leaveSession = useCallback(async (sessionId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const session = sessions.find((s) => s.id === sessionId)
      if (!session) return { error: 'Session not found' }

      const updatedParticipants = (session.participants || []).filter((id) => id !== user.id)

      const { error: updateError } = await supabase
        .from('nobar_sessions')
        .update({ participants: updatedParticipants })
        .eq('id', sessionId)

      if (updateError) return { error: updateError.message }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, participants: updatedParticipants } : s
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave session'
      setError(message)
      return { error: message }
    }
  }, [sessions, supabase])

  const deleteSession = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('nobar_sessions')
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

  const subscribeToSession = useCallback((sessionId: number, callback?: (session: NobarSession) => void) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    channelRef.current = supabase
      .channel(`nobar-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'nobar_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updatedSession = payload.new as NobarSession
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? updatedSession : s))
          )
          callback?.(updatedSession)
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
    subscribeToSession,
    unsubscribeFromSession,
  }
}
