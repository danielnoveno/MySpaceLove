import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

interface JournalItem {
    id: number;
    title: string;
    content: string;
    mood?: string | null;
    created_at?: string;
}

interface SpaceSummary {
    id: number;
    slug: string;
    title: string;
}

interface Props {
    items: JournalItem[];
    space: SpaceSummary;
}

const moodLabels: Record<string, string> = {
    happy: "Bahagia",
    sad: "Sedih",
    miss: "Rindu",
    excited: "Semangat",
};

export default function JournalIndex({ items, space }: Props) {
    const spaceSlug = space.slug;
    const spaceTitle = space.title;

    const formatDate = (value?: string) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch (error) {
            return value;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-amber-500 uppercase tracking-[0.35em]">
                        Catatan cinta
                    </p>
                    <h2 className="text-3xl font-semibold text-amber-900">
                        Journal {spaceTitle}
                    </h2>
                </div>
            }
        >
            <Head title={`Journal - ${spaceTitle}`} />

            <div className="relative mx-auto max-w-6xl space-y-10 px-6 pb-16">
                <div className="flex flex-col gap-4 rounded-[32px] bg-gradient-to-r from-amber-100/70 via-white to-orange-50 p-8 shadow-lg">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-amber-400">
                                Rak memori
                            </p>
                            <h3 className="text-2xl font-semibold text-amber-900">
                                Jurnal Cinta Kita 📖
                            </h3>
                            <p className="text-sm text-amber-700/80">
                                Tuliskan setiap perasaan, biar jadi kisah yang bisa dibaca lagi nanti.
                            </p>
                        </div>
                        <Link
                            href={route("journal.create", { space: spaceSlug })}
                            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600"
                        >
                            + Tambah Jurnal
                        </Link>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-amber-200 bg-white/80 py-16 text-center shadow-inner">
                        <p className="text-lg font-semibold text-amber-800">
                            Belum ada catatan.
                        </p>
                        <p className="mt-2 text-sm text-amber-600">
                            Mulai tulis cerita pertamamu hari ini. ✨
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {items.map((item) => {
                            const moodKey = item.mood ?? "";
                            const moodLabel = moodLabels[moodKey] ?? moodKey;

                            return (
                                <article
                                    key={item.id}
                                    className="relative overflow-hidden rounded-[32px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                >
                                    <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200" />
                                    <div className="absolute inset-y-6 right-6 w-8 rounded-full bg-amber-100/70 blur-md" />

                                    <div className="relative px-8 pb-10 pt-10">
                                        <header className="space-y-2">
                                            <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
                                                {formatDate(item.created_at)}
                                            </p>
                                            <h4 className="text-2xl font-semibold text-amber-900">
                                                {item.title}
                                            </h4>
                                        </header>

                                        <p className="mt-4 line-clamp-4 whitespace-pre-line text-amber-800/90">
                                            {item.content}
                                        </p>

                                        <footer className="mt-6 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                                                Mood {moodLabel || "Netral"}
                                            </span>
                                            <div className="flex items-center gap-3 text-sm font-medium text-amber-700">
                                                <Link
                                                    href={route("journal.edit", {
                                                        space: spaceSlug,
                                                        id: item.id,
                                                    })}
                                                    className="rounded-full border border-amber-300 px-4 py-1 transition hover:bg-amber-500 hover:text-white"
                                                >
                                                    Sunting
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        confirm("Yakin hapus?") &&
                                                        router.delete(
                                                            route("journal.destroy", {
                                                                space: spaceSlug,
                                                                id: item.id,
                                                            }),
                                                        )
                                                    }
                                                    className="rounded-full border border-rose-200 px-4 py-1 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </footer>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
