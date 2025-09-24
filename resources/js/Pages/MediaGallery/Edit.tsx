import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface MediaGalleryItem {
    id: number;
    title: string;
    file_path: string | null;
    [key: string]: any; // Allow other properties
}

export default function GalleryEdit({ item }: { item: MediaGalleryItem }) {
    const { data, setData, put, processing, errors } = useForm<{
        title: string;
        file: File | null;
    }>({
        title: item.title || "",
        file: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("gallery.update", item.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Edit Galeri
                </h2>
            }
        >
            <Head title="Edit Galeri" />

            <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-6">
                <form onSubmit={submit}>
                    <div>
                        <label className="block text-gray-700 font-medium">
                            Judul
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 transition"
                        />
                        {errors.title && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            File (Foto/Video)
                        </label>
                        <input
                            type="file"
                            onChange={(e) =>
                                setData("file", e.target.files?.[0] || null)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 transition"
                        />
                        {item.file_path && (
                            <img
                                src={`/storage/${item.file_path}`}
                                alt="Current File"
                                className="mt-2 rounded-lg w-full h-32 object-cover"
                            />
                        )}
                        {errors.file && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.file}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
