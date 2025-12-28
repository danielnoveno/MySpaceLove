import { useCallback, useEffect, useRef, useState } from "react";

type GameOverHandler = (
    score: number,
    meta?: Record<string, string | number | boolean | null>
) => void | Promise<void>;

interface Props {
    onGameOver: GameOverHandler;
}

const WIDTH = 640;
const HEIGHT = 360;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 10;

export default function PongDuetGame({ onGameOver }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const ballRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, vx: 3, vy: 2 });
    const leftPaddleRef = useRef({ y: HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    const rightPaddleRef = useRef({ y: HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    const keysRef = useRef<Record<string, boolean>>({});

    const resetGame = useCallback(() => {
        ballRef.current = { x: WIDTH / 2, y: HEIGHT / 2, vx: 3, vy: 2 };
        leftPaddleRef.current = { y: HEIGHT / 2 - PADDLE_HEIGHT / 2 };
        rightPaddleRef.current = { y: HEIGHT / 2 - PADDLE_HEIGHT / 2 };
        scoreRef.current = 0;
        setScore(0);
    }, []);

    const endGame = useCallback(() => {
        setStatus("over");
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        onGameOver(scoreRef.current, { rallies: scoreRef.current });
    }, [onGameOver]);

    const update = useCallback(() => {
        const ball = ballRef.current;

        if (keysRef.current.w) {
            leftPaddleRef.current.y -= 5;
        }
        if (keysRef.current.s) {
            leftPaddleRef.current.y += 5;
        }
        if (keysRef.current.ArrowUp) {
            rightPaddleRef.current.y -= 5;
        }
        if (keysRef.current.ArrowDown) {
            rightPaddleRef.current.y += 5;
        }

        leftPaddleRef.current.y = Math.max(
            0,
            Math.min(HEIGHT - PADDLE_HEIGHT, leftPaddleRef.current.y)
        );
        rightPaddleRef.current.y = Math.max(
            0,
            Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddleRef.current.y)
        );

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y <= 0 || ball.y >= HEIGHT - BALL_SIZE) {
            ball.vy *= -1;
        }

        const leftHit =
            ball.x <= PADDLE_WIDTH + 10 &&
            ball.y + BALL_SIZE >= leftPaddleRef.current.y &&
            ball.y <= leftPaddleRef.current.y + PADDLE_HEIGHT;
        const rightHit =
            ball.x + BALL_SIZE >= WIDTH - PADDLE_WIDTH - 10 &&
            ball.y + BALL_SIZE >= rightPaddleRef.current.y &&
            ball.y <= rightPaddleRef.current.y + PADDLE_HEIGHT;

        if (leftHit && ball.vx < 0) {
            ball.vx *= -1;
            scoreRef.current += 1;
            setScore(scoreRef.current);
        }

        if (rightHit && ball.vx > 0) {
            ball.vx *= -1;
            scoreRef.current += 1;
            setScore(scoreRef.current);
        }

        if (ball.x < -BALL_SIZE || ball.x > WIDTH + BALL_SIZE) {
            endGame();
            return;
        }

        draw();

        if (status === "playing") {
            animationRef.current = requestAnimationFrame(update);
        }
    }, [endGame, status]);

    const draw = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = "#f472b6";
        ctx.fillRect(10, leftPaddleRef.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = "#a855f7";
        ctx.fillRect(
            WIDTH - PADDLE_WIDTH - 10,
            rightPaddleRef.current.y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT
        );

        ctx.fillStyle = "#f97316";
        ctx.fillRect(ballRef.current.x, ballRef.current.y, BALL_SIZE, BALL_SIZE);
    };

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
        const handleKeyDown = (event: KeyboardEvent) => {
            keysRef.current[event.key] = true;
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            keysRef.current[event.key] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const startGame = () => {
        resetGame();
        setStatus("playing");
    };

    return (
        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pong Duet</h3>
                    <p className="text-sm text-gray-500">
                        Player 1: W/S • Player 2: ↑/↓. Keep the rally alive.
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
                    width={WIDTH}
                    height={HEIGHT}
                    className="rounded-2xl border border-purple-100 bg-pink-50"
                />
                <div className="space-y-4">
                    <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-pink-500">
                            Rally Score
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {score}
                        </div>
                    </div>
                    {status === "over" && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Missed it! Start again to set a new record.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
