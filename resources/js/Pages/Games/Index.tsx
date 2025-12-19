import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

interface GameSummary {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
}

interface Props {
    games: GameSummary[];
    spaceSlug?: string | null;
}

export default function GamesIndex({ games, spaceSlug }: Props) {
    const spaceSuffix = spaceSlug ? `?space=${spaceSlug}` : "";

    return (
        <AuthenticatedLayout>
            <Head title="Games" />
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
                                        New
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
        </AuthenticatedLayout>
    );
}
