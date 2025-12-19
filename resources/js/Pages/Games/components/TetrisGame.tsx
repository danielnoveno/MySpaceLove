import { useCallback, useEffect, useRef, useState } from "react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 24;

const PIECES = "TJLOSZI";
const COLORS = [
    "#f8fafc",
    "#f472b6",
    "#60a5fa",
    "#fbbf24",
    "#34d399",
    "#f87171",
    "#a78bfa",
    "#f97316",
];

type GameOverHandler = (
    score: number,
    meta?: Record<string, string | number | boolean | null>
) => void | Promise<void>;

interface Props {
    onGameOver: GameOverHandler;
}

const createMatrix = (width: number, height: number) =>
    Array.from({ length: height }, () => Array(width).fill(0));

const createPiece = (type: string) => {
    switch (type) {
        case "T":
            return [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ];
        case "O":
            return [
                [2, 2],
                [2, 2],
            ];
        case "L":
            return [
                [0, 0, 3],
                [3, 3, 3],
                [0, 0, 0],
            ];
        case "J":
            return [
                [4, 0, 0],
                [4, 4, 4],
                [0, 0, 0],
            ];
        case "I":
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        case "S":
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case "Z":
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        default:
            return [[0]];
    }
};

const rotate = (matrix: number[][], dir: number) => {
    const rotated = matrix.map((row) => row.slice());
    for (let y = 0; y < rotated.length; y += 1) {
        for (let x = 0; x < y; x += 1) {
            [rotated[x][y], rotated[y][x]] = [
                rotated[y][x],
                rotated[x][y],
            ];
        }
    }

    if (dir > 0) {
        rotated.forEach((row) => row.reverse());
    } else {
        rotated.reverse();
    }

    return rotated;
};

export default function TetrisGame({ onGameOver }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const dropCounterRef = useRef(0);
    const lastTimeRef = useRef(0);
    const boardRef = useRef<number[][]>(createMatrix(BOARD_WIDTH, BOARD_HEIGHT));
    const playerRef = useRef({
        pos: { x: 0, y: 0 },
        matrix: createPiece("T"),
    });
    const [status, setStatus] = useState<"ready" | "playing" | "over">(
        "ready"
    );
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const scoreRef = useRef(0);
    const linesRef = useRef(0);

    const resetPlayer = useCallback(() => {
        const piece = createPiece(PIECES[(PIECES.length * Math.random()) | 0]);
        playerRef.current.matrix = piece;
        playerRef.current.pos.y = 0;
        playerRef.current.pos.x =
            ((BOARD_WIDTH / 2) | 0) - ((piece[0].length / 2) | 0);

        if (collide(boardRef.current, playerRef.current)) {
            setStatus("over");
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            onGameOver(scoreRef.current, { lines: linesRef.current });
        }
    }, [onGameOver]);

    const resetGame = useCallback(() => {
        boardRef.current = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
        scoreRef.current = 0;
        linesRef.current = 0;
        setScore(0);
        setLines(0);
        resetPlayer();
    }, [resetPlayer]);

    const drawMatrix = (matrix: number[][], offset: { x: number; y: number }) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    };

    const sweep = useCallback(() => {
        let rowCount = 0;
        outer: for (let y = boardRef.current.length - 1; y >= 0; y -= 1) {
            for (let x = 0; x < boardRef.current[y].length; x += 1) {
                if (boardRef.current[y][x] === 0) {
                    continue outer;
                }
            }

            const row = boardRef.current.splice(y, 1)[0].fill(0);
            boardRef.current.unshift(row);
            y += 1;
            rowCount += 1;
        }

        if (rowCount > 0) {
            const lineScores = [0, 40, 100, 300, 1200];
            scoreRef.current += lineScores[rowCount] * 5;
            linesRef.current += rowCount;
            setScore(scoreRef.current);
            setLines(linesRef.current);
        }
    }, []);

    const merge = useCallback(() => {
        playerRef.current.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    boardRef.current[y + playerRef.current.pos.y][
                        x + playerRef.current.pos.x
                    ] = value;
                }
            });
        });
    }, []);

    const drop = useCallback(() => {
        playerRef.current.pos.y += 1;
        if (collide(boardRef.current, playerRef.current)) {
            playerRef.current.pos.y -= 1;
            merge();
            sweep();
            resetPlayer();
        }
        dropCounterRef.current = 0;
    }, [merge, resetPlayer, sweep]);

    const update = useCallback(
        (time = 0) => {
            const delta = time - lastTimeRef.current;
            lastTimeRef.current = time;
            dropCounterRef.current += delta;

            if (dropCounterRef.current > 600) {
                drop();
            }

            const ctx = canvasRef.current?.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#fdf2f8";
                ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
                drawMatrix(boardRef.current, { x: 0, y: 0 });
                drawMatrix(playerRef.current.matrix, playerRef.current.pos);
            }

            if (status === "playing") {
                animationRef.current = requestAnimationFrame(update);
            }
        },
        [drop, status]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (status !== "playing") return;

            if (event.key === "ArrowLeft") {
                playerRef.current.pos.x -= 1;
                if (collide(boardRef.current, playerRef.current)) {
                    playerRef.current.pos.x += 1;
                }
            }

            if (event.key === "ArrowRight") {
                playerRef.current.pos.x += 1;
                if (collide(boardRef.current, playerRef.current)) {
                    playerRef.current.pos.x -= 1;
                }
            }

            if (event.key === "ArrowDown") {
                drop();
            }

            if (event.key === "ArrowUp") {
                const rotated = rotate(playerRef.current.matrix, 1);
                const position = playerRef.current.pos.x;
                let offset = 1;
                playerRef.current.matrix = rotated;

                while (collide(boardRef.current, playerRef.current)) {
                    playerRef.current.pos.x += offset;
                    offset = -(offset + (offset > 0 ? 1 : -1));
                    if (offset > rotated[0].length) {
                        playerRef.current.matrix = rotate(rotated, -1);
                        playerRef.current.pos.x = position;
                        break;
                    }
                }
            }

            if (event.key === " ") {
                while (!collide(boardRef.current, playerRef.current)) {
                    playerRef.current.pos.y += 1;
                }
                playerRef.current.pos.y -= 1;
                merge();
                sweep();
                resetPlayer();
            }
        },
        [drop, merge, resetPlayer, status, sweep]
    );

    useEffect(() => {
        if (status === "playing") {
            animationRef.current = requestAnimationFrame(update);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [status, update]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const startGame = () => {
        resetGame();
        setStatus("playing");
    };

    return (
        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Tetris
                    </h3>
                    <p className="text-sm text-gray-500">
                        Use arrow keys to move and rotate. Spacebar drops fast.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={startGame}
                    className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600"
                >
                    {status === "playing" ? "Restart" : "Start"}
                </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[auto,1fr]">
                <canvas
                    ref={canvasRef}
                    width={BOARD_WIDTH * BLOCK_SIZE}
                    height={BOARD_HEIGHT * BLOCK_SIZE}
                    className="rounded-2xl border border-purple-100 bg-pink-50"
                />
                <div className="space-y-4">
                    <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-pink-500">
                            Score
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {score}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-purple-500">
                            Lines Cleared
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {lines}
                        </div>
                    </div>
                    {status === "over" && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Game over! Hit restart to play again.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const collide = (
    board: number[][],
    player: { pos: { x: number; y: number }; matrix: number[][] }
) => {
    for (let y = 0; y < player.matrix.length; y += 1) {
        for (let x = 0; x < player.matrix[y].length; x += 1) {
            if (
                player.matrix[y][x] !== 0 &&
                (board[y + player.pos.y] &&
                    board[y + player.pos.y][x + player.pos.x]) !== 0
            ) {
                return true;
            }
        }
    }

    return false;
};
