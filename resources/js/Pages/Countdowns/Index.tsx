import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function CountdownIndex({ items }: { items: any[] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Countdown
                </h2>
            }
        >
            <Head title="Countdown" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-purple-700">
                        Hitung Mundur Kita ⏳
                    </h3>
                    <Link
                        href={route("countdown.create")}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                    >
                        + Tambah Event
                    </Link>
                </div>

                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Belum ada event countdown. Tambahkan sekarang! ✨
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition duration-200"
                            >
                                <h4 className="font-semibold text-gray-800">
                                    {item.event_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    {item.event_date}
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={route("countdown.edit", item.id)}
                                        className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            confirm("Yakin hapus?") &&
                                            router.delete(
                                                route(
                                                    "countdown.destroy",
                                                    item.id
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
