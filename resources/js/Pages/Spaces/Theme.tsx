import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function SpaceTheme({
    themes,
    currentTheme,
}: {
    themes: any[];
    currentTheme: any;
}) {
    const { data, setData, put, processing, errors } = useForm<{
        theme_id: number | string;
    }>({
        theme_id: currentTheme.id || "",
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("space.theme.update"));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Pilih Tema
                </h2>
            }
        >
            <Head title="Pilih Tema" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`p-4 bg-white shadow-md rounded-xl border ${
                                data.theme_id === theme.id
                                    ? "border-indigo-500"
                                    : "border-gray-100"
                            } hover:shadow-xl transition duration-200 cursor-pointer`}
                            onClick={() => setData("theme_id", theme.id)}
                        >
                            <img
                                src={`/storage/${theme.preview_image}`}
                                alt={theme.name}
                                className="rounded-lg w-full h-32 object-cover"
                            />
                            <h4 className="font-semibold text-gray-800 mt-2">
                                {theme.name}
                            </h4>
                        </div>
                    ))}
                </div>

                <button
                    onClick={submit}
                    disabled={processing}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 w-full max-w-xs mx-auto block"
                >
                    Simpan Tema
                </button>
            </div>
        </AuthenticatedLayout>
    );
}
