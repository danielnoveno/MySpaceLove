import ConfirmDialog from "@/Components/ConfirmDialog";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useCallback, useState } from "react";

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
    const [pendingDelete, setPendingDelete] = useState<JournalItem | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    const handleDelete = () => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        router.delete(
            route("journal.destroy", {
                space: spaceSlug,
                id: pendingDelete.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDelete(null);
                },
                onError: () => {
                    setPendingDelete(null);
                },
                onFinish: () => setDeleting(false),
            },
        );
    };

    const promptDelete = useCallback((item: JournalItem) => {
        setPendingDelete(item);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm uppercase tracking-[0.35em] text-amber-500">
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
                <section className="relative overflow-hidden rounded-[28px] border border-amber-100/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 p-8 shadow-sm backdrop-blur">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#fbbf24_0,transparent_60%)] opacity-40" />
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-amber-400">
                                Rak memori
                            </p>
                            <h3 className="text-2xl font-semibold text-amber-900">
                                Jurnal Cinta Kita 💌
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
                </section>

                {items.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-amber-200 bg-white/85 py-16 text-center shadow-inner">
                        <p className="text-lg font-semibold text-amber-800">
                            No entries yet.
                        </p>
                        <p className="mt-2 text-sm text-amber-600">
                            Start writing your first story today. ✍️
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
                                    className="group relative overflow-hidden rounded-[28px] border border-amber-100/80 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-white/90" />
                                    <div className="pointer-events-none absolute inset-y-6 left-1/2 h-[calc(100%-48px)] w-px -translate-x-1/2 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200" />
                                    <div className="pointer-events-none absolute inset-6 rounded-[22px] border border-amber-100/70" />

                                    <div className="relative grid gap-6 md:grid-cols-[1.2fr,1fr]">
                                        <div className="px-8 pb-10 pt-10 md:pr-6">
                                            <header className="space-y-2">
                                                <p className="text-xs uppercase tracking-[0.28em] text-amber-400">
                                                    {formatDate(item.created_at)}
                                                </p>
                                                <h4 className="text-2xl font-semibold text-amber-900">
                                                    {item.title}
                                                </h4>
                                            </header>

                                            <p className="mt-5 line-clamp-5 whitespace-pre-line text-amber-800/90">
                                                {item.content}
                                            </p>
                                        </div>

                                        <aside className="flex h-full flex-col justify-between rounded-tr-[26px] rounded-br-[26px] border-t border-amber-100/70 bg-amber-50/70 px-8 py-10 md:border-l md:border-t-0">
                                            <div className="space-y-3">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
                                                    Mood {moodLabel || "Netral"}
                                                </span>
                                                <p className="text-sm text-amber-700/80">
                                                    Simpan tulisan ini dan ajak pasanganmu membaca ulang saat butuh penguat hati.
                                                </p>
                                            </div>
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
                                                    type="button"
                                                    onClick={() => promptDelete(item)}
                                                    className="rounded-full border border-rose-200 px-4 py-1 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </aside>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <ConfirmDialog
                    open={pendingDelete !== null}
                    title={
                        pendingDelete
                            ? `Hapus catatan jurnal "${pendingDelete.title}"?`
                            : "Hapus catatan jurnal?"
                    }
                    description={
                        pendingDelete
                            ? `Catatan "${pendingDelete.title}" akan dihapus permanen dari jurnal.`
                            : "Catatan akan dihapus permanen dari jurnal."
                    }
                    confirmLabel="Ya, hapus jurnal"
                    cancelLabel="Batal"
                    tone="danger"
                    loading={deleting}
                    onCancel={() => {
                        if (!deleting) {
                            setPendingDelete(null);
                        }
                    }}
                    onConfirm={handleDelete}
                />
            </div>
        </AuthenticatedLayout>
    );
}


