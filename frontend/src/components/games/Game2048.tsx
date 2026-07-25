'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RotateCcw } from 'lucide-react'

const SIZE = 4

type Grid = number[][]

const TILE_COLORS: Record<number, string> = {
  0: 'bg-gray-700 text-transparent',
  2: 'bg-gray-600 text-gray-100',
  4: 'bg-gray-500 text-gray-100',
  8: 'bg-orange-700 text-white',
  16: 'bg-orange-600 text-white',
  32: 'bg-red-500 text-white',
  64: 'bg-red-600 text-white',
  128: 'bg-yellow-500 text-white',
  256: 'bg-yellow-400 text-gray-900',
  512: 'bg-amber-400 text-gray-900',
  1024: 'bg-amber-500 text-white',
  2048: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 text-white',
}

function createEmptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandomTile(grid: Grid): Grid {
  const empty: [number, number][] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empty.push([r, c])
    }
  }
  if (empty.length === 0) return grid
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const newGrid = grid.map((row) => [...row])
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4
  return newGrid
}

function slideRow(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter((v) => v !== 0)
  let score = 0
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2
      score += filtered[i]
      filtered.splice(i + 1, 1)
    }
  }
  while (filtered.length < SIZE) filtered.push(0)
  return { row: filtered, score }
}

function moveLeft(grid: Grid): { grid: Grid; score: number; moved: boolean } {
  let totalScore = 0
  let moved = false
  const newGrid = grid.map((row) => {
    const { row: newRow, score } = slideRow(row)
    if (newRow.some((v, i) => v !== row[i])) moved = true
    totalScore += score
    return newRow
  })
  return { grid: newGrid, score: totalScore, moved }
}

function rotateGrid(grid: Grid): Grid {
  const newGrid: Grid = createEmptyGrid()
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newGrid[c][SIZE - 1 - r] = grid[r][c]
    }
  }
  return newGrid
}

function canMove(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true
    }
  }
  return false
}

function hasWon(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] >= 2048) return true
    }
  }
  return false
}

export default function Game2048({ onScore }: { onScore: (score: number) => void }) {
  const [grid, setGrid] = useState<Grid>(() => {
    let g = createEmptyGrid()
    g = addRandomTile(g)
    g = addRandomTile(g)
    return g
  })
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [keepPlaying, setKeepPlaying] = useState(false)
  const gridRef = useRef(grid)
  const scoreRef = useRef(score)
  const gameOverRef = useRef(gameOver)
  const wonRef = useRef(won)
  const keepPlayingRef = useRef(keepPlaying)

  gridRef.current = grid
  scoreRef.current = score
  gameOverRef.current = gameOver
  wonRef.current = won
  keepPlayingRef.current = keepPlaying

  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (gameOverRef.current) return
      if (wonRef.current && !keepPlayingRef.current) return

      let rotatedGrid = gridRef.current.map((r) => [...r])
      let rotations = 0
      switch (direction) {
        case 'left': rotations = 0; break
        case 'down': rotations = 1; break
        case 'right': rotations = 2; break
        case 'up': rotations = 3; break
      }
      for (let i = 0; i < rotations; i++) rotatedGrid = rotateGrid(rotatedGrid)

      const { grid: movedGrid, score: gained, moved } = moveLeft(rotatedGrid)

      if (!moved) return

      let finalGrid = movedGrid
      for (let i = 0; i < (4 - rotations) % 4; i++) finalGrid = rotateGrid(finalGrid)

      const newScore = scoreRef.current + gained
      const newGrid = addRandomTile(finalGrid)

      setGrid(newGrid)
      setScore(newScore)
      if (newScore > best) setBest(newScore)

      if (hasWon(newGrid) && !wonRef.current && !keepPlayingRef.current) {
        setWon(true)
        onScore(newScore)
      }

      if (!canMove(newGrid)) {
        setGameOver(true)
        onScore(newScore)
      }
    },
    [best, onScore]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); move('left'); break
        case 'ArrowRight': e.preventDefault(); move('right'); break
        case 'ArrowUp': e.preventDefault(); move('up'); break
        case 'ArrowDown': e.preventDefault(); move('down'); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [move])

  // Touch support
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return
      const dx = e.changedTouches[0].clientX - touchStart.current.x
      const dy = e.changedTouches[0].clientY - touchStart.current.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (Math.max(absDx, absDy) < 30) return
      if (absDx > absDy) {
        move(dx > 0 ? 'right' : 'left')
      } else {
        move(dy > 0 ? 'down' : 'up')
      }
      touchStart.current = null
    }
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [move])

  const reset = () => {
    let g = createEmptyGrid()
    g = addRandomTile(g)
    g = addRandomTile(g)
    setGrid(g)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setKeepPlaying(false)
  }

  const getTileColor = (value: number) => {
    return TILE_COLORS[value] || 'bg-purple-500 text-white'
  }

  const getFontSize = (value: number) => {
    if (value >= 1024) return 'text-lg'
    if (value >= 128) return 'text-xl'
    return 'text-2xl'
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide">Score</div>
          <div className="text-2xl font-bold text-pink-600">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide">Best</div>
          <div className="text-2xl font-bold text-purple-600">{best}</div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> New Game
        </button>
      </div>

      {/* Grid */}
      <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
        <div className="grid grid-cols-4 gap-2">
          {grid.map((row, ry) =>
            row.map((cell, cx) => (
              <div
                key={`${ry}-${cx}`}
                className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold transition-all ${
                  cell === 0 ? 'bg-gray-700' : getTileColor(cell)
                } ${cell === 0 ? '' : 'shadow-inner'}`}
              >
                <span className={getFontSize(cell)}>{cell || ''}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Win overlay */}
      {won && !keepPlaying && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl z-10">
          <div className="text-center bg-gray-800 rounded-2xl p-8 border border-yellow-500">
            <p className="text-3xl font-bold text-yellow-400 mb-2">🎉 You Win!</p>
            <p className="text-gray-400 mb-4">Score: {score}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setKeepPlaying(true)}
                className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Keep Playing
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-500 transition-colors"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">Game Over!</p>
          <p className="text-sm text-gray-400">Final Score: {score}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">Use arrow keys or swipe to merge tiles</p>
    </div>
  )
}
