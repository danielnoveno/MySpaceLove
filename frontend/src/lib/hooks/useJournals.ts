'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Journal = {
  id: number
  space_id: number
  title: string
  content: string
  mood: string | null
  author_id: string
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
  const supabase = createClient()

  const fetchJournals = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('journals')
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
        .from('journals')
        .insert({
          space_id: data.space_id,
          title: data.title,
          content: data.content,
          mood: data.mood || null,
          author_id: user.id,
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
        .from('journals')
        .update({
          title: data.title,
          content: data.content,
          mood: data.mood || null,
          updated_at: new Date().toISOString(),
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
        .from('journals')
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
