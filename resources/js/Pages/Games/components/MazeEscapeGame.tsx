import { useCallback, useEffect, useRef, useState } from "react";

type GameOverHandler = (
    score: number,
    meta?: Record<string, string | number | boolean | null>
) => void | Promise<void>;

interface Props {
    onGameOver: GameOverHandler;
}

const GRID_COLS = 12;
const GRID_ROWS = 9;
const CELL_SIZE = 40;
const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;

const MAZE = [
    "############",
    "#....#.....#",
    "#.#.##.###.#",
    "#.#....#...#",
    "#.####.#.#.#",
    "#....#...#.#",
    "###.#.###..#",
    "#....#.....#",
    "############",
];

export default function MazeEscapeGame({ onGameOver }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");
    const [time, setTime] = useState(0);
    const [steps, setSteps] = useState(0);
    const playersRef = useRef([
        { x: 1, y: 1, color: "#f472b6" },
        { x: GRID_COLS - 2, y: GRID_ROWS - 2, color: "#a855f7" },
    ]);
    const timerRef = useRef<number | null>(null);

    const isWall = (x: number, y: number) => MAZE[y]?.[x] === "#";

    const resetGame = () => {
        playersRef.current = [
            { x: 1, y: 1, color: "#f472b6" },
            { x: GRID_COLS - 2, y: GRID_ROWS - 2, color: "#a855f7" },
        ];
        setTime(0);
        setSteps(0);
    };

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        for (let row = 0; row < GRID_ROWS; row += 1) {
            for (let col = 0; col < GRID_COLS; col += 1) {
                if (isWall(col, row)) {
                    ctx.fillStyle = "#fbcfe8";
                    ctx.fillRect(
                        col * CELL_SIZE,
                        row * CELL_SIZE,
                        CELL_SIZE,
                        CELL_SIZE
                    );
                }
            }
        }

        ctx.fillStyle = "#34d399";
        ctx.fillRect(
            (GRID_COLS / 2 - 1) * CELL_SIZE,
            (GRID_ROWS / 2 - 1) * CELL_SIZE,
            CELL_SIZE * 2,
            CELL_SIZE * 2
        );

        playersRef.current.forEach((player) => {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(
                player.x * CELL_SIZE + CELL_SIZE / 2,
                player.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    }, []);

    const endGame = useCallback(() => {
        setStatus("over");
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }
        const score = Math.max(0, 800 - time * 5 - steps * 2);
        onGameOver(Math.round(score), { time_seconds: time, steps });
    }, [onGameOver, steps, time]);

    useEffect(() => {
        draw();
    }, [draw, status, time]);

    useEffect(() => {
        if (status === "playing") {
            timerRef.current = window.setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
            }
        };
    }, [status]);

    const handleMove = useCallback(
        (playerIndex: number, dx: number, dy: number) => {
            setSteps((prev) => prev + 1);
            playersRef.current = playersRef.current.map((player, index) => {
                if (index !== playerIndex) {
                    return player;
                }
                const nextX = player.x + dx;
                const nextY = player.y + dy;
                if (isWall(nextX, nextY)) {
                    return player;
                }
                return { ...player, x: nextX, y: nextY };
            });
            draw();

            const exitArea = {
                xStart: GRID_COLS / 2 - 1,
                xEnd: GRID_COLS / 2,
                yStart: GRID_ROWS / 2 - 1,
                yEnd: GRID_ROWS / 2,
            };

            const allAtExit = playersRef.current.every(
                (player) =>
                    player.x >= exitArea.xStart &&
                    player.x <= exitArea.xEnd &&
                    player.y >= exitArea.yStart &&
                    player.y <= exitArea.yEnd
            );

            if (allAtExit) {
                endGame();
            }
        },
        [draw, endGame]
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (status !== "playing") return;

            switch (event.key) {
                case "w":
                case "W":
                    handleMove(0, 0, -1);
                    break;
                case "s":
                case "S":
                    handleMove(0, 0, 1);
                    break;
                case "a":
                case "A":
                    handleMove(0, -1, 0);
                    break;
                case "d":
                case "D":
                    handleMove(0, 1, 0);
                    break;
                case "ArrowUp":
                    handleMove(1, 0, -1);
                    break;
                case "ArrowDown":
                    handleMove(1, 0, 1);
                    break;
                case "ArrowLeft":
                    handleMove(1, -1, 0);
                    break;
                case "ArrowRight":
                    handleMove(1, 1, 0);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleMove, status]);

    const startGame = () => {
        resetGame();
        setStatus("playing");
    };

    return (
        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Co-op Maze Escape
                    </h3>
                    <p className="text-sm text-gray-500">
                        Guide both avatars to the glowing exit together.
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
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="rounded-2xl border border-purple-100 bg-pink-50"
                />
                <div className="space-y-4">
                    <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-pink-500">
                            Time
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {time}s
                        </div>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-purple-500">
                            Steps
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {steps}
                        </div>
                    </div>
                    {status === "over" && (
                        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                            You escaped together! Try for a faster time.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
