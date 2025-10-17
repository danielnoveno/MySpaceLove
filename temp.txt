import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

interface Props {
    items: any[];
    spaceId: number;
}

export default function JournalIndex({ items, spaceId }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">Journal</h2>
            }
        >
            <Head title="Journal" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-700">
                        Jurnal Cinta Kita 📖
                    </h3>
                    <Link
                        href={route("journal.create", { spaceId: spaceId })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                    >
                        + Tambah Jurnal
                    </Link>
                </div>

                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Belum ada jurnal. Curhatkan perasaanmu! ✨
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition duration-200"
                            >
                                <h4 className="font-semibold text-gray-800">
                                    {item.title}
                                </h4>
                                <p className="mt-2 text-gray-700 line-clamp-3">
                                    {item.content}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Mood: {item.mood}
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={route("journal.edit", { id: item.id, spaceId: spaceId })}
                                        className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            confirm("Yakin hapus?") &&
                                            router.delete(
                                                route(
                                                    "journal.destroy",
                                                    { id: item.id }
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
