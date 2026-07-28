'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn } from '@/components/motion'
import { ArrowLeft, RotateCcw, Trophy, Grid3X3, Zap, Brain, Target, Hash, Puzzle } from 'lucide-react'
import Tetris from '@/components/games/Tetris'
import Game2048 from '@/components/games/Game2048'
import Sudoku from '@/components/games/Sudoku'

const GAMES_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  tetris: { name: 'Tetris', icon: <Grid3X3 className="h-6 w-6" />, color: 'bg-brand-50 text-brand-500' },
  snake: { name: 'Snake', icon: <Zap className="h-6 w-6" />, color: 'bg-coral-50 text-coral-500' },
  memory: { name: 'Memory Match', icon: <Brain className="h-6 w-6" />, color: 'bg-warm-100 text-warm-600' },
  'tic-tac-toe': { name: 'Tic Tac Toe', icon: <Target className="h-6 w-6" />, color: 'bg-brand-50 text-brand-400' },
  '2048': { name: '2048', icon: <Hash className="h-6 w-6" />, color: 'bg-coral-50 text-coral-400' },
  sudoku: { name: 'Sudoku', icon: <Puzzle className="h-6 w-6" />, color: 'bg-warm-100 text-warm-500' },
}

// Snake Game Component
function SnakeGame({ onScore }: { onScore: (score: number) => void }) {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const BOARD_SIZE = 20

  const generateFood = useCallback(() => {
    const pos = { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) }
    return pos
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [direction])

  useEffect(() => {
    if (gameOver) return

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] }
        switch (direction) {
          case 'UP': head.y--; break
          case 'DOWN': head.y++; break
          case 'LEFT': head.x--; break
          case 'RIGHT': head.x++; break
        }

        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameOver(true)
          onScore(score)
          return prev
        }

        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true)
          onScore(score)
          return prev
        }

        const newSnake = [head, ...prev]
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10)
          setFood(generateFood())
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, 150)

    return () => clearInterval(interval)
  }, [direction, food, gameOver, score, onScore, generateFood])

  const reset = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection('RIGHT')
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-brand-600">Skor: {score}</span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-warm-500 hover:text-brand-600 transition-colors">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div
        className="grid gap-0 bg-warm-50 rounded-2xl p-2 border border-warm-100"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
          const x = idx % BOARD_SIZE
          const y = Math.floor(idx / BOARD_SIZE)
          const isSnake = snake.some((s) => s.x === x && s.y === y)
          const isHead = snake[0]?.x === x && snake[0]?.y === y
          const isFood = food.x === x && food.y === y
          return (
            <div
              key={idx}
              className={`w-4 h-4 ${
                isHead
                  ? 'bg-brand-500 rounded-sm'
                  : isSnake
                  ? 'bg-brand-400 rounded-sm'
                  : isFood
                  ? 'bg-coral-500 rounded-full'
                  : 'bg-white'
              }`}
            />
          )
        })}
      </div>
      {gameOver && (
        <div className="text-center">
          <p className="text-lg font-bold text-coral-500">Game Over!</p>
          <p className="text-warm-500">Skor Akhir: {score}</p>
        </div>
      )}
      <p className="text-xs text-warm-400">Gunakan tombol panah untuk bergerak</p>
    </div>
  )
}

// Tic Tac Toe Component
function TicTacToeGame({ onScore }: { onScore: (score: number) => void }) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (idx: number) => {
    if (board[idx] || checkWinner(board)) return
    const newBoard = [...board]
    newBoard[idx] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)

    const winner = checkWinner(newBoard)
    if (winner) onScore(winner === 'X' ? 100 : 0)
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
  }

  const winner = checkWinner(board)
  const isDraw = !winner && board.every((c) => c !== null)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-brand-600">
          {winner ? `${winner} menang!` : isDraw ? 'Seri!' : `Giliran ${isXNext ? 'X' : 'O'}`}
        </span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-warm-500 hover:text-brand-600 transition-colors">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`w-20 h-20 rounded-2xl text-3xl font-bold transition-all ${
              cell === 'X'
                ? 'bg-brand-500 text-white'
                : cell === 'O'
                ? 'bg-coral-500 text-white'
                : 'bg-white hover:bg-brand-50 text-warm-900'
            } border border-warm-100`}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  )
}

const MEMORY_SYMBOLS = ['❤️', '💕', '🌸', '🦋', '🌙', '⭐', '🎀', '💎']

// Memory Match Component
function MemoryGame({ onScore }: { onScore: (score: number) => void }) {
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const doubled = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
        .sort(() => Math.random() - 0.5)
        .map((symbol, idx) => ({ id: idx, symbol, flipped: false, matched: false }))
      setCards(doubled)
    }, 0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const timeout = setTimeout(() => {
        const isMatch = cards[first].symbol === cards[second].symbol
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second
              ? isMatch
                ? { ...c, matched: true }
                : { ...c, flipped: false }
              : c
          )
        )
        setFlippedCards([])
        setMoves((m) => m + 1)
      }, 800)
      return () => clearTimeout(timeout)
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      onScore(Math.max(0, 1000 - moves * 10))
    }
  }, [cards, moves, onScore])

  const handleFlip = (idx: number) => {
    if (flippedCards.length >= 2 || cards[idx].flipped || cards[idx].matched) return
    setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, flipped: true } : c)))
    setFlippedCards((prev) => [...prev, idx])
  }

  const reset = () => {
    const doubled = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({ id: idx, symbol, flipped: false, matched: false }))
    setCards(doubled)
    setFlippedCards([])
    setMoves(0)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-brand-600">Langkah: {moves}</span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-warm-500 hover:text-brand-600 transition-colors">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-2xl text-2xl transition-all ${
              card.flipped || card.matched
                ? 'bg-brand-50 scale-105'
                : 'bg-gradient-to-br from-brand-400 to-coral-500 hover:scale-105'
            } flex items-center justify-center`}
          >
            {card.flipped || card.matched ? card.symbol : '❓'}
          </button>
        ))}
      </div>
    </div>
  )
}

// Generic game placeholder
function GenericGame({ gameSlug }: { gameSlug: string }) {
  const [score, setScore] = useState(0)

  const incrementScore = () => setScore((s) => s + 10)

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-bold text-brand-600">Skor: {score}</p>
      <button
        onClick={incrementScore}
        className="px-6 py-3 bg-brand-500 text-white rounded-full font-semibold hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
      >
        Klik untuk Skor!
      </button>
      <p className="text-sm text-warm-500">Permainan {gameSlug} segera hadir!</p>
    </div>
  )
}

export default function GamePlayPage() {
  const params = useParams()
  const slug = params.slug as string
  const gameSlug = params.gameSlug as string
  const { user } = useAuth()
  const [bestScore, setBestScore] = useState(0)
  const supabase = createClient()

  const gameConfig = GAMES_CONFIG[gameSlug] || { name: gameSlug, icon: <div className="h-6 w-6" />, color: 'bg-warm-100 text-warm-500' }

  const handleScore = useCallback(
    async (score: number) => {
      if (!user || score <= bestScore) return

      setBestScore(score)
      await supabase.from('game_scores').insert({
        game_slug: gameSlug,
        score,
        user_id: user.id,
      })
    },
    [user, gameSlug, bestScore, supabase]
  )

  const renderGame = () => {
    switch (gameSlug) {
      case 'snake':
        return <SnakeGame onScore={handleScore} />
      case 'tic-tac-toe':
        return <TicTacToeGame onScore={handleScore} />
      case 'memory':
        return <MemoryGame onScore={handleScore} />
      case 'tetris':
        return <Tetris onScore={handleScore} />
      case '2048':
        return <Game2048 onScore={handleScore} />
      case 'sudoku':
        return <Sudoku onScore={handleScore} />
      default:
        return <GenericGame gameSlug={gameSlug} />
    }
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}/games`}
              className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${gameConfig.color}`}>
              {gameConfig.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">{gameConfig.name}</h1>
              {bestScore > 0 && (
                <div className="flex items-center gap-1 text-sm text-brand-500 font-medium">
                  <Trophy className="h-3 w-3" /> Terbaik: {bestScore}
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      }
    >
      <div className="flex justify-center py-8">{renderGame()}</div>
    </AuthenticatedLayout>
  )
}
