import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface FormData {
    event_name: string;
    event_date: string;
}

export default function CountdownEdit({ item }: { item: any }) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        event_name: item.event_name || "",
        event_date: item.event_date || "",
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("countdown.update", item.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Edit Countdown
                </h2>
            }
        >
            <Head title="Edit Countdown" />

            <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-6">
                <form onSubmit={submit}>
                    <div>
                        <label className="block text-gray-700 font-medium">
                            Nama Event
                        </label>
                        <input
                            type="text"
                            value={data.event_name}
                            onChange={(e) =>
                                setData("event_name", e.target.value)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 transition"
                        />
                        {errors.event_name && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.event_name}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Tanggal Event
                        </label>
                        <input
                            type="date"
                            value={data.event_date}
                            onChange={(e) =>
                                setData("event_date", e.target.value)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 transition"
                        />
                        {errors.event_date && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.event_date}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update Countdown
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
