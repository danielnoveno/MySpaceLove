import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";

type GameOverHandler = (
    score: number,
    meta?: Record<string, string | number | boolean | null>
) => void | Promise<void>;

interface Props {
    onGameOver: GameOverHandler;
    sessionRoute: string;
    sessionMoveRoute: string;
}

interface SessionState {
    board: number[][];
    players: number[];
    current_turn_user_id?: number | null;
    winner?: number | null;
    moves?: number;
}

interface SessionResponse {
    session: {
        session_id: string;
        status: string;
        state: SessionState;
        current_turn_user_id?: number | null;
    };
}

const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;
const WIDTH = COLS * CELL_SIZE;
const HEIGHT = ROWS * CELL_SIZE;

export default function ConnectFourGame({
    onGameOver,
    sessionRoute,
    sessionMoveRoute,
}: Props) {
    const { props } = usePage();
    const currentUserId = props?.auth?.user?.id;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [sessionId, setSessionId] = useState<string>(
        () => localStorage.getItem("connect-four-session") || ""
    );
    const [sessionState, setSessionState] = useState<SessionState | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
    const submittedRef = useRef(false);

    const sessionUrl = useMemo(() => {
        if (!sessionId) return "";
        return sessionRoute.replace("SESSION", sessionId);
    }, [sessionId, sessionRoute]);

    const sessionMoveUrl = useMemo(() => {
        if (!sessionId) return "";
        return sessionMoveRoute.replace("SESSION", sessionId);
    }, [sessionId, sessionMoveRoute]);

    const fetchSession = useCallback(async () => {
        if (!sessionUrl) return;
        setStatus("loading");
        const response = await fetch(sessionUrl, {
            headers: { Accept: "application/json" },
        });

        if (response.ok) {
            const data = (await response.json()) as SessionResponse;
            setSessionState(data.session.state);
            setStatus("ready");
        }
    }, [sessionUrl]);

    useEffect(() => {
        if (!sessionUrl) return;
        fetchSession();
        const interval = window.setInterval(fetchSession, 4000);
        return () => window.clearInterval(interval);
    }, [fetchSession, sessionUrl]);

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !sessionState) return;

        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (let row = 0; row < ROWS; row += 1) {
            for (let col = 0; col < COLS; col += 1) {
                ctx.fillStyle = "#fbcfe8";
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                const value = sessionState.board?.[row]?.[col] ?? 0;
                ctx.beginPath();
                ctx.arc(
                    col * CELL_SIZE + CELL_SIZE / 2,
                    row * CELL_SIZE + CELL_SIZE / 2,
                    CELL_SIZE / 2.6,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = value === 1 ? "#f472b6" : value === 2 ? "#a855f7" : "#fff7ed";
                ctx.fill();
            }
        }
    }, [sessionState]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleDrop = async (column: number) => {
        if (!sessionMoveUrl || !sessionState) return;
        if (sessionState.winner) return;
        if (currentUserId && sessionState.current_turn_user_id !== currentUserId) {
            return;
        }

        await fetch(sessionMoveUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN":
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") ?? "",
            },
            body: JSON.stringify({ action: "drop", column }),
        });

        await fetchSession();
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!sessionState) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const column = Math.floor(x / CELL_SIZE);
        handleDrop(column);
    };

    useEffect(() => {
        if (!sessionState?.winner || submittedRef.current || !currentUserId) return;
        const score = sessionState.winner === currentUserId ? 120 : 60;
        submittedRef.current = true;
        onGameOver(score, { winner_id: sessionState.winner ?? 0, moves: sessionState.moves ?? 0, session_id: sessionId });
    }, [currentUserId, onGameOver, sessionId, sessionState]);

    const startNewSession = () => {
        const newId = Math.random().toString(36).slice(2, 8);
        localStorage.setItem("connect-four-session", newId);
        submittedRef.current = false;
        setSessionId(newId);
    };

    const joinSession = (event: React.FormEvent) => {
        event.preventDefault();
        if (sessionId) {
            localStorage.setItem("connect-four-session", sessionId);
            submittedRef.current = false;
            fetchSession();
        }
    };

    return (
        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Connect Four</h3>
                    <p className="text-sm text-gray-500">
                        Take turns dropping discs. First to four wins.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={startNewSession}
                    className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600"
                >
                    New Session
                </button>
            </div>

            <form onSubmit={joinSession} className="mt-4 flex flex-wrap gap-3">
                <input
                    value={sessionId}
                    onChange={(event) => setSessionId(event.target.value)}
                    placeholder="Session code"
                    className="flex-1 rounded-full border border-pink-100 px-4 py-2 text-sm shadow-sm focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                />
                <button
                    type="submit"
                    className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
                >
                    Join
                </button>
            </form>

            <div className="mt-5 grid gap-4 md:grid-cols-[auto,1fr]">
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    onClick={handleCanvasClick}
                    className="rounded-2xl border border-purple-100 bg-pink-50"
                />
                <div className="space-y-4">
                    <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-pink-500">
                            Session
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                            {sessionId || "—"}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-purple-500">
                            Status
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                            {status === "loading"
                                ? "Syncing..."
                                : sessionState?.winner
                                ? "Game complete"
                                : currentUserId &&
                                  sessionState?.current_turn_user_id ===
                                      currentUserId
                                ? "Your turn"
                                : "Your space match is live"}
                        </div>
                    </div>
                    {sessionState?.winner && (
                        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                            Match finished! Save the score and start a new round.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
