import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
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
    dashboardData: DashboardData;
    spaceId: number;
}

export default function Dashboard({ dashboardData, spaceId }: Props) {
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
                        href={route("countdown.index", { spaceId: spaceId })}
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
                        <div className="space-y-3">
                            {dashboardData.upcomingEvents
                                .slice(0, 3)
                                .map((event, index) => (
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
                                ))}
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
                        <div className="space-y-3">
                            {dashboardData.recentMessages
                                .slice(0, 3)
                                .map((message, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-purple-50 rounded-lg"
                                    >
                                        <p className="text-gray-900 line-clamp-2">
                                            "{message.message}"
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {message.date}
                                        </p>
                                    </div>
                                ))}
                        </div>
                        <Link
                            href={route("daily.index", { spaceId: spaceId })}
                            className="block text-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Lihat Semua →
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
