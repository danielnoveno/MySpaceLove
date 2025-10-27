import LoveCursorCanvas from "@/Components/LoveCursorCanvas";
import ConfirmDialog from "@/Components/ConfirmDialog";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { Head, Link, router } from "@inertiajs/react";
import {
    Calendar,
    Edit,
    Images,
    ImagePlus,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";

type GalleryMediaItem = {
    id: number;
    title: string | null;
    file_path: string;
    type: string | null;
    url: string;
    collection_index: number;
};

type GalleryCollection = {
    collection_key: string | null;
    title: string | null;
    created_at?: string | null;
    count: number;
    items: GalleryMediaItem[];
};

const formatFullDate = (value?: string | null) => {
    if (!value) {
        return "";
    }
    try {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(value));
    } catch {
        return value;
    }
};

export default function GalleryIndex({
    collections,
}: {
    collections: GalleryCollection[];
}) {
    const currentSpace = useCurrentSpace();
    const [activeCollection, setActiveCollection] =
        useState<GalleryCollection | null>(null);
    const [preview, setPreview] = useState<GalleryMediaItem | null>(null);
    const [pendingDelete, setPendingDelete] = useState<GalleryMediaItem | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const nonEmptyCollections = useMemo(
        () => collections.filter((collection) => collection.items.length > 0),
        [collections],
    );

    const openCollection = (collection: GalleryCollection) => {
        setActiveCollection(collection);
        setPreview(collection.items[0] ?? null);
    };

    const closeCollection = () => {
        setActiveCollection(null);
        setPreview(null);
    };

    const performDelete = () => {
        if (!pendingDelete) {
            return;
        }
        setDeleting(true);
        router.delete(
            route("gallery.destroy", { space: spaceSlug, id: pendingDelete.id }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDelete(null);
                },
                onError: () => {
                    setPendingDelete(null);
                },
                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.42em] text-emerald-400">
                        Album kenangan
                    </p>
                    <h2 className="text-3xl font-semibold text-emerald-900">
                        Gallery Photos — {spaceTitle}
                    </h2>
                </div>
            }
        >
            <Head title={`Gallery - ${spaceTitle}`} />
            <LoveCursorCanvas
                color="#10b981"
                heartCount={28}
                className="opacity-60"
            />

            <div className="relative mx-auto max-w-6xl space-y-10 px-4 pb-20 sm:px-6 lg:px-8">
                <section className="rounded-[32px] border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.42em] text-emerald-400">
                                Koleksi visual
                            </p>
                            <h3 className="text-2xl font-semibold text-emerald-900">
                                Simpan cerita dalam grid minimalis
                            </h3>
                            <p className="mt-1 text-sm text-emerald-700/80">
                                Foto yang diunggah bersamaan otomatis dikelompokkan agar
                                tetap rapi seperti galeri iPhone kalian.
                            </p>
                        </div>
                        <Link
                            href={route("gallery.create", { space: spaceSlug })}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Upload Koleksi
                        </Link>
                    </div>
                </section>

                {nonEmptyCollections.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-emerald-200 bg-white/85 py-16 text-center shadow-inner">
                        <p className="text-lg font-semibold text-emerald-800">
                            Galerinya masih kosong.
                        </p>
                        <p className="mt-2 text-sm text-emerald-600">
                            Unggah beberapa foto sekaligus untuk membuat album favorit
                            kalian.
                        </p>
                    </div>
                ) : (
                    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [column-fill:_balance]">
                        {nonEmptyCollections.map((collection) => {
                            const cover = collection.items[0];
                            const coverUrl =
                                cover?.url ??
                                "https://placehold.co/600x800?text=Gallery";

                            return (
                                <article
                                    key={
                                        collection.collection_key ?? `collection-${cover?.id}`
                                    }
                                    className="group mb-4 break-inside-avoid rounded-3xl bg-white/95 shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-emerald-100"
                                >
                                    <button
                                        type="button"
                                        onClick={() => openCollection(collection)}
                                        className="relative block w-full overflow-hidden rounded-3xl"
                                    >
                                        <img
                                            src={coverUrl}
                                            alt={collection.title ?? "Koleksi galeri"}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-90" />
                                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-5 text-left text-white">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {collection.title?.trim() ||
                                                        "Koleksi tanpa judul"}
                                                </p>
                                                <p className="text-xs text-white/80">
                                                    {formatFullDate(collection.created_at)}
                                                </p>
                                            </div>
                                            {collection.count > 1 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                                    <Images className="h-3.5 w-3.5" />
                                                    {collection.count}
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    <div className="flex items-center justify-between px-4 pb-4 pt-3 text-xs text-slate-500">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                            <ImagePlus className="h-3.5 w-3.5" />
                                            Koleksi
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={route("gallery.edit", {
                                                    space: spaceSlug,
                                                    id: cover?.id,
                                                })}
                                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Edit Sampul
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {activeCollection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 sm:px-6">
                    <div
                        className="absolute inset-0"
                        onClick={closeCollection}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 flex w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl">
                        <button
                            type="button"
                            onClick={closeCollection}
                            className="absolute right-5 top-5 z-20 rounded-full bg-black/60 p-2 text-white transition hover:bg-black"
                            aria-label="Tutup detail galeri"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="grid gap-6 px-6 pb-8 pt-16 sm:px-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                            <div className="flex flex-col gap-4">
                                {preview ? (
                                    <div className="overflow-hidden rounded-[28px] bg-slate-100 shadow-inner">
                                        <img
                                            src={preview.url}
                                            alt={preview.title ?? "Preview galeri"}
                                            className="max-h-[480px] w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                                        Pilih foto untuk melihat preview besar.
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-5">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.36em] text-emerald-400">
                                        Koleksi foto
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                                        {activeCollection.title?.trim() ||
                                            "Koleksi tanpa judul"}
                                    </h3>
                                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        {formatFullDate(activeCollection.created_at)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {activeCollection.count} foto tersimpan
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {activeCollection.items.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setPreview(item)}
                                            className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${preview?.id === item.id ? "ring-2 ring-emerald-400" : ""}`}
                                        >
                                            <img
                                                src={item.url}
                                                alt={item.title ?? "Foto galeri"}
                                                className="h-32 w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />
                                            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setPendingDelete(item);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 backdrop-blur hover:bg-rose-500/90"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Hapus
                                                </button>
                                                <Link
                                                    href={route("gallery.edit", {
                                                        space: spaceSlug,
                                                        id: item.id,
                                                    })}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 backdrop-blur hover:bg-emerald-500/90"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Hapus foto dari galeri?"
                description="Foto yang dihapus tidak dapat dikembalikan. Koleksi akan diperbarui secara otomatis."
                confirmLabel="Ya, hapus foto"
                cancelLabel="Batal"
                tone="danger"
                loading={deleting}
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
