import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface FormData {
    date: string;
    message: string;
}

export default function DailyMessageEdit({ msg }: { msg: any }) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        date: msg.date || "",
        message: msg.message || "",
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("daily.update", msg.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Edit Pesan Harian
                </h2>
            }
        >
            <Head title="Edit Pesan Harian" />

            <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-6">
                <form onSubmit={submit}>
                    <div>
                        <label className="block text-gray-700 font-medium">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData("date", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 transition"
                        />
                        {errors.date && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.date}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Pesan
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 transition"
                            rows={4}
                        />
                        {errors.message && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update Pesan
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
