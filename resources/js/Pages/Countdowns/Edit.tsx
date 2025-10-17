import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface FormData {
    event_name: string;
    event_date: string;
    description: string;
    activities: string[];
    image?: File | null;
    _method?: string;
}

export default function CountdownEdit({
    countdown,
}: {
    countdown: any | undefined;
}) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        event_name: countdown?.event_name || "",
        event_date: countdown?.event_date
            ? new Date(countdown.event_date).toISOString().split("T")[0]
            : "",
        description: countdown?.description || "",
        activities: countdown?.activities || [],
        image: null,
    });

    const handleActivityChange = (index: number, value: string) => {
        const newActivities = [...data.activities];
        newActivities[index] = value;
        setData("activities", newActivities);
    };

    const addActivity = () => {
        setData("activities", [...data.activities, ""]);
    };

    const removeActivity = (index: number) => {
        const newActivities = data.activities.filter((_, i) => i !== index);
        setData("activities", newActivities);
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route("countdown.update", { spaceId: countdown.space_id, id: countdown.id }), {
            forceFormData: true,
        });
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

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Deskripsi
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 transition"
                        />
                        {errors.description && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Gambar
                        </label>
                        <input
                            type="file"
                            onChange={(e) =>
                                setData("image", e.target.files ? e.target.files[0] : null)
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 transition"
                        />
                        {errors.image && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Aktivitas
                        </label>
                        {data.activities.map((activity, index) => (
                            <div key={index} className="flex items-center mt-2">
                                <input
                                    type="text"
                                    value={activity}
                                    onChange={(e) =>
                                        handleActivityChange(index, e.target.value)
                                    }
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeActivity(index)}
                                    className="ml-2 text-red-500"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addActivity}
                            className="mt-2 text-purple-600"
                        >
                            + Tambah Aktivitas
                        </button>
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
