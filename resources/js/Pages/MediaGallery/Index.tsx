import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function GalleryIndex({ items }: { items: any[] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">Gallery</h2>
            }
        >
            <Head title="Gallery" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-green-700">
                        Galeri Kenangan Kita 📸
                    </h3>
                    <Link
                        href={route("gallery.create")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                    >
                        + Upload
                    </Link>
                </div>

                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Belum ada foto/video. Upload momenmu! ✨
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition duration-200"
                            >
                                <img
                                    src={`/storage/${item.file_path}`}
                                    alt={item.title}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <h4 className="font-semibold text-gray-800 mt-2">
                                    {item.title || "Untitled"}
                                </h4>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={route("gallery.edit", item.id)}
                                        className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            confirm("Yakin hapus?") &&
                                            router.delete(
                                                route(
                                                    "gallery.destroy",
                                                    item.id
                                                )
                                            )
                                        }
                                        className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
