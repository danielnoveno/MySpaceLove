import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { Head, Link, router } from "@inertiajs/react";
import {
    Calendar,
    Edit,
    Heart,
    Images,
    Loader2,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import ConfirmDialog from "@/Components/ConfirmDialog";

interface TimelineItem {
    uuid: string;
    title: string;
    description?: string | null;
    date: string;
    media_paths: string[];
    media_urls: string[];
    thumbnail_path?: string | null;
    thumbnail_url?: string | null;
}

interface Props {
    timelines: TimelineItem[];
    flash?: Record<string, string | undefined>;
}

type MediaOption = {
    path: string;
    url: string;
};

const buildMediaOptions = (item: TimelineItem): MediaOption[] => {
    const paths = item.media_paths ?? [];
    const urls = item.media_urls ?? [];

    return paths.map((path, index) => ({
        path,
        url: urls[index] ?? `/storage/${path}`,
    }));
};

export default function TimelineIndex({ timelines }: Props) {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const [items, setItems] = useState<TimelineItem[]>(timelines);
    const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [thumbnailPending, setThumbnailPending] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<TimelineItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const formatDate = useCallback((value?: string) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return value;
        }
    }, []);

    const handleThumbnailChange = useCallback(
        async (timelineUuid: string, path: string | null) => {
            setThumbnailPending(timelineUuid);
            try {
                await axios.post(route("timeline.thumbnail", {
                    space: spaceSlug,
                    timeline: timelineUuid,
                }), { path });

                setItems((prev) =>
                    prev.map((item) =>
                        item.uuid === timelineUuid
                            ? {
                                  ...item,
                                  thumbnail_path: path,
                                  thumbnail_url: path
                                      ? item.media_urls[
                                            item.media_paths.findIndex((p) => p === path)
                                        ] ?? `/storage/${path}`
                                      : item.media_urls[0] ?? null,
                              }
                            : item,
                    ),
                );
            } catch (error) {
                console.error("Failed to update thumbnail", error);
            } finally {
                setThumbnailPending(null);
            }
        },
        [spaceSlug],
    );

    const confirmDelete = useCallback((item: TimelineItem) => {
        setPendingDelete(item);
    }, []);

    const performDelete = useCallback(() => {
        if (!pendingDelete) {
            return;
        }
        setDeleting(true);

        router.delete(
            route("timeline.destroy", {
                space: spaceSlug,
                timeline: pendingDelete.uuid,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDelete(null);
                    router.visit(
                        route("timeline.index", {
                            space: spaceSlug,
                        }),
                        {
                            preserveScroll: true,
                            replace: true,
                        },
                    );
                },
                onError: () => {
                    setPendingDelete(null);
                },
                onFinish: () => setDeleting(false),
            },
        );
    }, [pendingDelete, spaceSlug]);

    const itemsWithFallback = useMemo(() => {
        return items.map((item) => {
            const media = buildMediaOptions(item);
            const fallback = media[0]?.url ?? null;
            return {
                ...item,
                media,
                coverUrl: item.thumbnail_url ?? fallback,
                coverPath: item.thumbnail_path ?? media[0]?.path ?? null,
            };
        });
    }, [items]);

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#f43f5e",
                heartCount: 48,
                className: "opacity-70",
            }}
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-pink-400">
                        Moment collection
                    </p>
                    <h2 className="text-3xl font-semibold text-pink-900">
                        Love Timeline – {spaceTitle}
                    </h2>
                </div>
            }
        >
        <Head title={`Timeline - ${spaceTitle}`} />

            <div className="relative mx-auto max-w-6xl space-y-10 px-6 pb-16">
                <section className="rounded-[28px] border border-pink-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-pink-400">
                                Galeri kisah
                            </p>
                            <h3 className="text-2xl font-semibold text-pink-900">
                                Susun momen indah kalian
                            </h3>
                            <p className="text-sm text-pink-700/80">
                                Pilih foto yang paling mewakili cerita sebagai cover setiap momen.
                            </p>
                        </div>
                        <Link
                            href={route("timeline.create", { space: spaceSlug })}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Momen
                        </Link>
                    </div>
                </section>

                {itemsWithFallback.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-pink-200 bg-white/85 py-16 text-center shadow-inner">
                        <p className="text-lg font-semibold text-pink-800">
                            Belum ada kenangan tersimpan.
                        </p>
                        <p className="mt-2 text-sm text-pink-600">
                            Mulai tambahkan cerita pertamamu hari ini. ✨
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {itemsWithFallback.map((item) => {
                            const media = item.media as MediaOption[];

                            return (
                                <article
                                    key={item.uuid}
                                    className="group relative overflow-hidden rounded-[26px] border border-pink-100/80 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-50/70 via-transparent to-white" />
                                    <div className="pointer-events-none absolute -left-6 top-8 h-24 w-24 rounded-full bg-pink-200/20 blur-3xl" />
                                    <div className="relative grid gap-6 px-8 pb-10 pt-10">
                                        <div className="relative mx-auto w-full max-w-sm">
                                            <div
                                                className="absolute inset-2 rounded-[24px] border border-pink-100/70 bg-white shadow-md transition group-hover:shadow-lg"
                                            />
                                            <div
                                                className="relative overflow-hidden rounded-[24px] border border-pink-100/80 bg-white shadow-lg transition group-hover:shadow-2xl"
                                            >
                                                {item.coverUrl ? (
                                                    <img
                                                        src={item.coverUrl}
                                                        alt={item.title}
                                                        className="h-64 w-full object-cover"
                                                        onClick={() => setSelectedItem(item)}
                                                    />
                                                ) : (
                                                    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-pink-50 text-pink-400">
                                                        <Images className="h-10 w-10" />
                                                        <span className="text-sm font-medium">
                                                            Belum ada foto
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent px-4 py-3 text-white">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                                                        <Calendar className="h-3 w-3 text-white/80" />
                                                        {formatDate(item.date)}
                                                    </div>
                                                    <h4 className="mt-1 text-lg font-semibold">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[20px] border border-pink-100/80 bg-pink-50/60 p-5">
                                            <p className="line-clamp-3 text-sm text-pink-800/90">
                                                {item.description ?? "Belum ada cerita tertulis."}
                                            </p>
                                            {media.length > 0 && (
                                                <div className="mt-5 space-y-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-pink-400">
                                                        Pilih Cover Foto
                                                    </p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {media.map((option) => {
                                                            const isActive =
                                                                option.path === item.coverPath;
                                                            const isDisabled =
                                                                thumbnailPending === item.uuid;
                                                            return (
                                                                <button
                                                                    key={option.path}
                                                                    type="button"
                                                                    disabled={isDisabled}
                                                                    onClick={() =>
                                                                        handleThumbnailChange(
                                                                            item.uuid,
                                                                            option.path,
                                                                        )
                                                                    }
                                                                    className={`relative h-16 w-16 overflow-hidden rounded-xl border bg-white shadow transition focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                                                                        isActive
                                                                            ? "border-pink-500 ring-2 ring-pink-300"
                                                                            : "border-transparent hover:-translate-y-1"
                                                                    } ${
                                                                        isDisabled
                                                                            ? "cursor-not-allowed opacity-60"
                                                                            : ""
                                                                    }`}
                                                                    aria-label="Pilih thumbnail"
                                                                >
                                                                    <img
                                                                        src={option.url}
                                                                        alt="thumbnail option"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                    {isActive && (
                                                                        <span className="absolute bottom-1 left-1 rounded-full bg-pink-500 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                                                                            aktif
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                        {media.length > 1 && item.coverPath && (
                                                            <button
                                                                type="button"
                                                                disabled={thumbnailPending === item.uuid}
                                                                onClick={() =>
                                                                    handleThumbnailChange(item.uuid, null)
                                                                }
                                                                className="inline-flex items-center justify-center rounded-xl border border-pink-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.24em] text-pink-500 transition hover:bg-pink-100 disabled:opacity-60"
                                                            >
                                                                Reset
                                                            </button>
                                                        )}
                                                        {thumbnailPending === item.uuid && (
                                                            <div className="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs font-medium text-pink-500">
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                Menyimpan...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-pink-700">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Link
                                                        href={route("timeline.edit", {
                                                            space: spaceSlug,
                                                            timeline: item.uuid,
                                                        })}
                                                        className="inline-flex items-center gap-2 rounded-full border border-pink-200 px-4 py-1 transition hover:bg-pink-500 hover:text-white"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Sunting
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(item)}
                                                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-1 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Hapus
                                                    </button>
                                                </div>
                                                {media.length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        className="inline-flex items-center gap-2 rounded-full border border-pink-200 px-4 py-1 transition hover:bg-pink-500 hover:text-white"
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                        Detail
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedItem(null)}
                            className="absolute right-4 top-4 rounded-full bg-black/50 p-1 text-white transition hover:bg-black"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex flex-col gap-8 md:flex-row">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-semibold text-pink-900">
                                    {selectedItem.title}
                                </h3>
                                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.32em] text-pink-400">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(selectedItem.date)}
                                </p>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-pink-800/90">
                                    {selectedItem.description ?? "Belum ada cerita tertulis."}
                                </p>
                            </div>
                            <div className="flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedItem.media_urls.map((url, index) => (
                                        <button
                                            key={`${selectedItem.uuid}-${index}`}
                                            type="button"
                                            onClick={() => setPreviewImage(url)}
                                            className="overflow-hidden rounded-2xl border border-pink-100 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            <img
                                                src={url}
                                                alt={`media-${index}`}
                                                className="h-32 w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="preview"
                        className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
                    />
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                description={
                    pendingDelete
                        ? `Momen timeline "${pendingDelete.title}" akan dihapus dan tidak bisa dikembalikan.`
                        : "Momen akan dihapus dan tidak bisa dikembalikan."
                }
                confirmLabel="Ya, hapus momen"
                cancelLabel="Batal"
                tone="danger"
                loading={deleting}
                title={
                    pendingDelete
                        ? `Hapus momen timeline "${pendingDelete.title}"?`
                        : "Hapus momen timeline?"
                }
                onCancel={() => {
                    if (!deleting) {
                        setPendingDelete(null);
                    }
                }}
                onConfirm={performDelete}
            />
        </AuthenticatedLayout>
    );
}
