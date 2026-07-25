'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Countdown = {
  id: number
  space_id: number
  name: string
  date: string
  description: string | null
  activities: string[] | null
  created_by: string
  created_at: string
}

type UseCountdownsReturn = {
  countdowns: Countdown[]
  loading: boolean
  error: string | null
  fetchCountdowns: (spaceId: number) => Promise<void>
  createCountdown: (data: {
    space_id: number
    name: string
    date: string
    description?: string
    activities?: string[]
  }) => Promise<{ error?: string; countdown?: Countdown }>
  deleteCountdown: (id: number) => Promise<{ error?: string }>
}

export function useCountdowns(): UseCountdownsReturn {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCountdowns = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('countdowns')
      .select('*')
      .eq('space_id', spaceId)
      .order('date', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCountdowns(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createCountdown = useCallback(async (data: {
    space_id: number
    name: string
    date: string
    description?: string
    activities?: string[]
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: countdown, error: insertError } = await supabase
        .from('countdowns')
        .insert({
          space_id: data.space_id,
          name: data.name,
          date: data.date,
          description: data.description || null,
          activities: data.activities || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setCountdowns((prev) => [...prev, countdown].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
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
