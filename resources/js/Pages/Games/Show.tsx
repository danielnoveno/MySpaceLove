import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import SlitherGame from "@/Pages/Games/components/SlitherGame";
import TetrisGame from "@/Pages/Games/components/TetrisGame";
import PongDuetGame from "@/Pages/Games/components/PongDuetGame";
import ConnectFourGame from "@/Pages/Games/components/ConnectFourGame";
import MemoryMatchGame from "@/Pages/Games/components/MemoryMatchGame";
import MazeEscapeGame from "@/Pages/Games/components/MazeEscapeGame";
import CoupleQuizGame from "@/Pages/Games/components/CoupleQuizGame";

interface GameInfo {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    supports_multiplayer?: boolean;
}

interface LeaderboardEntry {
    id: number;
    user_id: number;
    user_name: string;
    score: number;
    created_at: string | null;
}

interface LeaderboardResponse {
    scores: LeaderboardEntry[];
    personal_best: number | null;
    partner_best: {
        user_id: number;
        user_name: string;
        score: number | null;
    } | null;
}

interface Props {
    game: GameInfo;
    scoreRoute: string;
    leaderboardRoute: string;
    sessionRoute: string;
    sessionMoveRoute: string;
}

export default function GamesShow({
    game,
    scoreRoute,
    leaderboardRoute,
    sessionRoute,
    sessionMoveRoute,
}: Props) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(
        null
    );
    const [latestScore, setLatestScore] = useState<number | null>(null);
    const [saveState, setSaveState] = useState<
        "idle" | "saving" | "saved" | "error"
    >("idle");

    const fetchLeaderboard = useCallback(async () => {
        const response = await fetch(leaderboardRoute, {
            headers: { Accept: "application/json" },
        });

        if (response.ok) {
            const data = (await response.json()) as LeaderboardResponse;
            setLeaderboard(data);
        }
    }, [leaderboardRoute]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const csrfToken = useMemo(() => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") ?? ""
        );
    }, []);

    const submitScore = useCallback(
        async (score: number, meta?: Record<string, string | number | boolean | null>) => {
            setLatestScore(score);
            setSaveState("saving");

            try {
                const response = await fetch(scoreRoute, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ score, meta }),
                });

                if (!response.ok) {
                    throw new Error("Score save failed");
                }

                setSaveState("saved");
                await fetchLeaderboard();
            } catch (error) {
                setSaveState("error");
            }
        },
        [csrfToken, fetchLeaderboard, scoreRoute]
    );

    const partnerBestLabel = leaderboard?.partner_best?.score ?? "—";
    const personalBestLabel = leaderboard?.personal_best ?? "—";
    const hasSessionGames = ["connect-four", "couple-quiz"].includes(game.slug);

    const gameView = useMemo(() => {
        switch (game.slug) {
            case "tetris":
                return <TetrisGame onGameOver={submitScore} />;
            case "slither":
                return <SlitherGame onGameOver={submitScore} />;
            case "pong-duet":
                return <PongDuetGame onGameOver={submitScore} />;
            case "connect-four":
                return (
                    <ConnectFourGame
                        onGameOver={submitScore}
                        sessionRoute={sessionRoute}
                        sessionMoveRoute={sessionMoveRoute}
                    />
                );
            case "memory-match":
                return <MemoryMatchGame onGameOver={submitScore} />;
            case "maze-escape":
                return <MazeEscapeGame onGameOver={submitScore} />;
            case "couple-quiz":
                return (
                    <CoupleQuizGame
                        onGameOver={submitScore}
                        sessionRoute={sessionRoute}
                        sessionMoveRoute={sessionMoveRoute}
                    />
                );
            default:
                return (
                    <div className="rounded-3xl border border-dashed border-purple-200 bg-white/70 p-8 text-center text-sm text-gray-500">
                        This game is coming soon. Check back for new updates!
                    </div>
                );
        }
    }, [game.slug, sessionMoveRoute, sessionRoute, submitScore]);

    return (
        <AuthenticatedLayout>
            <Head title={game.name} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route("games.index")}
                            className="text-sm font-semibold text-pink-500 hover:text-pink-600"
                        >
                            ← Back to Games Hub
                        </Link>
                        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
                            {game.name}
                        </h1>
                        {game.description && (
                            <p className="mt-2 text-gray-600">
                                {game.description}
                            </p>
                        )}
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-white/90 px-4 py-3 text-sm text-gray-600 shadow-sm">
                        Our Records are private to your Space.
                        {game.supports_multiplayer && (
                            <div className="mt-1 text-xs text-purple-500">
                                Multiplayer mode is ready for your partner.
                            </div>
                        )}
                        {hasSessionGames && (
                            <div className="mt-1 text-xs text-purple-500">
                                Share a session code to take turns together.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="space-y-6">
                        {gameView}
                        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Game Recap
                            </h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
                                    <div className="text-xs uppercase tracking-wide text-pink-500">
                                        Latest Score
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {latestScore ?? "—"}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
                                    <div className="text-xs uppercase tracking-wide text-purple-500">
                                        Your Best
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {personalBestLabel}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                                    <div className="text-xs uppercase tracking-wide text-indigo-500">
                                        Partner High
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {partnerBestLabel}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                {saveState === "saving" &&
                                    "Saving your score..."}
                                {saveState === "saved" &&
                                    "Score saved to your space leaderboard."}
                                {saveState === "error" &&
                                    "Unable to save your score. Try again after your next round."}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Our Records
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Space Scores between you and your partner.
                            </p>

                            <div className="mt-4 space-y-3">
                                {leaderboard?.scores?.length ? (
                                    leaderboard.scores.map((entry, index) => (
                                        <div
                                            key={entry.id}
                                            className="flex items-center justify-between rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm"
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    #{index + 1} {entry.user_name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {entry.created_at
                                                        ? new Date(
                                                              entry.created_at
                                                          ).toLocaleString()
                                                        : ""}
                                                </div>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                {entry.score}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 px-4 py-6 text-center text-sm text-gray-500">
                                        No scores yet. Start a match to set the
                                        first record.
                                    </div>
                                )}
                            </div>
                        </div>
                        {leaderboard?.partner_best?.user_name && (
                            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-6 text-sm text-indigo-700">
                                {leaderboard.partner_best.user_name}
                                {"'s"} best score is {partnerBestLabel}. Can you
                                beat it?
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
