import LoveCursorCanvas from "@/Components/LoveCursorCanvas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { Head, Link, router } from "@inertiajs/react";
import { Edit, Eye, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface GalleryItem {
    id: number;
    title: string;
    file_path: string;
}

const rotationFromId = (id: number) => {
    const seed = Math.sin(id * 53.17) * 1000;
    return ((seed - Math.floor(seed)) * 12 - 6).toFixed(2);
};

export default function GalleryIndex({ items }: { items: GalleryItem[] }) {
    const currentSpace = useCurrentSpace();
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const decoratedItems = useMemo(() => {
        return items.map((item, index) => {
            const rotation = Number(rotationFromId(item.id));
            const shadowRotation = rotation > 0 ? rotation - 6 : rotation + 6;

            return {
                ...item,
                index,
                url: `/storage/${item.file_path}`,
                rotation,
                shadowRotation,
            };
        });
    }, [items]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
                        Album kenangan
                    </p>
                    <h2 className="text-3xl font-semibold text-emerald-900">
                        Gallery Photos – {spaceTitle}
                    </h2>
                </div>
            }
        >
            <Head title={`Gallery - ${spaceTitle}`} />
            <LoveCursorCanvas color="#10b981" heartCount={36} className="opacity-60" />

            <div className="relative mx-auto max-w-6xl space-y-10 px-6 pb-16">
                <section className="rounded-[28px] border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
                                Koleksi visual
                            </p>
                            <h3 className="text-2xl font-semibold text-emerald-900">
                                Polaroid memories
                            </h3>
                            <p className="text-sm text-emerald-700/80">
                                Unggah banyak foto sekaligus dan nikmati tumpukan polaroid penuh cerita.
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

                {decoratedItems.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-emerald-200 bg-white/85 py-16 text-center shadow-inner">
                        <p className="text-lg font-semibold text-emerald-800">
                            Belum ada foto tersimpan.
                        </p>
                        <p className="mt-2 text-sm text-emerald-600">
                            Upload beberapa foto sekaligus dan buat album manis kalian. 📸
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {decoratedItems.map((item) => (
                            <article key={item.id} className="relative">
                                <div
                                    className="absolute inset-0 -z-10 rounded-[30px] bg-white/70 shadow-lg transition duration-300 group-hover:translate-x-2 group-hover:-translate-y-2"
                                    style={{ transform: `rotate(${item.shadowRotation}deg)` }}
                                />
                                <div
                                    className="relative overflow-hidden rounded-[30px] border border-emerald-50 bg-white shadow-2xl transition duration-300 hover:-translate-y-2 hover:shadow-emerald-200/60"
                                    style={{ transform: `rotate(${item.rotation}deg)` }}
                                >
                                    <div className="overflow-hidden border-b-4 border-white/70">
                                        <img
                                            src={item.url}
                                            alt={item.title}
                                            className="h-60 w-full object-cover transition duration-500 hover:scale-[1.03]"
                                            onClick={() => setSelectedItem(item)}
                                        />
                                    </div>
                                    <div className="grid gap-4 px-6 pb-6 pt-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-lg font-semibold text-emerald-900">
                                                {item.title || `Foto Ke-${item.index + 1}`}
                                            </p>
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
                                                Polaroid
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-emerald-400">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedItem(item)}
                                                className="inline-flex items-center gap-2 text-emerald-500 transition hover:text-emerald-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Detail
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    href={route("gallery.edit", {
                                                        space: spaceSlug,
                                                        id: item.id,
                                                    })}
                                                    className="inline-flex items-center gap-1 text-yellow-600 transition hover:text-yellow-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Yakin ingin menghapus foto ini dari galeri?",
                                                            )
                                                        ) {
                                                            router.delete(
                                                                route("gallery.destroy", {
                                                                    space: spaceSlug,
                                                                    id: item.id,
                                                                }),
                                                            );
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 text-rose-500 transition hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative flex w-full max-w-3xl flex-col items-center gap-4 overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedItem(null)}
                            className="absolute right-4 top-4 rounded-full bg-black/60 p-1 text-white transition hover:bg-black"
                        >
                            ✕
                        </button>
                        <img
                            src={`/storage/${selectedItem.file_path}`}
                            alt={selectedItem.title}
                            className="max-h-[70vh] w-full rounded-2xl object-contain"
                        />
                        <div className="flex w-full items-center justify-between text-sm text-emerald-700">
                            <p className="font-semibold">
                                {selectedItem.title || "Tanpa judul"}
                            </p>
                            <Link
                                href={route("gallery.edit", {
                                    space: spaceSlug,
                                    id: selectedItem.id,
                                })}
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 font-semibold text-white shadow hover:bg-emerald-600"
                            >
                                <ImagePlus className="h-4 w-4" />
                                Perbarui
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
