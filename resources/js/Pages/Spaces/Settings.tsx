import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

interface Space {
    id: number;
    title: string;
    bio: string;
    is_public: boolean;
}

export default function SpaceSettings({ space }: { space: Space }) {
    const { data, setData, put, processing, errors } = useForm({
        title: space.title || "",
        bio: space.bio || "",
        is_public: space.is_public || false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("space.update", space.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Space Settings
                </h2>
            }
        >
            <Head title="Space Settings" />

            <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-6">
                <form onSubmit={submit}>
                    <div>
                        <label className="block text-gray-700 font-medium">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                        />
                        {errors.title && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Bio
                        </label>
                        <textarea
                            value={data.bio}
                            onChange={(e) => setData("bio", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                            rows={4}
                        />
                        {errors.bio && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.bio}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 flex items-center">
                        <label className="block text-gray-700 font-medium">
                            Publik?
                        </label>
                        <input
                            type="checkbox"
                            checked={data.is_public}
                            onChange={(e) =>
                                setData("is_public", e.target.checked)
                            }
                            className="ml-2 border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                        />
                        {errors.is_public && (
                            <p className="ml-2 text-red-500 text-sm">
                                {errors.is_public}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full"
                    >
                        Update Settings
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
