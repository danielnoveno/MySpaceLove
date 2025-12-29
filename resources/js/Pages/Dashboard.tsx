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
    Sparkles,
    Gamepad2,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { replacePlaceholders } from "@/utils/translation";
import { PageProps } from "@/types";
import ProductTour from "@/Components/ProductTour/ProductTour";
import MagicBento, { MagicCard } from "@/Components/MagicBento";

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
        user?: {
            id: number;
            name: string;
        };
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
            upcoming_event?: { label?: string; description?: string };
            upload_photo?: { label?: string; description?: string };
            daily_message?: { label?: string; description?: string };
            memory_lane?: { label?: string; description?: string };
            memory_lane_setup?: { label?: string; description?: string };
            spotify?: { label?: string; description?: string };
            journal?: { label?: string; description?: string };
            nobar?: { label?: string; description?: string };
            games?: { label?: string; description?: string };
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
        requires_owner?: string;
        owner_badge?: string;
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
            shouldShowTour?: boolean;
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
        "Connect your partner first to unlock this feature.";
    const ownerLockMessage =
        dashboardStrings.locks?.requires_owner ??
        "Only the space owner can manage this feature.";
    const ownerLockBadge =
        dashboardStrings.locks?.owner_badge ?? "Owner only";
    const [dailyMessage, setDailyMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState<
        Record<number, boolean>
    >({});
    const [showLockModal, setShowLockModal] = useState(false);
    const [showComingSoonNotice, setShowComingSoonNotice] = useState(false);
    // Tour is active only when it's actually running, not just when shouldShowTour is true
    // Initialize with shouldShowTour to prevent daily message from appearing before tour starts
    const [isTourActive, setIsTourActive] = useState(props.shouldShowTour ?? false);
    const [pendingDailyMessage, setPendingDailyMessage] = useState<string | null>(null);

    const handleLockedNavigation = useCallback(
        (event: MouseEvent<Element>) => {
            if (coupleFeaturesLocked) {
                event.preventDefault();
                setShowLockModal(true);
            }
        },
        [coupleFeaturesLocked, setShowLockModal]
    );

    const readXsrfToken = useCallback((): string | null => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }, []);

    const ensureCsrf = useCallback(async () => {
        const token = readXsrfToken();

        if (!token) {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
        }

        const refreshedToken = readXsrfToken();
        if (refreshedToken) {
            axios.defaults.headers.common["X-XSRF-TOKEN"] = refreshedToken;
        }
    }, [readXsrfToken]);

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

    const openDailyMessageModal = useCallback((value: string | null) =>{
        if (typeof value !== "string" || value.trim() === "") {
            return;
        }

        // If tour is active, store message as pending instead of showing immediately
        if (isTourActive) {
            setPendingDailyMessage(value);
            return;
        }

        setDailyMessage(value);
        setShowModal(true);
    }, [isTourActive]);

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
            // Check if daily message was already shown in this session
            const sessionKey = `daily_message_shown_${spaceSlug}`;
            const alreadyShown = sessionStorage.getItem(sessionKey);
            
            if (alreadyShown) {
                console.log('Daily message already shown in this session');
                return;
            }
            
            try {
                const response = await axios.get(
                    route("api.spaces.daily-message", { space: spaceSlug }),
                );

                const messageText = extractDailyMessageText(
                    response.data?.message,
                );

                if (response.status === 200 && messageText) {
                    openDailyMessageModal(messageText);
                    // Mark as shown for this session
                    sessionStorage.setItem(sessionKey, 'true');
                    return;
                }
            } catch (error: any) {
                // 404 is expected when no daily message is available - don't log it
                if (error?.response?.status !== 404) {
                    console.error("Error fetching daily message:", error);
                }
            }
        };

        void (async () => {
            await ensureCsrf();
            await fetchDailyMessage();
        })();
    }, [ensureCsrf, extractDailyMessageText, openDailyMessageModal, spaceSlug]);

    // Show pending daily message after tour completes
    useEffect(() => {
        if (!isTourActive && pendingDailyMessage) {
            setDailyMessage(pendingDailyMessage);
            setShowModal(true);
            setPendingDailyMessage(null);
            
            // Mark as shown in session storage
            const sessionKey = `daily_message_shown_${spaceSlug}`;
            sessionStorage.setItem(sessionKey, 'true');
        }
    }, [isTourActive, pendingDailyMessage, spaceSlug]);

    const quickActionStrings = dashboardStrings.cards?.quick_actions;
    const quickActions = useMemo(
        () => [
            {
                id: "timeline-section",
                icon: Calendar,
                label:
                    quickActionStrings?.add_moment?.label ?? "Add Moment",
                description:
                    quickActionStrings?.add_moment?.description ??
                    "Record a special memory",
                href: route("timeline.index", { space: spaceSlug }),
                color: "from-pink-500 to-rose-500",
                requiresPartner: true,
            },
            {
                id: "upcoming-event-action",
                icon: Clock,
                label:
                    quickActionStrings?.upcoming_event?.label ??
                    "Upcoming Event",
                description:
                    quickActionStrings?.upcoming_event?.description ??
                    "Manage romantic countdowns",
                href: route("countdown.index", { space: spaceSlug }),
                color: "from-violet-500 to-indigo-500",
                requiresPartner: true,
            },
            {
                id: "games-action",
                icon: Gamepad2,
                label: quickActionStrings?.games?.label ?? "Games",
                description:
                    quickActionStrings?.games?.description ??
                    "Play and track space scores",
                href: route("games.index", { space: spaceSlug }),
                color: "from-indigo-600 to-blue-600",
            },
            {
                id: "gallery-section",
                icon: Image,
                label:
                    quickActionStrings?.upload_photo?.label ?? "Upload Photo",
                description:
                    quickActionStrings?.upload_photo?.description ??
                    "Save your memories",
                href: route("gallery.index", { space: spaceSlug }),
                color: "from-blue-500 to-cyan-500",
                requiresPartner: true,
            },
            {
                id: "daily-message-action",
                icon: MessageSquare,
                label:
                    quickActionStrings?.daily_message?.label ??
                    "Daily Messages",
                description:
                    quickActionStrings?.daily_message?.description ??
                    "Read love notes",
                href: route("daily.index", { space: spaceSlug }),
                color: "from-purple-500 to-indigo-500",
                requiresPartner: true,
            },
            {
                id: "memory-lane-action",
                icon: Heart,
                label:
                    quickActionStrings?.memory_lane?.label ??
                    "Memory Lane Kit",
                description:
                    quickActionStrings?.memory_lane?.description ??
                    "Three-stage surprise guide + storybook",
                href: route("surprise.memory.space", { space: spaceSlug }),
                color: "from-fuchsia-500 to-violet-500",
                requiresPartner: true,
            },
            {
                id: "memory-lane-setup-action",
                icon: Sparkles,
                label:
                    quickActionStrings?.memory_lane_setup?.label ??
                    "Configure Memory Lane",
                description:
                    quickActionStrings?.memory_lane_setup?.description ??
                    "Upload puzzle photos & level messages",
                href: route("memory-lane.edit", { space: spaceSlug }),
                color: "from-amber-500 to-orange-500",
                requiresOwner: true,
            },
            {
                id: "spotify-action",
                icon: Music,
                label:
                    quickActionStrings?.spotify?.label ?? "Spotify Companion",
                description:
                    quickActionStrings?.spotify?.description ??
                    "Sync music and moods remotely",
                href: route("spotify.companion", { space: spaceSlug }),
                color: "from-emerald-500 to-teal-500",
                requiresPartner: true,
            },
            {
                id: "journal-section",
                icon: BookOpen,
                label:
                    quickActionStrings?.journal?.label ?? "Write Journal",
                description:
                    quickActionStrings?.journal?.description ??
                    "Express your feelings",
                href: route("journal.index", { space: spaceSlug }),
                color: "from-green-500 to-emerald-500",
                requiresPartner: true,
            },
            {
                id: "watch-party-action",
                icon: Video,
                label:
                    quickActionStrings?.nobar?.label ?? "Join Watch Party",
                description:
                    quickActionStrings?.nobar?.description ??
                    "Start a co-watching session",
                href: route("space.nobar", { space: spaceSlug }),
                color: "from-red-500 to-orange-500",
                requiresPartner: true,
                comingSoon: false, // Feature is now ready to use
            },
        ],
        [quickActionStrings, spaceSlug, isSpaceOwner]
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
                <div id="space-title" className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">
                        {dashboardStrings.header?.subtitle ??
                            "Your shared space"}
                    </p>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {spaceTitle}
                    </h2>
                </div>
            }
            dimNav={showModal}
        >
            <Head
                title={replacePlaceholders(
                    dashboardStrings.meta?.title ??
                        `Dashboard - :space`,
                    { space: spaceTitle },
                )}
            />

            {showComingSoonNotice && (
                <div className="mx-auto mt-4 w-full max-w-4xl px-4">
                    <div className="flex flex-wrap items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50/95 p-5 text-amber-700 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Sparkles className="h-5 w-5 text-amber-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                                Watch Party Feature Coming Soon
                            </p>
                            <p className="text-sm text-amber-600">
                                We're still preparing the best watch party experience. Thank you for waiting—we'll notify you directly from the dashboard as soon as this feature is ready.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowComingSoonNotice(false)}
                            className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-200/70 p-2 text-amber-700 transition hover:bg-amber-200"
                            aria-label={tCommon("actions.close", "Tutup")}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {showModal && dailyMessage && (
                <div
                    className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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
                                "Today's Love Message"}
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
                                "Feature Locked"}
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
                                            "Partner not connected yet"}
                                    </h3>
                                    <p className="mt-1 text-sm text-indigo-700">
                                        {dashboardStrings.cards?.partner_pending
                                            ?.description ??
                                            "Invite your partner so you can enjoy every feature together."}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("spaces.index")}
                                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                {dashboardStrings.cards?.partner_pending?.cta ??
                                    "Connect Partner"}
                            </Link>
                        </div>
                    </div>
                )}

                <div id="stats-section" className="grid gap-6 md:grid-cols-3">
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
                                        "Photos & Videos"}
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
                                        "Location Sharing"}
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
                                        "Open Map"}
                                    <Video className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="quick-actions-section" className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {dashboardStrings.cards?.quick_actions?.title ??
                            "Quick Actions"}
                    </h2>
                    <MagicBento
                        className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
                        glowColor="236, 72, 153" // Pink-500 matches the theme
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        enableTilt={true}
                    >
                        {quickActions.map((action, index) => {
                            const ownerLocked =
                                action.requiresOwner && !isSpaceOwner;
                            const partnerLocked =
                                coupleFeaturesLocked && action.requiresPartner;
                            const comingSoon = action.comingSoon === true;
                            const disabled = ownerLocked || partnerLocked || comingSoon;
                            const actionTitle = comingSoon
                                ? "Watch party feature is still in development. Stay tuned!"
                                : ownerLocked
                                ? ownerLockMessage
                                : partnerLocked
                                ? coupleLockMessage
                                : undefined;
                            const handleActionClick = (() => {
                                if (comingSoon) {
                                    return (event: MouseEvent<Element>) => {
                                        event.preventDefault();
                                        setShowComingSoonNotice(true);
                                    };
                                }

                                if (ownerLocked) {
                                    return (event: MouseEvent<Element>) => {
                                        event.preventDefault();
                                    };
                                }

                                if (partnerLocked) {
                                    return handleLockedNavigation;
                                }

                                return undefined;
                            })();

                            return (
                                <MagicCard
                                    key={index}
                                    as={Link}
                                    id={action.id}
                                    href={comingSoon ? "#" : action.href}
                                    onClick={handleActionClick}
                                    title={actionTitle}
                                    aria-disabled={disabled}
                                    enableTilt={true}
                                    enableMagnetism={true}
                                    glowColor="236, 72, 153"
                                    className={`card card--border-glow group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition ${
                                        disabled
                                            ? "cursor-not-allowed opacity-70"
                                            : "hover:border-transparent hover:shadow-lg"
                                    }`}
                                >
                                    <div
                                        className={`mb-3 w-fit rounded-xl bg-gradient-to-r ${action.color} p-3 transition-transform ${
                                            disabled ? "" : "group-hover:scale-110"
                                        }`}
                                    >
                                        <action.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        {action.label}
                                        {comingSoon && (
                                            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                                Coming Soon
                                            </span>
                                        )}
                                        {!comingSoon && (ownerLocked || partnerLocked) && (
                                            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-500">
                                                <Lock className="h-3 w-3" />
                                                {ownerLocked
                                                    ? ownerLockBadge
                                                    : tCommon("states.locked", "Terkunci")}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {action.description}
                                    </p>
                                </MagicCard>
                            );
                        })}
                    </MagicBento>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div id="countdown-section" className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            {dashboardStrings.cards?.upcoming_events?.title ??
                                "Upcoming Events"}
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.upcomingEvents.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-600">
                                    {dashboardStrings.cards?.upcoming_events?.empty ??
                                        "No events scheduled yet. Create your first countdown!"}
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
                                                        ":count days left",
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

                    <div id="daily-messages-section" className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            {dashboardStrings.cards?.recent_messages?.title ??
                                "Latest Messages"}
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.recentMessages.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 p-4 text-sm text-purple-600">
                                    {dashboardStrings.cards?.recent_messages?.empty ??
                                        "No new messages yet. Write something special for your partner!"}
                                </p>
                            )}
                            {recentMessages.map((message, index) => (
                                <div
                                    key={`${message.date}-${index}`}
                                    className="rounded-2xl border border-purple-100 bg-purple-50 p-4"
                                >
                                    <p className="text-xs text-purple-600 font-semibold mb-1">
                                        {message.user?.name}
                                    </p>
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
                                                  "Hide"
                                                : dashboardStrings.cards?.recent_messages?.show_more ??
                                                  "Read more"}
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

            {/* Product Tour for New Users */}
            <ProductTour 
                autoStart={props.shouldShowTour ?? false}
                onStart={() => setIsTourActive(true)}
                onComplete={() => setIsTourActive(false)}
            />
        </AuthenticatedLayout>
    );
}
