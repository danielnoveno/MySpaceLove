'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: love_journals table
// Columns: id, space_id, user_id (NOT author_id), title, content, mood, created_at, updated_at

export type Journal = {
  id: number
  space_id: number
  user_id: string
  title: string
  content: string
  mood: string | null
  created_at: string
  updated_at: string
}

type UseJournalsReturn = {
  journals: Journal[]
  loading: boolean
  error: string | null
  fetchJournals: (spaceId: number) => Promise<void>
  createJournal: (data: {
    space_id: number
    title: string
    content: string
    mood?: string
  }) => Promise<{ error?: string; journal?: Journal }>
  updateJournal: (id: number, data: {
    title: string
    content: string
    mood?: string
  }) => Promise<{ error?: string }>
  deleteJournal: (id: number) => Promise<{ error?: string }>
}

export function useJournals(): UseJournalsReturn {
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchJournals = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('love_journals')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setJournals(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createJournal = useCallback(async (data: {
    space_id: number
    title: string
    content: string
    mood?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: journal, error: insertError } = await supabase
        .from('love_journals')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          title: data.title,
          content: data.content,
          mood: data.mood || null,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setJournals((prev) => [journal, ...prev])
      return { journal }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create journal'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const updateJournal = useCallback(async (id: number, data: {
    title: string
    content: string
    mood?: string
  }) => {
    try {
      const { error: updateError } = await supabase
        .from('love_journals')
        .update({
          title: data.title,
          content: data.content,
          mood: data.mood || null,
        })
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setJournals((prev) =>
        prev.map((j) =>
          j.id === id
            ? { ...j, title: data.title, content: data.content, mood: data.mood || null }
            : j
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update journal'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteJournal = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('love_journals')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setJournals((prev) => prev.filter((j) => j.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete journal'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  return {
    journals,
    loading,
    error,
    fetchJournals,
    createJournal,
    updateJournal,
    deleteJournal,
  }
}
