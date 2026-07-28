'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import { Gamepad2, Trophy, Play, ArrowLeft, Zap, Target, Brain, Hash, Grid3X3, Puzzle } from 'lucide-react'

type Game = {
  slug: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
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
    description: 'Susun balok klasik yang seru',
    icon: <Grid3X3 className="h-6 w-6" />,
    color: 'bg-brand-50 text-brand-500',
  },
  {
    slug: 'snake',
    name: 'Snake',
    description: 'Ular lapar yang harus kamu kendalikan',
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-coral-50 text-coral-500',
  },
  {
    slug: 'memory',
    name: 'Memory Match',
    description: 'Temukan pasangan kartu yang cocok',
    icon: <Brain className="h-6 w-6" />,
    color: 'bg-warm-100 text-warm-600',
  },
  {
    slug: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Permainan strategi X dan O',
    icon: <Target className="h-6 w-6" />,
    color: 'bg-brand-50 text-brand-400',
  },
  {
    slug: '2048',
    name: '2048',
    description: 'Geser angka untuk mencapai 2048',
    icon: <Hash className="h-6 w-6" />,
    color: 'bg-coral-50 text-coral-400',
  },
  {
    slug: 'sudoku',
    name: 'Sudoku',
    description: 'Isi grid dengan angka 1-9',
    icon: <Puzzle className="h-6 w-6" />,
    color: 'bg-warm-100 text-warm-500',
  },
]

export default function GamesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchScores = useCallback(async () => {
    const { data } = await supabase
      .from('game_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(50)

    if (data) setScores(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) {
      const timeout = setTimeout(fetchScores, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, fetchScores])

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
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <Gamepad2 className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">Permainan</h1>
              <p className="text-warm-500">Main seru bersama pasangan</p>
            </div>
          </div>
        </FadeIn>
      }
    >
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const topScores = getTopScores(game.slug)
          return (
            <StaggerItem key={game.slug}>
              <div className="group rounded-3xl bg-white border border-warm-100 p-6 transition-all hover:shadow-xl hover:shadow-warm-900/5 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${game.color} transition-transform group-hover:scale-110`}>
                    {game.icon}
                  </div>
                  <Link
                    href={`/spaces/${slug}/games/${game.slug}`}
                    className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
                  >
                    <Play className="h-4 w-4" />
                    Main
                  </Link>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-warm-900 group-hover:text-brand-600 transition-colors">
                  {game.name}
                </h3>
                <p className="mt-1 text-sm text-warm-500">{game.description}</p>

                {/* Leaderboard */}
                {topScores.length > 0 && (
                  <div className="mt-4 border-t border-warm-100 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-coral-400" />
                      <span className="text-xs font-medium text-warm-400 uppercase tracking-wide">
                        Skor Tertinggi
                      </span>
                    </div>
                    <div className="space-y-1">
                      {topScores.map((score, idx) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-warm-600">
                            {idx + 1}. {score.user_id === user?.id ? 'Anda' : 'Pasangan'}
                          </span>
                          <span className="font-medium text-brand-500">{score.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    </AuthenticatedLayout>
  )
}
