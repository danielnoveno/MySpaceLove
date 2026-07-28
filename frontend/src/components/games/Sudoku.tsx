'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RotateCcw, Timer, AlertTriangle } from 'lucide-react'

type Board = (number | null)[][]
type Difficulty = 'easy' | 'medium' | 'hard'

const CLUES: Record<Difficulty, number> = { easy: 40, medium: 30, hard: 25 }

function createSolvedBoard(): number[][] {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))

  function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false
      if (board[i][col] === num) return false
    }
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false
      }
    }
    return true
  }

  function solve(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
          for (const num of nums) {
            if (isValid(board, r, c, num)) {
              board[r][c] = num
              if (solve(board)) return true
              board[r][c] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  solve(board)
  return board
}

function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: number[][] } {
  const solution = createSolvedBoard()
  const puzzle: Board = solution.map((row) => row.map((v) => v))
  const totalCells = 81
  const toRemove = totalCells - CLUES[difficulty]

  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }
  positions.sort(() => Math.random() - 0.5)

  let removed = 0
  for (const [r, c] of positions) {
    if (removed >= toRemove) break
    puzzle[r][c] = null
    removed++
  }

  return { puzzle, solution }
}

function getConflicts(board: Board): Set<string> {
  const conflicts = new Set<string>()

  const checkGroup = (cells: [number, number][]) => {
    const counts: Record<number, [number, number][]> = {}
    for (const [r, c] of cells) {
      const val = board[r][c]
      if (val !== null) {
        if (!counts[val]) counts[val] = []
        counts[val].push([r, c])
      }
    }
    for (const positions of Object.values(counts)) {
      if (positions.length > 1) {
        for (const [r, c] of positions) {
          conflicts.add(`${r}-${c}`)
        }
      }
    }
  }

  // Rows
  for (let r = 0; r < 9; r++) {
    const cells: [number, number][] = []
    for (let c = 0; c < 9; c++) cells.push([r, c])
    checkGroup(cells)
  }

  // Columns
  for (let c = 0; c < 9; c++) {
    const cells: [number, number][] = []
    for (let r = 0; r < 9; r++) cells.push([r, c])
    checkGroup(cells)
  }

  // Boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const cells: [number, number][] = []
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          cells.push([r, c])
        }
      }
      checkGroup(cells)
    }
  }

  return conflicts
}

function isComplete(board: Board, solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false
    }
  }
  return true
}

export default function Sudoku({ onScore }: { onScore: (score: number) => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [solution, setSolution] = useState<number[][]>([])
  const [board, setBoard] = useState<Board>([])
  const [locked, setLocked] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [conflicts, setConflicts] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const initGame = useCallback((diff: Difficulty) => {
    const { puzzle: p, solution: s } = generatePuzzle(diff)
    const lockedCells = new Set<string>()
    const b: Board = p.map((row, r) =>
      row.map((cell, c) => {
        if (cell !== null) lockedCells.add(`${r}-${c}`)
        return cell
      })
    )
    setSolution(s)
    setBoard(b)
    setLocked(lockedCells)
    setSelected(null)
    setConflicts(new Set())
    setErrors(0)
    setTimer(0)
    setIsRunning(true)
    setGameOver(false)
    setDifficulty(diff)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => initGame('medium'), 0)
    return () => {
      clearTimeout(timeout)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [initGame])

  // Timer
  useEffect(() => {
    if (isRunning && !gameOver) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [isRunning, gameOver])

  // Check for conflicts whenever board changes
  useEffect(() => {
    if (board.length === 0) return
    const timeout = setTimeout(() => {
      const c = getConflicts(board)
      setConflicts(c)
      if (isComplete(board, solution)) {
        setIsRunning(false)
        setGameOver(true)
        const score = Math.max(0, 1000 - errors * 50 - Math.floor(timer / 10) * 5)
        onScore(score)
      }
    }, 0)
    return () => clearTimeout(timeout)
  }, [board, solution, errors, timer, onScore])

  const handleCellClick = (r: number, c: number) => {
    if (locked.has(`${r}-${c}`) || gameOver) return
    setSelected([r, c])
  }

  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selected || gameOver) return
      const [r, c] = selected
      if (locked.has(`${r}-${c}`)) return
      const newBoard = board.map((row) => [...row])
      const prev = newBoard[r][c]
      newBoard[r][c] = num === 0 ? null : num
      if (prev !== null && num !== 0 && prev !== num) {
        setErrors((e) => e + 1)
      }
      setBoard(newBoard)
    },
    [selected, board, locked, gameOver]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return
      if (!selected) return
      const [r, c] = selected

      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); if (r > 0) setSelected([r - 1, c]); break
        case 'ArrowDown': e.preventDefault(); if (r < 8) setSelected([r + 1, c]); break
        case 'ArrowLeft': e.preventDefault(); if (c > 0) setSelected([r, c - 1]); break
        case 'ArrowRight': e.preventDefault(); if (c < 8) setSelected([r, c + 1]); break
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          handleNumberInput(parseInt(e.key))
          break
        case '0': case 'Backspace': case 'Delete':
          handleNumberInput(0)
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selected, gameOver, handleNumberInput])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const getCellBg = (r: number, c: number) => {
    if (locked.has(`${r}-${c}`)) return 'bg-gray-600 text-white font-bold'
    if (conflicts.has(`${r}-${c}`)) return 'bg-red-500/30 text-red-400'
    if (selected && selected[0] === r && selected[1] === c) return 'bg-pink-500/30 text-white'
    if (selected) {
      const [sr, sc] = selected
      if (sr === r || sc === c) return 'bg-gray-700/50'
      const br = Math.floor(sr / 3) === Math.floor(r / 3)
      const bc = Math.floor(sc / 3) === Math.floor(c / 3)
      if (br && bc) return 'bg-gray-700/50'
    }
    return 'bg-gray-800 text-gray-200'
  }

  const getBorderClass = (r: number, c: number) => {
    let classes = ''
    if (c % 3 === 0) classes += ' border-l-2 border-l-gray-500'
    if (r % 3 === 0) classes += ' border-t-2 border-t-gray-500'
    if (c === 8) classes += ' border-r-2 border-r-gray-500'
    if (r === 8) classes += ' border-b-2 border-b-gray-500'
    return classes
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-gray-300">{formatTime(timer)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-red-400">Errors: {errors}</span>
        </div>
        <button
          onClick={() => initGame(difficulty)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => initGame(d)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              difficulty === d
                ? 'bg-pink-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="bg-gray-900 rounded-xl p-2 border border-gray-700">
        <div className="grid grid-cols-9 gap-0">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-10 h-10 flex items-center justify-center text-lg transition-colors border border-gray-700/50 ${getCellBg(
                  r,
                  c
                )} ${getBorderClass(r, c)}`}
              >
                {cell || ''}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Number pad */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleNumberInput(n)}
            className="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors text-lg"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className="w-10 h-10 rounded-lg bg-gray-700 text-gray-400 font-bold hover:bg-gray-600 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="text-center">
          <p className="text-lg font-bold text-green-500">🎉 Puzzle Complete!</p>
          <p className="text-sm text-gray-400">
            Time: {formatTime(timer)} | Errors: {errors}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Arrow keys to navigate | 1-9 to fill | 0/Del to clear
      </p>
    </div>
  )
}
