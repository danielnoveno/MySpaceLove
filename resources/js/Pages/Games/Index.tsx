import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import TargetCursor from "@/Components/TargetCursor";

interface GameSummary {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    supports_multiplayer?: boolean;
}

interface Props {
    games: GameSummary[];
    spaceSlug?: string | null;
    spaceGoalsRoute: string;
    spaceGoalsStoreRoute: string;
}

interface SpaceGoal {
    id: number;
    title: string;
    description?: string | null;
    target_points: number;
    current_points: number;
    is_active: boolean;
    is_completed?: boolean;
    completed_at?: string | null;
}

export default function GamesIndex({
    games,
    spaceSlug,
    spaceGoalsRoute,
    spaceGoalsStoreRoute,
}: Props) {
    const spaceSuffix = spaceSlug ? `?space=${spaceSlug}` : "";
    const [goals, setGoals] = useState<SpaceGoal[]>([]);
    const [goalTitle, setGoalTitle] = useState("");
    const [goalDescription, setGoalDescription] = useState("");
    const [goalTarget, setGoalTarget] = useState(500);
    const [goalStatus, setGoalStatus] = useState<
        "idle" | "saving" | "saved" | "error"
    >("idle");

    const csrfToken = useMemo(() => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") ?? ""
        );
    }, []);

    const fetchGoals = useCallback(async () => {
        const response = await fetch(spaceGoalsRoute, {
            headers: { Accept: "application/json" },
        });

        if (response.ok) {
            const data = await response.json();
            setGoals(data.goals ?? []);
        }
    }, [spaceGoalsRoute]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const saveGoal = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault();
            setGoalStatus("saving");

            try {
                const response = await fetch(spaceGoalsStoreRoute, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        title: goalTitle,
                        description: goalDescription,
                        target_points: goalTarget,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Unable to save goal");
                }

                setGoalTitle("");
                setGoalDescription("");
                setGoalTarget(500);
                setGoalStatus("saved");
                await fetchGoals();
            } catch (error) {
                setGoalStatus("error");
            }
        },
        [
            csrfToken,
            fetchGoals,
            goalDescription,
            goalTarget,
            goalTitle,
            spaceGoalsStoreRoute,
        ]
    );

    const updateGoal = useCallback(
        async (goal: SpaceGoal) => {
            const response = await fetch(
                `${route("space.goals.update", { goal: goal.id })}${spaceSuffix}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        title: goal.title,
                        description: goal.description ?? "",
                        target_points: goal.target_points,
                        is_active: goal.is_active,
                    }),
                }
            );

            if (response.ok) {
                await fetchGoals();
            }
        },
        [csrfToken, fetchGoals, spaceSuffix]
    );

    const completeGoal = useCallback(
        async (goalId: number) => {
            const response = await fetch(
                `${route("space.goals.complete", { goal: goalId })}${spaceSuffix}`,
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                }
            );

            if (response.ok) {
                await fetchGoals();
            }
        },
        [csrfToken, fetchGoals, spaceSuffix]
    );

    return (
        <AuthenticatedLayout showSplashCursor={false}>
            <Head title="Games" />
            <TargetCursor 
                targetSelector="a, button, input, textarea, .cursor-target"
                hideDefaultCursor={true}
                spinDuration={2}
                parallaxOn={true}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Games Hub
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Pick a quick match, earn a score, and compare with your
                        partner in your private space.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div>
                        {games.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-purple-200 bg-white/70 p-8 text-center text-gray-500">
                                No games available yet. Check back soon!
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                {games.map((game) => (
                                    <div
                                        key={game.id}
                                        className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    {game.name}
                                                </h2>
                                                <p className="mt-2 text-sm text-gray-600">
                                                    {game.description}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
                                                {game.supports_multiplayer
                                                    ? "Multiplayer"
                                                    : "Solo"}
                                            </span>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Space Scores only
                                            </span>
                                            <Link
                                                href={`${route("games.show", {
                                                    slug: game.slug,
                                                })}${spaceSuffix}`}
                                                className="inline-flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
                                            >
                                                Play now
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Space Goals
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Set milestones together and track progress from
                                every game score.
                            </p>
                            <div className="mt-4 space-y-4">
                                {goals.length ? (
                                    goals.map((goal) => {
                                        const progress = Math.min(
                                            100,
                                            Math.round(
                                                (goal.current_points /
                                                    goal.target_points) *
                                                    100
                                            )
                                        );
                                        const isCompleted =
                                            goal.is_completed ||
                                            progress >= 100 ||
                                            !goal.is_active;
                                        return (
                                            <div
                                                key={goal.id}
                                                className="rounded-2xl border border-pink-100 bg-pink-50/70 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <input
                                                            value={goal.title}
                                                            onChange={(event) =>
                                                                setGoals((prev) =>
                                                                    prev.map(
                                                                        (item) =>
                                                                            item.id ===
                                                                            goal.id
                                                                                ? {
                                                                                      ...item,
                                                                                      title: event
                                                                                          .target
                                                                                          .value,
                                                                                  }
                                                                                : item
                                                                    )
                                                                )
                                                            }
                                                            className={`w-full rounded-lg border border-transparent bg-transparent text-sm font-semibold text-gray-900 focus:border-pink-200 focus:ring-2 focus:ring-pink-200 ${
                                                                isCompleted
                                                                    ? "line-through text-gray-400"
                                                                    : ""
                                                            }`}
                                                        />
                                                        <textarea
                                                            value={
                                                                goal.description ??
                                                                ""
                                                            }
                                                            onChange={(event) =>
                                                                setGoals((prev) =>
                                                                    prev.map(
                                                                        (item) =>
                                                                            item.id ===
                                                                            goal.id
                                                                                ? {
                                                                                      ...item,
                                                                                      description:
                                                                                          event
                                                                                              .target
                                                                                              .value,
                                                                                  }
                                                                                : item
                                                                    )
                                                                )
                                                            }
                                                            rows={2}
                                                            className={`mt-2 w-full rounded-lg border border-transparent bg-transparent text-xs text-gray-600 focus:border-purple-200 focus:ring-2 focus:ring-purple-200 ${
                                                                isCompleted
                                                                    ? "line-through text-gray-400"
                                                                    : ""
                                                            }`}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateGoal(goal)
                                                        }
                                                        className="rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-600"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>
                                                            {goal.current_points}{" "}
                                                            / {goal.target_points}{" "}
                                                            pts
                                                        </span>
                                                        <span>
                                                            {progress}%
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 h-2 rounded-full bg-white">
                                                        <div
                                                            className="h-2 rounded-full bg-pink-400"
                                                            style={{
                                                                width: `${progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                                                            Done
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                completeGoal(
                                                                    goal.id
                                                                )
                                                            }
                                                            className="text-pink-500 hover:text-pink-600"
                                                        >
                                                            Mark complete
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mt-3">
                                                    <label className="text-[10px] uppercase tracking-wide text-gray-500">
                                                        Target points
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={1000000}
                                                        value={goal.target_points}
                                                        onChange={(event) =>
                                                            setGoals((prev) =>
                                                                prev.map(
                                                                    (item) =>
                                                                        item.id ===
                                                                        goal.id
                                                                            ? {
                                                                                  ...item,
                                                                                  target_points:
                                                                                      Number(
                                                                                          event
                                                                                              .target
                                                                                              .value
                                                                                      ),
                                                                              }
                                                                            : item
                                                                )
                                                            )
                                                        }
                                                        className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-3 py-1 text-xs shadow-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 px-4 py-6 text-center text-sm text-gray-500">
                                        No goals yet. Add one to motivate your
                                        next game night.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Add a goal
                            </h2>
                            <form onSubmit={saveGoal} className="mt-4 space-y-3">
                                <input
                                    value={goalTitle}
                                    onChange={(event) =>
                                        setGoalTitle(event.target.value)
                                    }
                                    placeholder="Goal title"
                                    className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm shadow-sm focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                                    required
                                />
                                <textarea
                                    value={goalDescription}
                                    onChange={(event) =>
                                        setGoalDescription(event.target.value)
                                    }
                                    placeholder="What are you celebrating?"
                                    rows={3}
                                    className="w-full rounded-2xl border border-purple-100 px-4 py-2 text-sm shadow-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                                />
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500">
                                        Target points
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={1000000}
                                        value={goalTarget}
                                        onChange={(event) =>
                                            setGoalTarget(
                                                Number(event.target.value)
                                            )
                                        }
                                        className="mt-1 w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm shadow-sm focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
                                >
                                    Save goal
                                </button>
                                <div className="text-xs text-gray-500">
                                    {goalStatus === "saving" &&
                                        "Saving your goal..."}
                                    {goalStatus === "saved" &&
                                        "Goal saved for your space."}
                                    {goalStatus === "error" &&
                                        "Unable to save goal. Try again."}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
