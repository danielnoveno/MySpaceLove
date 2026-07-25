'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Gamepad2, Trophy, Play, ArrowLeft } from 'lucide-react'

type Game = {
  slug: string
  name: string
  description: string
  icon: string
}

type Score = {
  id: number
  game_slug: string
  score: number
  user_id: string
  created_at: string
}

const GAMES: Game[] = [
  {
    slug: 'tetris',
    name: 'Tetris',
    description: 'Classic block-stacking puzzle game',
    icon: '🧱',
  },
  {
    slug: 'snake',
    name: 'Snake',
    description: 'Guide the snake to eat food and grow',
    icon: '🐍',
  },
  {
    slug: 'memory',
    name: 'Memory Match',
    description: 'Find matching pairs of cards',
    icon: '🧠',
  },
  {
    slug: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic X and O strategy game',
    icon: '⭕',
  },
  {
    slug: '2048',
    name: '2048',
    description: 'Slide tiles to reach 2048',
    icon: '🔢',
  },
  {
    slug: 'sudoku',
    name: 'Sudoku',
    description: 'Fill the grid with numbers 1-9',
    icon: '📊',
  },
]

export default function GamesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) fetchScores()
  }, [user, authLoading])

  const fetchScores = async () => {
    const { data } = await supabase
      .from('game_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(50)

    if (data) setScores(data)
    setLoading(false)
  }

  const getTopScores = (gameSlug: string) => {
    return scores
      .filter((s) => s.game_slug === gameSlug)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <Link
            href={`/spaces/${slug}`}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Games</h1>
            <p className="text-gray-600">Play fun games together</p>
          </div>
        </div>
      }
    >
      {/* Games Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const topScores = getTopScores(game.slug)
          return (
            <div
              key={game.slug}
              className="group rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-3xl">
                  {game.icon}
                </div>
                <Link
                  href={`/spaces/${slug}/games/${game.slug}`}
                  className="flex items-center gap-1 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
                >
                  <Play className="h-4 w-4" />
                  Play
                </Link>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                {game.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{game.description}</p>

              {/* Leaderboard */}
              {topScores.length > 0 && (
                <div className="mt-4 border-t border-pink-50 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Top Scores
                    </span>
                  </div>
                  <div className="space-y-1">
                    {topScores.map((score, idx) => (
                      <div
                        key={score.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {idx + 1}. {score.user_id === user?.id ? 'You' : 'Partner'}
                        </span>
                        <span className="font-medium text-pink-600">{score.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AuthenticatedLayout>
  )
}
