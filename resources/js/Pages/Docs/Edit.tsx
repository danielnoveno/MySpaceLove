import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface DocItem {
    id: number;
    title: string;
    file_path: string;
    notes: string;
}

export default function DocsEdit({ item }: { item: DocItem }) {
    const { data, setData, put, processing, errors } = useForm({
        title: item.title || "",
        file: null as File | null,
        notes: item.notes || "",
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("docs.update", item.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Edit Dokumen
                </h2>
            }
        >
            <Head title="Edit Dokumen" />

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
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 transition"
                        />
                        {errors.title && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            File
                        </label>
                        <input
                            type="file"
                            onChange={(e) =>
                                setData("file", e.target.files?.[0] || null)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 transition"
                        />
                        {item.file_path && (
                            <a
                                href={`/storage/${item.file_path}`}
                                target="_blank"
                                className="mt-2 text-blue-500 hover:underline"
                            >
                                Lihat File Saat Ini
                            </a>
                        )}
                        {errors.file && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.file}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Notes
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 transition"
                            rows={4}
                        />
                        {errors.notes && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update Dokumen
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
