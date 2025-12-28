import { useCallback, useEffect, useRef, useState } from "react";

type GameOverHandler = (
    score: number,
    meta?: Record<string, string | number | boolean | null>
) => void | Promise<void>;

interface Props {
    onGameOver: GameOverHandler;
}

const GRID_SIZE = 4;
const CARD_SIZE = 90;
const PADDING = 12;
const CANVAS_SIZE = GRID_SIZE * (CARD_SIZE + PADDING) + PADDING;

interface Card {
    id: number;
    color: string;
    matched: boolean;
    faceUp: boolean;
}

const COLORS = [
    "#f472b6",
    "#a855f7",
    "#f97316",
    "#34d399",
    "#60a5fa",
    "#fbbf24",
    "#f87171",
    "#22c55e",
];

const buildDeck = () => {
    const pairs = COLORS.flatMap((color, index) => [
        { id: index * 2, color },
        { id: index * 2 + 1, color },
    ]);
    return pairs
        .sort(() => Math.random() - 0.5)
        .map((card) => ({
            ...card,
            matched: false,
            faceUp: false,
        }));
};

export default function MemoryMatchGame({ onGameOver }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");
    const [cards, setCards] = useState<Card[]>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const selectedRef = useRef<number[]>([]);

    const startGame = () => {
        setCards(buildDeck());
        setMoves(0);
        setTime(0);
        selectedRef.current = [];
        setStatus("playing");
    };

    const endGame = useCallback(() => {
        setStatus("over");
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }
        const baseScore = Math.max(0, 1000 - time * 10);
        const score = baseScore + (GRID_SIZE * GRID_SIZE / 2 - moves) * 20;
        onGameOver(Math.max(0, Math.round(score)), { moves, time_seconds: time });
    }, [moves, onGameOver, time]);

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

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        cards.forEach((card, index) => {
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const x = PADDING + col * (CARD_SIZE + PADDING);
            const y = PADDING + row * (CARD_SIZE + PADDING);

            ctx.fillStyle = card.faceUp || card.matched ? card.color : "#fbcfe8";
            ctx.fillRect(x, y, CARD_SIZE, CARD_SIZE);

            if (!card.faceUp && !card.matched) {
                ctx.strokeStyle = "#f472b6";
                ctx.strokeRect(x, y, CARD_SIZE, CARD_SIZE);
            }
        });
    }, [cards]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (status !== "playing") return;
        if (selectedRef.current.length === 2) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / (CARD_SIZE + PADDING));
        const row = Math.floor(y / (CARD_SIZE + PADDING));
        const index = row * GRID_SIZE + col;
        const card = cards[index];

        if (!card || card.matched || card.faceUp) return;

        const nextCards = cards.map((item, idx) =>
            idx === index ? { ...item, faceUp: true } : item
        );
        selectedRef.current.push(index);
        setCards(nextCards);

        if (selectedRef.current.length === 2) {
            setMoves((prev) => prev + 1);
            const [firstIndex, secondIndex] = selectedRef.current;
            const first = nextCards[firstIndex];
            const second = nextCards[secondIndex];

            if (first.color === second.color) {
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((item, idx) =>
                            idx === firstIndex || idx === secondIndex
                                ? { ...item, matched: true }
                                : item
                        )
                    );
                    selectedRef.current = [];
                }, 300);
            } else {
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((item, idx) =>
                            idx === firstIndex || idx === secondIndex
                                ? { ...item, faceUp: false }
                                : item
                        )
                    );
                    selectedRef.current = [];
                }, 600);
            }
        }
    };

    useEffect(() => {
        if (status === "playing" && cards.length > 0) {
            const allMatched = cards.every((card) => card.matched);
            if (allMatched) {
                endGame();
            }
        }
    }, [cards, endGame, status]);

    return (
        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Memory Match</h3>
                    <p className="text-sm text-gray-500">
                        Flip cards, find pairs, and clear the board together.
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
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    onClick={handleClick}
                    className="rounded-2xl border border-purple-100 bg-pink-50"
                />
                <div className="space-y-4">
                    <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-pink-500">
                            Moves
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {moves}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-purple-500">
                            Time
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {time}s
                        </div>
                    </div>
                    {status === "over" && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Nice teamwork! Match again to beat the clock.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
