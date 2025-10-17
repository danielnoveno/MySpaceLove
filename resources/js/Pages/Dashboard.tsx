import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Clock,
    Gift,
    Heart,
    Image,
    MessageSquare,
    Video,
    BookOpen,
} from "lucide-react";

interface DashboardData {
    timelineCount: number;
    galleryCount: number;
    upcomingEvents: Array<{
        event_name: string;
        days_left: number;
    }>;
    recentMessages: Array<{
        message: string;
        date: string;
    }>;
}

interface Props {
    dashboardData: DashboardData;
    spaceContext: {
        id: number;
        slug: string;
        title: string;
    };
}

export default function Dashboard({ dashboardData, spaceContext }: Props) {
    const { props } = usePage<{
        currentSpace?: {
            id: number;
            slug: string;
            title: string;
        } | null;
    }>();

    const currentSpace = props.currentSpace ?? spaceContext;
    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const [dailyMessage, setDailyMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState<
        Record<number, boolean>
    >({});

    useEffect(() => {
        const fetchDailyMessage = async () => {
            try {
                const response = await axios.get(
                    route("api.spaces.daily-message", { space: spaceSlug }),
                );

                if (response.status === 200 && response.data?.message) {
                    setDailyMessage(response.data.message.message);
                    setShowModal(true);
                    return;
                }
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    try {
                        const regenerateResponse = await axios.post(
                            route("api.spaces.daily-message.regenerate", {
                                space: spaceSlug,
                            }),
                        );

                        if (regenerateResponse.status === 200) {
                            setDailyMessage(regenerateResponse.data.message);
                            setShowModal(true);
                        }
                    } catch (regenerateError) {
                        console.error(
                            "Error regenerating daily message:",
                            regenerateError,
                        );
                    }
                } else {
                    console.error("Error fetching daily message:", error);
                }
            }
        };

        void fetchDailyMessage();
    }, [spaceSlug]);

    const quickActions = useMemo(
        () => [
            {
                icon: Calendar,
                label: "Tambah Momen",
                description: "Catat momen spesial",
                href: route("timeline.create", { space: spaceSlug }),
                color: "from-pink-500 to-rose-500",
            },
            {
                icon: Image,
                label: "Upload Foto",
                description: "Simpan kenangan",
                href: route("gallery.create", { space: spaceSlug }),
                color: "from-blue-500 to-cyan-500",
            },
            {
                icon: MessageSquare,
                label: "Pesan Harian",
                description: "Lihat pesan cinta",
                href: route("daily.index", { space: spaceSlug }),
                color: "from-purple-500 to-indigo-500",
            },
            {
                icon: BookOpen,
                label: "Tulis Journal",
                description: "Ekspresikan perasaan",
                href: route("journal.create", { space: spaceSlug }),
                color: "from-green-500 to-emerald-500",
            },
            {
                icon: Video,
                label: "Masuk Nobar",
                description: "Mulai nonton bareng",
                href: route("space.nobar", { space: spaceSlug }),
                color: "from-red-500 to-orange-500",
            },
        ],
        [spaceSlug]
    );

    const recentMessages = useMemo(
        () => dashboardData.recentMessages.slice(0, 3),
        [dashboardData.recentMessages],
    );

    const toggleMessage = useCallback((index: number) => {
        setExpandedMessages((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">
                        Space kamu bersama pasangan
                    </p>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {spaceTitle}
                    </h2>
                </div>
            }
        >
            <Head title={`Dashboard - ${spaceTitle}`} />

            {showModal && dailyMessage && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
                            aria-label="Tutup"
                        >
                            ×
                        </button>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                            <Heart className="h-8 w-8 text-pink-500" />
                        </div>
                        <h3 className="mt-4 text-center text-xl font-semibold text-gray-900">
                            Pesan Cinta Hari Ini
                        </h3>
                        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
                            {dailyMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-4">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                                <Calendar className="h-5 w-5 text-pink-500" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Timeline
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {dashboardData.timelineCount}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <Image className="h-5 w-5 text-blue-500" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Foto & Video
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {dashboardData.galleryCount}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <Gift className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-sm text-purple-100">
                                    Berbagi Lokasi
                                </p>
                                <Link
                                    href={route("location.map", {
                                        space: spaceSlug,
                                    })}
                                    className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white transition hover:bg-white/30"
                                >
                                    Buka Peta
                                    <Video className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Aksi Cepat
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-transparent hover:shadow-lg"
                            >
                                <div
                                    className={`mb-3 w-fit rounded-xl bg-gradient-to-r ${action.color} p-3 transition-transform group-hover:scale-110`}
                                >
                                    <action.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {action.label}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {action.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            Event Mendatang
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.upcomingEvents.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-600">
                                    Belum ada event yang dijadwalkan. Yuk buat
                                    countdown pertama kalian!
                                </p>
                            )}
                            {dashboardData.upcomingEvents.map(
                                (event, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-3"
                                    >
                                        <div className="rounded-xl bg-white p-2">
                                            <Clock className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {event.event_name}
                                            </p>
                                            <p className="text-xs text-orange-600">
                                                {event.days_left} hari lagi
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        <Link
                            href={route("countdown.index", {
                                space: spaceSlug,
                            })}
                            className="mt-4 block text-center text-sm font-medium text-orange-600 transition hover:text-orange-700"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            Pesan Terbaru
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.recentMessages.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 p-4 text-sm text-purple-600">
                                    Belum ada pesan terbaru. Coba tulis pesan
                                    spesial untuk pasanganmu!
                                </p>
                            )}
                            {recentMessages.map((message, index) => (
                                <div
                                    key={`${message.date}-${index}`}
                                    className="rounded-2xl border border-purple-100 bg-purple-50 p-4"
                                >
                                    <p className="text-sm text-gray-700">
                                        {expandedMessages[index] ||
                                        message.message.length <= 120
                                            ? `"${message.message}"`
                                            : `"${message.message.slice(
                                                  0,
                                                  120
                                              )}…"`}{" "}
                                    </p>
                                    {message.message.length > 120 && (
                                        <button
                                            type="button"
                                            onClick={() => toggleMessage(index)}
                                            className="mt-3 text-xs font-medium text-purple-600 transition hover:text-purple-700"
                                        >
                                            {expandedMessages[index]
                                                ? "Sembunyikan"
                                                : "Baca selengkapnya"}
                                        </button>
                                    )}
                                    <p className="mt-3 text-xs text-purple-500">
                                        {message.date}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Link
                            href={route("daily.index", { space: spaceSlug })}
                            className="mt-4 block text-center text-sm font-medium text-purple-600 transition hover:text-purple-700"
                        >
                            Lihat Semua
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
