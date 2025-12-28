import { useCallback, useEffect, useRef, useState } from "react";

type GameOverHandler = (
    score: number,
    meta?: Record<string, string | number | boolean | null>
) => void | Promise<void>;

interface Props {
    onGameOver: GameOverHandler;
}

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 360;
const BASE_SEGMENT_SIZE = 8;
const SPEED = 2.4;
const TURN_SMOOTHING = 0.12;
const TARGET_LERP = 0.18;
const KEY_TURN_STEP = 0.14;
const ORB_COUNT = 18;
const SPAWN_RADIUS = 340;

const createOrbAround = (center: { x: number; y: number }) => ({
    x:
        center.x +
        Math.cos(Math.random() * Math.PI * 2) *
            Math.sqrt(Math.random()) *
            SPAWN_RADIUS,
    y:
        center.y +
        Math.sin(Math.random() * Math.PI * 2) *
            Math.sqrt(Math.random()) *
            SPAWN_RADIUS,
    r: 6 + Math.random() * 5,
});

export default function SlitherGame({ onGameOver }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const [status, setStatus] = useState<"ready" | "playing" | "over">(
        "ready"
    );
    const [score, setScore] = useState(0);
    const [length, setLength] = useState(20);
    const scoreRef = useRef(0);
    const lengthRef = useRef(20);
    const directionRef = useRef(Math.PI / 2);
    const targetDirectionRef = useRef(Math.PI / 2);
    const snakeRef = useRef<Array<{ x: number; y: number }>>([]);
    const orbsRef = useRef<Array<{ x: number; y: number; r: number }>>([]);
    const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const scaleRef = useRef(1);

    const segmentSize = useCallback(() => {
        return (
            BASE_SEGMENT_SIZE +
            Math.min(6, Math.floor(lengthRef.current / 60))
        );
    }, []);

    const resetGame = useCallback(() => {
        const startX = 0;
        const startY = 0;
        snakeRef.current = Array.from({ length: lengthRef.current }, (_, idx) => ({
            x: startX - idx * BASE_SEGMENT_SIZE,
            y: startY,
        }));
        cameraRef.current = { x: startX, y: startY };
        orbsRef.current = Array.from({ length: ORB_COUNT }, () =>
            createOrbAround({ x: startX, y: startY })
        );
        scoreRef.current = 0;
        setScore(0);
        setLength(lengthRef.current);
        directionRef.current = Math.PI / 2;
        targetDirectionRef.current = Math.PI / 2;
    }, []);

    const endGame = useCallback(() => {
        setStatus("over");
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        onGameOver(scoreRef.current, { length: lengthRef.current });
    }, [onGameOver]);

    const update = useCallback(() => {
        if (snakeRef.current.length === 0) {
            resetGame();
        }

        const direction = directionRef.current;
        const targetDirection = targetDirectionRef.current;
        const angleDiff = Math.atan2(
            Math.sin(targetDirection - direction),
            Math.cos(targetDirection - direction)
        );
        directionRef.current = direction + angleDiff * TURN_SMOOTHING;

        const head = snakeRef.current[0];
        const size = segmentSize();
        const newHead = {
            x: head.x + Math.cos(directionRef.current) * SPEED,
            y: head.y + Math.sin(directionRef.current) * SPEED,
        };

        snakeRef.current.unshift(newHead);
        while (snakeRef.current.length > lengthRef.current) {
            snakeRef.current.pop();
        }

        for (let i = 10; i < snakeRef.current.length; i += 1) {
            const segment = snakeRef.current[i];
            const dx = segment.x - newHead.x;
            const dy = segment.y - newHead.y;
            if (Math.hypot(dx, dy) < size * 0.9) {
                endGame();
                return;
            }
        }

        orbsRef.current = orbsRef.current.filter((orb) => {
            const dx = orb.x - newHead.x;
            const dy = orb.y - newHead.y;
            if (Math.hypot(dx, dy) < orb.r + size) {
                lengthRef.current += 4;
                scoreRef.current += 10;
                setScore(scoreRef.current);
                setLength(lengthRef.current);
                return false;
            }
            return true;
        });

        while (orbsRef.current.length < ORB_COUNT) {
            orbsRef.current.push(createOrbAround(newHead));
        }

        draw();

        if (status === "playing") {
            animationRef.current = requestAnimationFrame(update);
        }
    }, [endGame, segmentSize, status]);

    const draw = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const head = snakeRef.current[0] ?? { x: 0, y: 0 };
        cameraRef.current = {
            x:
                cameraRef.current.x +
                (head.x - cameraRef.current.x) * 0.15,
            y:
                cameraRef.current.y +
                (head.y - cameraRef.current.y) * 0.15,
        };

        const size = segmentSize();
        const zoom =
            Math.max(
                0.6,
                Math.min(1.4, 1.2 - lengthRef.current / 300 - size / 80)
            );
        scaleRef.current = zoom;

        ctx.save();
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(
            cameraRef.current.x - CANVAS_WIDTH,
            cameraRef.current.y - CANVAS_HEIGHT,
            CANVAS_WIDTH * 2,
            CANVAS_HEIGHT * 2
        );

        orbsRef.current.forEach((orb) => {
            ctx.beginPath();
            ctx.fillStyle = "rgba(244, 114, 182, 0.9)";
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fill();
        });

        snakeRef.current.forEach((segment, index) => {
            ctx.beginPath();
            ctx.fillStyle = index === 0 ? "#9333ea" : "#c084fc";
            ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
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
        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect || snakeRef.current.length === 0) return;
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const zoom = scaleRef.current || 1;
            const worldX =
                (x - CANVAS_WIDTH / 2) / zoom + cameraRef.current.x;
            const worldY =
                (y - CANVAS_HEIGHT / 2) / zoom + cameraRef.current.y;
            const head = snakeRef.current[0];
            const desiredAngle = Math.atan2(worldY - head.y, worldX - head.x);
            targetDirectionRef.current +=
                (desiredAngle - targetDirectionRef.current) * TARGET_LERP;
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                targetDirectionRef.current -= KEY_TURN_STEP;
            }
            if (event.key === "ArrowRight") {
                targetDirectionRef.current += KEY_TURN_STEP;
            }
        };

        const canvas = canvasRef.current;
        canvas?.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            canvas?.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const startGame = () => {
        lengthRef.current = 20;
        resetGame();
        setStatus("playing");
    };

    return (
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Slither Sprint
                    </h3>
                    <p className="text-sm text-gray-500">
                        Guide with your mouse or arrow keys. Avoid walls and your
                        tail.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={startGame}
                    className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
                >
                    {status === "playing" ? "Restart" : "Start"}
                </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[auto,1fr]">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="rounded-2xl border border-pink-100 bg-pink-50"
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
                            Length
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {length}
                        </div>
                    </div>
                    {status === "over" && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Oops! Your snake bumped into something.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
