import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function DailyMessageIndex({
    messages,
    spaceId,
}: {
    messages: any[];
    spaceId: string;
}) {
    const sanitize = (text: string) => {
        return text
            .replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, '"');
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Daily Message
                </h2>
            }
        >
            <Head title="Daily Message" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-pink-700">
                        Pesan Harian Kita 💌
                    </h3>
                    <Link
                        href={route("daily.create", { spaceId: spaceId })}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                    >
                        + Tambah Manual
                    </Link>
                </div>

                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Belum ada pesan harian. AI akan generate otomatis! ✨
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="p-4 bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition duration-200"
                            >
                                <h4 className="font-semibold text-gray-800">
                                    {msg.date}
                                </h4>
                                <p
                                    className="mt-2 text-gray-700 italic"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitize(`"${msg.message}"`),
                                    }}
                                ></p>
                                {/* <p className="text-sm text-gray-500">
                                    Sumber: {msg.generated_by.toUpperCase()}
                                </p> */}
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={route("daily.edit", {
                                            spaceId: spaceId,
                                            id: msg.id,
                                        })}
                                        className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            router.post(
                                                route("daily.regenerate", {
                                                    spaceId: spaceId,
                                                }),
                                                { date: msg.date } // 🔹 bukan id
                                            )
                                        }
                                        className="px-3 py-1 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
                                    >
                                        Regenerate AI
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
