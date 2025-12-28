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
    players: number[];
    phase: "ask" | "guess" | "result";
    prompt?: string;
    answer?: string;
    guess?: string;
    is_match?: boolean | null;
    rounds?: number;
    current_turn_user_id?: number | null;
}

interface SessionResponse {
    session: {
        session_id: string;
        status: string;
        state: SessionState;
    };
}

export default function CoupleQuizGame({
    onGameOver,
    sessionRoute,
    sessionMoveRoute,
}: Props) {
    const { props } = usePage();
    const currentUserId = props?.auth?.user?.id;
    const [sessionId, setSessionId] = useState(() => localStorage.getItem("couple-quiz-session") || "");
    const [sessionState, setSessionState] = useState<SessionState | null>(null);
    const [prompt, setPrompt] = useState("");
    const [answer, setAnswer] = useState("");
    const [guess, setGuess] = useState("");
    const lastRoundRef = useRef(0);

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
        const response = await fetch(sessionUrl, {
            headers: { Accept: "application/json" },
        });
        if (response.ok) {
            const data = (await response.json()) as SessionResponse;
            setSessionState(data.session.state);
        }
    }, [sessionUrl]);

    useEffect(() => {
        if (!sessionUrl) return;
        fetchSession();
        const interval = window.setInterval(fetchSession, 4000);
        return () => window.clearInterval(interval);
    }, [fetchSession, sessionUrl]);

    useEffect(() => {
        if (!sessionState?.rounds || sessionState.rounds <= lastRoundRef.current) return;
        if (sessionState.phase !== "result") return;
        lastRoundRef.current = sessionState.rounds;
        const score = sessionState.is_match ? 80 : 40;
        onGameOver(score, {
            session_id: sessionId,
            round: sessionState.rounds,
            is_match: sessionState.is_match ? 1 : 0,
        });
    }, [onGameOver, sessionId, sessionState]);

    const sendMove = async (payload: Record<string, string>) => {
        if (!sessionMoveUrl) return;
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
            body: JSON.stringify(payload),
        });
        await fetchSession();
    };

    const handleAsk = async (event: React.FormEvent) => {
        event.preventDefault();
        await sendMove({ action: "ask", prompt, answer });
        setPrompt("");
        setAnswer("");
    };

    const handleGuess = async (event: React.FormEvent) => {
        event.preventDefault();
        await sendMove({ action: "guess", guess });
        setGuess("");
    };

    const handleReset = async () => {
        await sendMove({ action: "reset" });
    };

    const startNewSession = () => {
        const newId = Math.random().toString(36).slice(2, 8);
        localStorage.setItem("couple-quiz-session", newId);
        lastRoundRef.current = 0;
        setSessionId(newId);
    };

    const joinSession = (event: React.FormEvent) => {
        event.preventDefault();
        if (sessionId) {
            localStorage.setItem("couple-quiz-session", sessionId);
            lastRoundRef.current = 0;
            fetchSession();
        }
    };

    const isCurrentTurn = currentUserId && sessionState?.current_turn_user_id === currentUserId;

    return (
        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Couple Quiz</h3>
                    <p className="text-sm text-gray-500">
                        Ask a sweet question, then let your partner answer.
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

            <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-pink-500">
                        Session
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                        {sessionId || "—"}
                    </div>
                </div>

                {sessionState?.phase === "ask" && (
                    <form onSubmit={handleAsk} className="space-y-3">
                        <input
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            placeholder="Ask something fun"
                            className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm shadow-sm focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                            required
                            disabled={!isCurrentTurn}
                        />
                        <input
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            placeholder="Your answer"
                            className="w-full rounded-2xl border border-purple-100 px-4 py-2 text-sm shadow-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                            required
                            disabled={!isCurrentTurn}
                        />
                        <button
                            type="submit"
                            disabled={!isCurrentTurn}
                            className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 disabled:opacity-50"
                        >
                            Share with partner
                        </button>
                    </form>
                )}

                {sessionState?.phase === "guess" && (
                    <form onSubmit={handleGuess} className="space-y-3">
                        <div className="rounded-2xl border border-purple-100 bg-white/80 px-4 py-3 text-sm text-gray-700">
                            {sessionState.prompt || "Waiting for a question..."}
                        </div>
                        <input
                            value={guess}
                            onChange={(event) => setGuess(event.target.value)}
                            placeholder="Your guess"
                            className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm shadow-sm focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                            required
                            disabled={!isCurrentTurn}
                        />
                        <button
                            type="submit"
                            disabled={!isCurrentTurn}
                            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50"
                        >
                            Submit guess
                        </button>
                    </form>
                )}

                {sessionState?.phase === "result" && (
                    <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-700 space-y-2">
                        <div>
                            {sessionState.is_match
                                ? "Perfect match!"
                                : "Close! Try another question."}
                        </div>
                        <div className="text-xs text-green-600">
                            Answer: {sessionState.answer}
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-600"
                        >
                            Next round
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
