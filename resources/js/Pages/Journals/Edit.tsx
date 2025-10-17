import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface Props {
    journal: {
        id: number;
        title: string;
        content: string;
        mood: string;
    };
    spaceId: number;
}

export default function JournalEdit({ journal, spaceId }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: journal.title || "",
        content: journal.content || "",
        mood: journal.mood || "",
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("journal.update", {spaceId: spaceId, id: journal.id}));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Edit Jurnal
                </h2>
            }
        >
            <Head title="Edit Jurnal" />

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
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
                        />
                        {errors.title && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Isi Jurnal
                        </label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
                            rows={6}
                        />
                        {errors.content && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Mood
                        </label>
                        <select
                            value={data.mood}
                            onChange={(e) => setData("mood", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
                        >
                            <option value="">Pilih Mood</option>
                            <option value="happy">Happy</option>
                            <option value="sad">Sad</option>
                            <option value="miss">Miss</option>
                            <option value="excited">Excited</option>
                        </select>
                        {errors.mood && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.mood}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update Jurnal
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
