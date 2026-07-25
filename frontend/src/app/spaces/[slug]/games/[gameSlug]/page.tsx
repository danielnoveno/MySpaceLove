'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'

const GAMES_CONFIG: Record<string, { name: string; icon: string }> = {
  tetris: { name: 'Tetris', icon: '🧱' },
  snake: { name: 'Snake', icon: '🐍' },
  memory: { name: 'Memory Match', icon: '🧠' },
  'tic-tac-toe': { name: 'Tic Tac Toe', icon: '⭕' },
  2048: { name: '2048', icon: '🔢' },
  sudoku: { name: 'Sudoku', icon: '📊' },
}

// Snake Game Component
function SnakeGame({ onScore }: { onScore: (score: number) => void }) {
  const [board, setBoard] = useState<number[][]>([])
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const BOARD_SIZE = 20

  const generateFood = useCallback(() => {
    let pos = { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) }
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
        <span className="text-lg font-bold text-pink-600">Score: {score}</span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div
        className="grid gap-0 bg-gray-100 rounded-xl p-2"
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
                  ? 'bg-pink-500 rounded-sm'
                  : isSnake
                  ? 'bg-pink-400 rounded-sm'
                  : isFood
                  ? 'bg-red-500 rounded-full'
                  : 'bg-white'
              }`}
            />
          )
        })}
      </div>
      {gameOver && (
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">Game Over!</p>
          <p className="text-gray-600">Final Score: {score}</p>
        </div>
      )}
      <p className="text-xs text-gray-400">Use arrow keys to move</p>
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
        <span className="text-lg font-bold text-pink-600">
          {winner ? `${winner} wins!` : isDraw ? "It's a draw!" : `${isXNext ? 'X' : 'O'}'s turn`}
        </span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`w-20 h-20 rounded-xl text-3xl font-bold transition-all ${
              cell === 'X'
                ? 'bg-pink-500 text-white'
                : cell === 'O'
                ? 'bg-purple-500 text-white'
                : 'bg-white/80 hover:bg-pink-50 text-gray-900'
            } border border-pink-100`}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  )
}

// Memory Match Component
function MemoryGame({ onScore }: { onScore: (score: number) => void }) {
  const symbols = ['❤️', '💕', '🌸', '🦋', '🌙', '⭐', '🎀', '💎']
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    const doubled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({ id: idx, symbol, flipped: false, matched: false }))
    setCards(doubled)
  }, [])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      if (cards[first].symbol === cards[second].symbol) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, matched: true } : c
          )
        )
      }
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second && !c.matched ? { ...c, flipped: false } : c
          )
        )
        setFlippedCards([])
      }, 800)
      setMoves((m) => m + 1)
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
    const doubled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({ id: idx, symbol, flipped: false, matched: false }))
    setCards(doubled)
    setFlippedCards([])
    setMoves(0)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-pink-600">Moves: {moves}</span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-xl text-2xl transition-all ${
              card.flipped || card.matched
                ? 'bg-pink-100 scale-105'
                : 'bg-gradient-to-br from-pink-400 to-purple-500 hover:scale-105'
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
      <p className="text-lg font-bold text-pink-600">Score: {score}</p>
      <button
        onClick={incrementScore}
        className="px-6 py-3 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
      >
        Click to Score!
      </button>
      <p className="text-sm text-gray-500">Full {gameSlug} game coming soon!</p>
    </div>
  )
}

export default function GamePlayPage() {
  const params = useParams()
  const slug = params.slug as string
  const gameSlug = params.gameSlug as string
  const { user, loading: authLoading } = useAuth()
  const [bestScore, setBestScore] = useState(0)
  const supabase = createClient()

  const gameConfig = GAMES_CONFIG[gameSlug] || { name: gameSlug, icon: '🎮' }

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
      default:
        return <GenericGame gameSlug={gameSlug} />
    }
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <Link
            href={`/spaces/${slug}/games`}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{gameConfig.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{gameConfig.name}</h1>
              {bestScore > 0 && (
                <div className="flex items-center gap-1 text-sm text-pink-600">
                  <Trophy className="h-3 w-3" /> Best: {bestScore}
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex justify-center py-8">{renderGame()}</div>
    </AuthenticatedLayout>
  )
}
