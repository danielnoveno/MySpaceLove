import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Calendar, Edit, Plus, Heart } from "lucide-react";

interface TimelineItem {
    id: number;
    title: string;
    description: string;
    date: string;
    media_path?: string;
}

interface Props {
    timelines: TimelineItem[];
}

export default function TimelineIndex({ timelines }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Love Timeline
                    </h2>
                    <Link
                        href={route("timeline.create")}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Momen
                    </Link>
                </div>
            }
        >
            <Head title="Love Timeline" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {timelines.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md mx-auto">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                Belum ada momen tersimpan
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Mulai tambahkan momen spesial pertama kalian!
                            </p>
                            <Link
                                href={route("timeline.create")}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg inline-block hover:shadow-lg transition-all"
                            >
                                Tambah Momen Pertama
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {timelines.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                >
                                    {item.media_path && (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={`/storage/${item.media_path}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(item.date)}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {item.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={route(
                                                    "timeline.edit",
                                                    item.id
                                                )}
                                                className="text-pink-600 hover:text-pink-700 flex items-center gap-1 text-sm font-medium"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
