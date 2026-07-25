'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: games table
// Columns: id, slug, name, description, is_enabled, supports_multiplayer, created_at, updated_at
export type Game = {
  id: number
  slug: string
  name: string
  description: string | null
  is_enabled: boolean
  supports_multiplayer: boolean
  created_at: string
  updated_at: string
}

// Schema: game_scores table
// Columns: id, game_id (FK to games, NOT game_slug), user_id (NOT player_id), space_id, score, meta (JSONB), created_at, updated_at
export type GameScore = {
  id: number
  game_id: number
  user_id: string
  space_id: number
  score: number
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
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
  const supabase = useMemo(() => createClient(), [])

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

    // First look up the game_id from the slug
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('id')
      .eq('slug', gameSlug)
      .single()

    if (gameError || !gameData) {
      setError(gameError?.message || 'Game not found')
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('game_scores')
      .select('*')
      .eq('space_id', spaceId)
      .eq('game_id', gameData.id)
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

      // Look up game_id from slug
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('slug', data.game_slug)
        .single()

      if (gameError || !gameData) return { error: 'Game not found' }

      const { data: score, error: insertError } = await supabase
        .from('game_scores')
        .insert({
          game_id: gameData.id,
          user_id: user.id,
          space_id: data.space_id,
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
