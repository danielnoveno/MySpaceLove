'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: surprise_notes table
// Columns: id, space_id, user_id (NOT created_by), title, message, unlock_date, created_at, updated_at

export type SurpriseNote = {
  id: number
  space_id: number
  user_id: string
  title: string | null
  message: string
  unlock_date: string
  created_at: string
  updated_at: string
}

type UseSurpriseNotesReturn = {
  notes: SurpriseNote[]
  loading: boolean
  error: string | null
  fetchNotes: (spaceId: number) => Promise<void>
  createNote: (data: {
    space_id: number
    title?: string
    message: string
    unlock_date: string
  }) => Promise<{ error?: string; note?: SurpriseNote }>
  deleteNote: (id: number) => Promise<{ error?: string }>
  isUnlocked: (unlockDate: string) => boolean
}

export function useSurpriseNotes(): UseSurpriseNotesReturn {
  const [notes, setNotes] = useState<SurpriseNote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchNotes = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('surprise_notes')
      .select('*')
      .eq('space_id', spaceId)
      .order('unlock_date', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setNotes(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createNote = useCallback(async (data: {
    space_id: number
    title?: string
    message: string
    unlock_date: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: note, error: insertError } = await supabase
        .from('surprise_notes')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          title: data.title || null,
          message: data.message,
          unlock_date: data.unlock_date,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setNotes((prev) => [...prev, note].sort((a, b) => new Date(a.unlock_date).getTime() - new Date(b.unlock_date).getTime()))
      return { note }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteNote = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('surprise_notes')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setNotes((prev) => prev.filter((n) => n.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const isUnlocked = useCallback((unlockDate: string): boolean => {
    return new Date() >= new Date(unlockDate)
  }, [])

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    deleteNote,
    isUnlocked,
  }
}
