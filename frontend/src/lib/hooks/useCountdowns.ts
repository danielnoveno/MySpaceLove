'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: countdowns table
// Columns: id, space_id, event_name (NOT name), event_date (NOT date), description, image, activities (JSONB), created_at, updated_at
// NOTE: No user/author column — countdowns are space-level

export type Countdown = {
  id: number
  space_id: number
  event_name: string
  event_date: string
  description: string | null
  image: string | null
  activities: unknown
  created_at: string
  updated_at: string
}

type UseCountdownsReturn = {
  countdowns: Countdown[]
  loading: boolean
  error: string | null
  fetchCountdowns: (spaceId: number) => Promise<void>
  createCountdown: (data: {
    space_id: number
    event_name: string
    event_date: string
    description?: string
    activities?: unknown
  }) => Promise<{ error?: string; countdown?: Countdown }>
  deleteCountdown: (id: number) => Promise<{ error?: string }>
}

export function useCountdowns(): UseCountdownsReturn {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchCountdowns = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('countdowns')
      .select('*')
      .eq('space_id', spaceId)
      .order('event_date', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCountdowns(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createCountdown = useCallback(async (data: {
    space_id: number
    event_name: string
    event_date: string
    description?: string
    activities?: unknown
  }) => {
    try {
      const { data: countdown, error: insertError } = await supabase
        .from('countdowns')
        .insert({
          space_id: data.space_id,
          event_name: data.event_name,
          event_date: data.event_date,
          description: data.description || null,
          activities: data.activities || null,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setCountdowns((prev) => [...prev, countdown].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()))
      return { countdown }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create countdown'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteCountdown = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('countdowns')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setCountdowns((prev) => prev.filter((c) => c.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete countdown'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  return {
    countdowns,
    loading,
    error,
    fetchCountdowns,
    createCountdown,
    deleteCountdown,
  }
}
