'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Game = {
  id: number
  slug: string
  name: string
  description: string | null
  thumbnail_url: string | null
  created_at: string
}

export type GameScore = {
  id: number
  space_id: number
  game_slug: string
  player_id: string
  score: number
  created_at: string
}

type UseGamesReturn = {
  games: Game[]
  scores: GameScore[]
  loading: boolean
  error: string | null
  fetchGames: () => Promise<void>
  fetchScores: (spaceId: number, gameSlug: string) => Promise<void>
  submitScore: (data: {
    space_id: number
    game_slug: string
    score: number
  }) => Promise<{ error?: string; score?: GameScore }>
}

export function useGames(): UseGamesReturn {
  const [games, setGames] = useState<Game[]>([])
  const [scores, setScores] = useState<GameScore[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setGames(data || [])
    }
    setLoading(false)
  }, [supabase])

  const fetchScores = useCallback(async (spaceId: number, gameSlug: string) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('game_scores')
      .select('*')
      .eq('space_id', spaceId)
      .eq('game_slug', gameSlug)
      .order('score', { ascending: false })
      .limit(50)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setScores(data || [])
    }
    setLoading(false)
  }, [supabase])

  const submitScore = useCallback(async (data: {
    space_id: number
    game_slug: string
    score: number
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: score, error: insertError } = await supabase
        .from('game_scores')
        .insert({
          space_id: data.space_id,
          game_slug: data.game_slug,
          player_id: user.id,
          score: data.score,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setScores((prev) => [...prev, score].sort((a, b) => b.score - a.score))
      return { score }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit score'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  return {
    games,
    scores,
    loading,
    error,
    fetchGames,
    fetchScores,
    submitScore,
  }
}
