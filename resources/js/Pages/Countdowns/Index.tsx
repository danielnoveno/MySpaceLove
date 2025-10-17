import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";

interface CountdownItem {
    id: number;
    event_name: string;
    event_date: string;
    description?: string;
    activities?: string[];
    image?: string | null;
}

interface Props {
    items: CountdownItem[];
}

export default function CountdownIndex({ items }: Props) {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const deleteCountdown = (id: number) => {
        if (
            confirm(
                "Yakin ingin menghapus countdown ini? Aksi ini tidak dapat dibatalkan.",
            )
        ) {
            router.delete(
                route("countdown.destroy", { space: spaceSlug, id }),
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Countdown
                </h2>
            }
        >
            <Head title={`Countdown - ${spaceTitle}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-purple-700">
                        Hitung Mundur Kita 💞
                    </h3>
                    <Link
                        href={route("countdown.create", { space: spaceSlug })}
                        className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-700"
                    >
                        + Tambah Event
                    </Link>
                </div>

                {items.length === 0 ? (
                    <p className="rounded-3xl border border-dashed border-purple-200 bg-purple-50 py-10 text-center text-sm text-purple-600">
                        Belum ada event countdown. Tambahkan momen spesial
                        kalian!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-lg"
                            >
                                {item.image ? (
                                    <img
                                        src={`/storage/${item.image}`}
                                        alt={item.event_name}
                                        className="mb-4 h-48 w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="mb-4 flex h-48 w-full items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
                                        Tidak ada gambar
                                    </div>
                                )}
                                <h4 className="text-lg font-semibold text-gray-900">
                                    {item.event_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    {item.event_date}
                                </p>
                                {item.description && (
                                    <p className="mt-3 text-sm text-gray-600">
                                        {item.description}
                                    </p>
                                )}
                                {item.activities &&
                                    item.activities.length > 0 && (
                                        <div className="mt-4 rounded-2xl bg-purple-50 p-3">
                                            <h5 className="text-sm font-semibold text-purple-600">
                                                Rencana Aktivitas
                                            </h5>
                                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-purple-600">
                                                {item.activities.map(
                                                    (activity, index) => (
                                                        <li key={index}>
                                                            {activity}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={route("countdown.edit", {
                                            space: spaceSlug,
                                            id: item.id,
                                        })}
                                        className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-yellow-600"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteCountdown(item.id)}
                                        className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600"
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
