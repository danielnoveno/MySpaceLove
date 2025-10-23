import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { Fragment, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Clock,
    Gift,
    Heart,
    Image,
    MessageSquare,
    Video,
    BookOpen,
    Music,
    UserPlus,
    Lock,
    X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { replacePlaceholders } from "@/utils/translation";
import { PageProps } from "@/types";

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

interface SpaceContext {
    id: number;
    slug: string;
    title: string;
    has_partner?: boolean;
    is_owner?: boolean;
}

interface Props {
    dashboardData: DashboardData;
    spaceContext: SpaceContext;
}

type DashboardTranslation = {
    meta?: { title?: string };
    header?: { subtitle?: string };
    modals?: {
        daily_message?: { title?: string };
        locked?: { title?: string; action?: string };
    };
    cards?: {
        partner_pending?: {
            title?: string;
            description?: string;
            cta?: string;
        };
        timeline_total?: string;
        gallery_total?: string;
        location_share?: { title?: string; cta?: string };
        quick_actions?: {
            title?: string;
            add_moment?: { label?: string; description?: string };
            upload_photo?: { label?: string; description?: string };
            daily_message?: { label?: string; description?: string };
            memory_lane?: { label?: string; description?: string };
            spotify?: { label?: string; description?: string };
            journal?: { label?: string; description?: string };
            nobar?: { label?: string; description?: string };
        };
        upcoming_events?: {
            title?: string;
            empty?: string;
            days_left?: string;
            view_all?: string;
        };
        recent_messages?: {
            title?: string;
            empty?: string;
            show_more?: string;
            show_less?: string;
            view_all?: string;
        };
    };
    locks?: {
        requires_partner?: string;
    };
};

export default function Dashboard({ dashboardData, spaceContext }: Props) {
    const { props } = usePage<
        PageProps & {
            currentSpace?: {
                id: number;
                slug: string;
                title: string;
                has_partner?: boolean;
                is_owner?: boolean;
            } | null;
        }
    >();

    const currentSpace = props.currentSpace ?? spaceContext;
    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;
    const hasPartner =
        (currentSpace.has_partner ?? spaceContext.has_partner) ?? false;
    const isSpaceOwner =
        (currentSpace.is_owner ?? spaceContext.is_owner) ?? false;

    const coupleFeaturesLocked = !hasPartner;
    const { translations: dashboardStrings } =
        useTranslation<DashboardTranslation>("dashboard");
    const { t: tCommon } = useTranslation("common");

    const coupleLockMessage =
        dashboardStrings.locks?.requires_partner ??
        "Hubungkan pasanganmu terlebih dahulu untuk membuka fitur ini.";
    const [dailyMessage, setDailyMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState<
        Record<number, boolean>
    >({});
    const [showLockModal, setShowLockModal] = useState(false);

    const handleLockedNavigation = useCallback(
        (event: MouseEvent<Element>) => {
            if (coupleFeaturesLocked) {
                event.preventDefault();
                setShowLockModal(true);
            }
        },
        [coupleFeaturesLocked, setShowLockModal]
    );

    const formattedDailyMessage = useMemo(() => {
        if (!dailyMessage) {
            return null;
        }

        const segments = dailyMessage.split(/(\*[^*]+\*)/g);

        return segments.map((segment, index) => {
            const boldMatch = segment.match(/^\*([^*]+)\*$/);

            if (boldMatch) {
                return (
                    <strong
                        key={`bold-${index}`}
                        className="font-semibold text-pink-500"
                    >
                        {boldMatch[1]}
                    </strong>
                );
            }

            return <Fragment key={`text-${index}`}>{segment}</Fragment>;
        });
    }, [dailyMessage]);

    const openDailyMessageModal = useCallback((value: string | null) => {
        if (typeof value !== "string" || value.trim() === "") {
            return;
        }

        setDailyMessage(value);
        setShowModal(true);
    }, []);

    const extractDailyMessageText = useCallback((payload: unknown): string | null => {
        if (typeof payload === "string") {
            return payload;
        }

        if (
            payload &&
            typeof payload === "object" &&
            "message" in payload &&
            typeof (payload as { message?: unknown }).message === "string"
        ) {
            return (payload as { message: string }).message;
        }

        return null;
    }, []);

    useEffect(() => {
        const fetchDailyMessage = async () => {
            try {
                const response = await axios.get(
                    route("api.spaces.daily-message", { space: spaceSlug }),
                );

                const messageText = extractDailyMessageText(
                    response.data?.message,
                );

                if (response.status === 200 && messageText) {
                    openDailyMessageModal(messageText);
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

                        const regeneratedText = extractDailyMessageText(
                            regenerateResponse.data?.message,
                        );

                        if (
                            regenerateResponse.status === 200 &&
                            regeneratedText
                        ) {
                            openDailyMessageModal(regeneratedText);
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
    }, [extractDailyMessageText, openDailyMessageModal, spaceSlug]);

    const quickActionStrings = dashboardStrings.cards?.quick_actions;
    const quickActions = useMemo(
        () => [
            {
                icon: Calendar,
                label:
                    quickActionStrings?.add_moment?.label ?? "Tambah Momen",
                description:
                    quickActionStrings?.add_moment?.description ??
                    "Catat momen spesial",
                href: route("timeline.index", { space: spaceSlug }),
                color: "from-pink-500 to-rose-500",
                requiresPartner: true,
            },
            {
                icon: Image,
                label:
                    quickActionStrings?.upload_photo?.label ?? "Upload Foto",
                description:
                    quickActionStrings?.upload_photo?.description ??
                    "Simpan kenangan",
                href: route("gallery.index", { space: spaceSlug }),
                color: "from-blue-500 to-cyan-500",
                requiresPartner: true,
            },
            {
                icon: MessageSquare,
                label:
                    quickActionStrings?.daily_message?.label ??
                    "Pesan Harian",
                description:
                    quickActionStrings?.daily_message?.description ??
                    "Lihat pesan cinta",
                href: route("daily.index", { space: spaceSlug }),
                color: "from-purple-500 to-indigo-500",
                requiresPartner: true,
            },
            {
                icon: Heart,
                label:
                    quickActionStrings?.memory_lane?.label ??
                    "Memory Lane Kit",
                description:
                    quickActionStrings?.memory_lane?.description ??
                    "Panduan surprise 3 tahap + storybook",
                href: route("surprise.memory.space", { space: spaceSlug }),
                color: "from-fuchsia-500 to-violet-500",
                requiresPartner: true,
            },
            {
                icon: Music,
                label:
                    quickActionStrings?.spotify?.label ?? "Spotify Companion",
                description:
                    quickActionStrings?.spotify?.description ??
                    "Sinkronisasi musik & mood jarak jauh",
                href: route("spotify.companion", { space: spaceSlug }),
                color: "from-emerald-500 to-teal-500",
                requiresPartner: true,
            },
            {
                icon: BookOpen,
                label:
                    quickActionStrings?.journal?.label ?? "Tulis Journal",
                description:
                    quickActionStrings?.journal?.description ??
                    "Ekspresikan perasaan",
                href: route("journal.index", { space: spaceSlug }),
                color: "from-green-500 to-emerald-500",
                requiresPartner: true,
            },
            {
                icon: Video,
                label:
                    quickActionStrings?.nobar?.label ?? "Masuk Nobar",
                description:
                    quickActionStrings?.nobar?.description ??
                    "Mulai nonton bareng",
                href: route("space.nobar", { space: spaceSlug }),
                color: "from-red-500 to-orange-500",
                requiresPartner: true,
            },
        ],
        [quickActionStrings, spaceSlug]
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
                        {dashboardStrings.header?.subtitle ??
                            "Space kamu bersama pasangan"}
                    </p>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {spaceTitle}
                    </h2>
                </div>
            }
        >
            <Head
                title={replacePlaceholders(
                    dashboardStrings.meta?.title ??
                        `Dashboard - :space`,
                    { space: spaceTitle },
                )}
            />

            {showModal && dailyMessage && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
                            aria-label={tCommon("actions.close", "Tutup")}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                            <Heart className="h-8 w-8 text-pink-500" />
                        </div>
                        <h3 className="mt-4 text-center text-xl font-semibold text-gray-900">
                            {dashboardStrings.modals?.daily_message?.title ??
                                "Pesan Cinta Hari Ini"}
                        </h3>
                        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
                            {formattedDailyMessage}
                        </p>
                    </div>
                </div>
            )}

            {showLockModal && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
                    onClick={() => setShowLockModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowLockModal(false)}
                            className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
                            aria-label={tCommon("actions.close", "Tutup")}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                            <Lock className="h-8 w-8 text-pink-500" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">
                            {dashboardStrings.modals?.locked?.title ??
                                "Fitur Terkunci"}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">
                            {coupleLockMessage}
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowLockModal(false)}
                            className="mt-6 inline-flex items-center justify-center rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                        >
                            {dashboardStrings.modals?.locked?.action ??
                                tCommon("actions.understand", "Mengerti")}
                        </button>
                    </div>
                </div>
            )}

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-4">
                {!hasPartner && isSpaceOwner && (
                    <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50 p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                                    <UserPlus className="h-6 w-6 text-indigo-600" />
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold text-indigo-900">
                                        {dashboardStrings.cards?.partner_pending?.title ??
                                            "Pasangan belum terhubung"}
                                    </h3>
                                    <p className="mt-1 text-sm text-indigo-700">
                                        {dashboardStrings.cards?.partner_pending
                                            ?.description ??
                                            "Ajak pasanganmu bergabung agar kalian bisa menikmati semua fitur berdua."}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("spaces.index")}
                                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                {dashboardStrings.cards?.partner_pending?.cta ??
                                    "Hubungkan Pasangan"}
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                                <Calendar className="h-5 w-5 text-pink-500" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500">
                                    {dashboardStrings.cards?.timeline_total ??
                                        "Total Timeline"}
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
                                    {dashboardStrings.cards?.gallery_total ??
                                        "Foto & Video"}
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
                                    {dashboardStrings.cards?.location_share?.title ??
                                        "Berbagi Lokasi"}
                                </p>
                                <Link
                                    href={route("location.map", {
                                        space: spaceSlug,
                                    })}
                                    onClick={coupleFeaturesLocked ? handleLockedNavigation : undefined}
                                    title={coupleFeaturesLocked ? coupleLockMessage : undefined}
                                    aria-disabled={coupleFeaturesLocked}
                                    className={`mt-1 inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium text-white transition ${
                                        coupleFeaturesLocked
                                            ? "cursor-not-allowed bg-white/10 opacity-60"
                                            : "bg-white/20 hover:bg-white/30"
                                    }`}
                                >
                                    {dashboardStrings.cards?.location_share?.cta ??
                                        "Buka Peta"}
                                    <Video className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {dashboardStrings.cards?.quick_actions?.title ??
                            "Aksi Cepat"}
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {quickActions.map((action, index) => {
                            const locked =
                                coupleFeaturesLocked && action.requiresPartner;

                            return (
                                <Link
                                    key={index}
                                    href={action.href}
                                    onClick={locked ? handleLockedNavigation : undefined}
                                    title={locked ? coupleLockMessage : undefined}
                                    aria-disabled={locked}
                                    className={`group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition ${
                                        locked
                                            ? "cursor-not-allowed opacity-60"
                                            : "hover:border-transparent hover:shadow-lg"
                                    }`}
                                >
                                    <div
                                        className={`mb-3 w-fit rounded-xl bg-gradient-to-r ${action.color} p-3 transition-transform ${
                                            locked ? "" : "group-hover:scale-110"
                                        }`}
                                    >
                                        <action.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        {action.label}
                                        {locked && (
                                            <span className="inline-flex items-center justify-center rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-500">
                                                <Lock className="h-3 w-3" />
                                                {tCommon("states.locked", "Terkunci")}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {action.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            {dashboardStrings.cards?.upcoming_events?.title ??
                                "Event Mendatang"}
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.upcomingEvents.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-600">
                                    {dashboardStrings.cards?.upcoming_events?.empty ??
                                        "Belum ada event yang dijadwalkan. Yuk buat countdown pertama kalian!"}
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
                                                {replacePlaceholders(
                                                    dashboardStrings.cards
                                                        ?.upcoming_events
                                                        ?.days_left ??
                                                        ":count hari lagi",
                                                    { count: event.days_left },
                                                )}
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
                            onClick={coupleFeaturesLocked ? handleLockedNavigation : undefined}
                            title={coupleFeaturesLocked ? coupleLockMessage : undefined}
                            aria-disabled={coupleFeaturesLocked}
                            className={`mt-4 block text-center text-sm font-medium transition ${
                                coupleFeaturesLocked
                                    ? "cursor-not-allowed text-orange-300"
                                    : "text-orange-600 hover:text-orange-700"
                            }`}
                        >
                            {dashboardStrings.cards?.upcoming_events?.view_all ??
                                tCommon("actions.view_all", "Lihat Semua")}
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            {dashboardStrings.cards?.recent_messages?.title ??
                                "Pesan Terbaru"}
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.recentMessages.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 p-4 text-sm text-purple-600">
                                    {dashboardStrings.cards?.recent_messages?.empty ??
                                        "Belum ada pesan terbaru. Coba tulis pesan spesial untuk pasanganmu!"}
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
                                                ? dashboardStrings.cards?.recent_messages?.show_less ??
                                                  "Sembunyikan"
                                                : dashboardStrings.cards?.recent_messages?.show_more ??
                                                  "Baca selengkapnya"}
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
                            onClick={coupleFeaturesLocked ? handleLockedNavigation : undefined}
                            title={coupleFeaturesLocked ? coupleLockMessage : undefined}
                            aria-disabled={coupleFeaturesLocked}
                            className={`mt-4 block text-center text-sm font-medium transition ${
                                coupleFeaturesLocked
                                    ? "cursor-not-allowed text-purple-300"
                                    : "text-purple-600 hover:text-purple-700"
                            }`}
                        >
                            {dashboardStrings.cards?.recent_messages?.view_all ??
                                tCommon("actions.view_all", "Lihat Semua")}
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
