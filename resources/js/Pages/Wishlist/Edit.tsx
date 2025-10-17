import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function WishlistEdit({ item }: { item: any }) {
    const { data, setData, put, processing, errors } = useForm<{
        title: string;
        description: string;
        location: string;
        status: string;
        notes: string;
    }>({
        title: item.title || "",
        description: item.description || "",
        location: item.location || "",
        status: item.status || "pending",
        notes: item.notes || "",
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("wishlist.update", item.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Edit Wishlist
                </h2>
            }
        >
            <Head title="Edit Wishlist" />

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
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition"
                        />
                        {errors.title && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Deskripsi
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition"
                            rows={4}
                        />
                        {errors.description && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Lokasi
                        </label>
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) =>
                                setData("location", e.target.value)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition"
                        />
                        {errors.location && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.location}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition"
                        >
                            <option value="pending">Pending</option>
                            <option value="done">Done</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.status}
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
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition"
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
                        className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update Wishlist
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
