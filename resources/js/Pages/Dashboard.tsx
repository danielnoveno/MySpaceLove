import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Heart,
    Calendar,
    Image,
    MessageSquare,
    Clock,
    BookOpen,
    Gift,
    Video,
} from "lucide-react";

interface DashboardData {
    timelineCount: number;
    galleryCount: number;
    upcomingEvents: any[];
    recentMessages: any[];
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    dashboardData: DashboardData;
}

export default function Dashboard({ auth, dashboardData }: Props) {
    const [dailyMessage, setDailyMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { props } = usePage();
    const spaceId = props.spaceId;

    useEffect(() => {
        const fetchDailyMessage = async () => {
            try {
                const response = await fetch(
                    route("api.spaces.daily-message", { space: spaceId })
                );
                if (response.ok) {
                    const data = await response.json();
                    setDailyMessage(data.message.message);
                    setShowModal(true);
                } else if (response.status === 404) {
                    // Daily message not found, generate a new one
                    const regenerateResponse = await fetch(
                        route("api.spaces.daily-message.regenerate", {
                            space: spaceId,
                        }),
                        {
                            method: "POST",
                        }
                    );
                    if (regenerateResponse.ok) {
                        const regenerateData = await regenerateResponse.json();
                        setDailyMessage(regenerateData.message);
                        setShowModal(true);
                    } else {
                        console.error("Failed to regenerate daily message");
                    }
                } else {
                    console.error("Failed to fetch daily message");
                }
            } catch (error) {
                console.error("Error fetching daily message:", error);
            }
        };

        fetchDailyMessage();
    }, [spaceId]);

    const quickActions = [
        {
            icon: Calendar,
            label: "Tambah Momen",
            description: "Catat momen spesial",
            href: route("timeline.create", { spaceId: spaceId }),
            color: "from-pink-500 to-rose-500",
        },
        {
            icon: Image,
            label: "Upload Foto",
            description: "Simpan kenangan",
            href: route("gallery.create", { spaceId: spaceId }),
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: MessageSquare,
            label: "Pesan Harian",
            description: "Lihat pesan cinta",
            href: route("daily.index", { spaceId: spaceId }),
            color: "from-purple-500 to-indigo-500",
        },
        {
            icon: BookOpen,
            label: "Tulis Journal",
            description: "Ekspresikan perasaan",
            href: route("journal.create", { spaceId: spaceId }),
            color: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <>
            {showModal && dailyMessage && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                            className="text-lg leading-6 font-medium text-gray-900"
                                            id="modal-title"
                                        >
                                            Pesan Harian
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {dailyMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowModal(false)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AuthenticatedLayout
                header={
                    <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-pink-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Selamat Datang di LoveSpace! 💕
                            </h1>
                            <p className="text-gray-600">
                                Ruang cinta digital untuk kalian berdua
                            </p>
                        </div>
                    </div>
                }
            >
                <Head title="Dashboard" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Link
                            href={route("timeline.index", { spaceId: spaceId })}
                            className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100 block transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-pink-100 rounded-xl">
                                    <Calendar className="w-6 h-6 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboardData.timelineCount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Momen Spesial
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("gallery.index", { spaceId: spaceId })}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 block transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Image className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboardData.galleryCount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Foto & Video
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("daily.index", { spaceId: spaceId })}
                            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 block transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <MessageSquare className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboardData.recentMessages.length}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Pesan Terbaru
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("countdown.index", {
                                spaceId: spaceId,
                            })}
                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 block transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboardData.upcomingEvents.length}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Event Mendatang
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("space.nobar", { id: spaceId })}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                            🎥 Mulai Nobar
                        </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Aksi Cepat
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div
                                        className={`p-3 rounded-xl bg-gradient-to-r ${action.color} w-fit mb-3 group-hover:scale-110 transition-transform`}
                                    >
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {action.label}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {action.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-500" />
                                Event Mendatang
                            </h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {dashboardData.upcomingEvents.map(
                                    (event, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg"
                                        >
                                            <div className="bg-orange-100 p-2 rounded-lg">
                                                <Calendar className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {event.event_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {event.days_left} hari lagi
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            <Link
                                href={route("countdown.index", {
                                    spaceId: spaceId,
                                })}
                                className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Lihat Semua →
                            </Link>
                        </div>

                        {/* Recent Messages */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-500" />
                                Pesan Terbaru
                            </h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {dashboardData.recentMessages.map(
                                    (message, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-purple-50 rounded-lg"
                                        >
                                            <p className="text-gray-900 line-clamp-2">
                                                "{message.message}"
                                            </p>
                                            <p className="text-sm text-gray-600 mt-3">
                                                {message.date}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                            <Link
                                href={route("daily.index", {
                                    spaceId: spaceId,
                                })}
                                className="block text-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
                            >
                                Lihat Semua →
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
