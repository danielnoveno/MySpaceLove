'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RotateCcw } from 'lucide-react'

const COLS = 10
const ROWS = 20
const EMPTY = 0

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
}

const COLORS: Record<TetrominoType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-400',
  S: 'bg-green-400',
  Z: 'bg-red-400',
  J: 'bg-blue-400',
  L: 'bg-orange-400',
}

const PIECE_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

function rotate(matrix: number[][]): number[][] {
  const N = matrix.length
  const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0))
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[c][N - 1 - r] = matrix[r][c]
    }
  }
  return result
}

function createBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY))
}

interface Piece {
  type: TetrominoType
  shape: number[][]
  x: number
  y: number
}

function randomPiece(): Piece {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  const shape = TETROMINOES[type].map((r) => [...r])
  return { type, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 }
}

function isValid(board: number[][], piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const newX = piece.x + c
        const newY = piece.y + r
        if (newX < 0 || newX >= COLS || newY >= ROWS) return false
        if (newY >= 0 && board[newY][newX] !== EMPTY) return false
      }
    }
  }
  return true
}

function merge(board: number[][], piece: Piece, value: number): number[][] {
  const newBoard = board.map((r) => [...r])
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const newX = piece.x + c
        const newY = piece.y + r
        if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
          newBoard[newY][newX] = value
        }
      }
    }
  }
  return newBoard
}

function clearLines(board: number[][]): { board: number[][]; lines: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === EMPTY))
  const lines = ROWS - newBoard.length
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(EMPTY))
  }
  return { board: newBoard, lines }
}

const LINE_SCORES = [0, 100, 300, 500, 800]

export default function Tetris({ onScore }: { onScore: (score: number) => void }) {
  const [board, setBoard] = useState(createBoard)
  const [current, setCurrent] = useState<Piece>(randomPiece)
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const boardRef = useRef(board)
  const currentRef = useRef(current)
  const nextRef = useRef(nextPiece)
  const scoreRef = useRef(score)
  const levelRef = useRef(level)
  const linesRef = useRef(lines)
  const gameOverRef = useRef(gameOver)
  const isPausedRef = useRef(isPaused)

  useEffect(() => {
    boardRef.current = board
    currentRef.current = current
    nextRef.current = nextPiece
    scoreRef.current = score
    levelRef.current = level
    linesRef.current = lines
    gameOverRef.current = gameOver
    isPausedRef.current = isPaused
  }, [board, current, gameOver, isPaused, level, lines, nextPiece, score])

  const lockPiece = useCallback(() => {
    const b = merge(boardRef.current, currentRef.current, currentRef.current.shape.length)
    const { board: cleared, lines: clearedCount } = clearLines(b)
    if (clearedCount > 0) {
      const newLines = linesRef.current + clearedCount
      const newLevel = Math.floor(newLines / 10) + 1
      const newScore = scoreRef.current + LINE_SCORES[Math.min(clearedCount, 4)] * newLevel
      setBoard(cleared)
      setLines(newLines)
      setLevel(newLevel)
      setScore(newScore)
    } else {
      setBoard(cleared)
    }
    // Spawn next
    const next = nextRef.current
    if (!isValid(cleared, next)) {
      setGameOver(true)
      onScore(scoreRef.current)
      return
    }
    setCurrent(next)
    setNextPiece(randomPiece())
  }, [onScore])

  const moveDown = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return
    const moved = { ...currentRef.current, y: currentRef.current.y + 1 }
    if (isValid(boardRef.current, moved)) {
      setCurrent(moved)
    } else {
      lockPiece()
    }
  }, [lockPiece])

  const moveLeft = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return
    const moved = { ...currentRef.current, x: currentRef.current.x - 1 }
    if (isValid(boardRef.current, moved)) setCurrent(moved)
  }, [])

  const moveRight = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return
    const moved = { ...currentRef.current, x: currentRef.current.x + 1 }
    if (isValid(boardRef.current, moved)) setCurrent(moved)
  }, [])

  const rotatePiece = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return
    const rotated = { ...currentRef.current, shape: rotate(currentRef.current.shape) }
    // Wall kick
    if (isValid(boardRef.current, rotated)) {
      setCurrent(rotated)
      return
    }
    for (const dx of [-1, 1, -2, 2]) {
      const kicked = { ...rotated, x: rotated.x + dx }
      if (isValid(boardRef.current, kicked)) {
        setCurrent(kicked)
        return
      }
    }
  }, [])

  const hardDrop = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return
    let piece = { ...currentRef.current }
    while (isValid(boardRef.current, { ...piece, y: piece.y + 1 })) {
      piece = { ...piece, y: piece.y + 1 }
    }
    setCurrent(piece)
    // Lock immediately
    const b = merge(boardRef.current, piece, piece.shape.length)
    const { board: cleared, lines: clearedCount } = clearLines(b)
    if (clearedCount > 0) {
      const newLines = linesRef.current + clearedCount
      const newLevel = Math.floor(newLines / 10) + 1
      const newScore = scoreRef.current + LINE_SCORES[Math.min(clearedCount, 4)] * newLevel
      setBoard(cleared)
      setLines(newLines)
      setLevel(newLevel)
      setScore(newScore)
    } else {
      setBoard(cleared)
    }
    const next = nextRef.current
    if (!isValid(cleared, next)) {
      setGameOver(true)
      onScore(scoreRef.current)
      return
    }
    setCurrent(next)
    setNextPiece(randomPiece())
  }, [onScore])

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((p) => !p)
        return
      }
      if (isPausedRef.current) return
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break
        case 'ArrowRight': e.preventDefault(); moveRight(); break
        case 'ArrowUp': e.preventDefault(); rotatePiece(); break
        case 'ArrowDown': e.preventDefault(); moveDown(); break
        case ' ': e.preventDefault(); hardDrop(); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [moveLeft, moveRight, rotatePiece, moveDown, hardDrop])

  // Gravity
  useEffect(() => {
    if (gameOver || isPaused) return
    const speed = Math.max(50, 500 - (level - 1) * 40)
    const interval = setInterval(moveDown, speed)
    return () => clearInterval(interval)
  }, [gameOver, isPaused, level, moveDown])

  // Ghost piece position
  const getGhostY = () => {
    let ghost = { ...current, y: current.y }
    while (isValid(board, { ...ghost, y: ghost.y + 1 })) {
      ghost = { ...ghost, y: ghost.y + 1 }
    }
    return ghost.y
  }

  // Render board with current piece
  const renderBoard = () => {
    const display = board.map((r) => [...r])
    const ghostY = getGhostY()

    // Draw ghost
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          const x = current.x + c
          const y = ghostY + r
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS && display[y][x] === EMPTY) {
            display[y][x] = -1 // ghost marker
          }
        }
      }
    }

    // Draw current piece
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          const x = current.x + c
          const y = current.y + r
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            display[y][x] = 10 + PIECE_TYPES.indexOf(current.type)
          }
        }
      }
    }

    return display
  }

  const reset = () => {
    setBoard(createBoard())
    setCurrent(randomPiece())
    setNextPiece(randomPiece())
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
  }

  const displayBoard = renderBoard()
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide">Score</div>
          <div className="text-xl font-bold text-pink-600">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide">Level</div>
          <div className="text-xl font-bold text-purple-600">{level}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide">Lines</div>
          <div className="text-xl font-bold text-cyan-600">{lines}</div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      {/* Game area */}
      <div className="flex gap-4">
        {/* Board */}
        <div
          className="grid gap-0 bg-gray-900 rounded-xl p-1 border border-gray-700"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {displayBoard.map((row, ry) =>
            row.map((cell, cx) => {
              let cellClass = 'bg-gray-800'
              if (cell === -1) {
                cellClass = 'bg-gray-700 border border-dashed border-gray-600'
              } else if (cell >= 10) {
                const typeIdx = cell - 10
                cellClass = COLORS[PIECE_TYPES[typeIdx]]
              } else if (cell > 0) {
                // Locked cell - show as gray
                cellClass = 'bg-gray-500'
              }
              return (
                <div
                  key={`${ry}-${cx}`}
                  className={`w-6 h-6 ${cellClass} border border-gray-900/30`}
                />
              )
            })
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4 w-28">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Next</div>
            <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
              <div
                className="grid gap-0"
                style={{ gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)` }}
              >
                {nextPiece.shape.flatMap((row, ry) =>
                  row.map((cell, cx) => (
                    <div
                      key={`${ry}-${cx}`}
                      className={`w-5 h-5 ${
                        cell ? COLORS[nextPiece.type] : 'bg-transparent'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {isPaused && !gameOver && (
            <div className="text-center text-yellow-400 font-bold text-sm animate-pulse">
              PAUSED
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <p className="text-red-500 font-bold text-sm">GAME OVER</p>
              <p className="text-xs text-gray-400 mt-1">Final: {score}</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls help */}
      <div className="text-xs text-gray-500 text-center">
        ← → Move &nbsp;|&nbsp; ↑ Rotate &nbsp;|&nbsp; ↓ Soft Drop &nbsp;|&nbsp; Space Hard Drop &nbsp;|&nbsp; P Pause
      </div>
    </div>
  )
}
