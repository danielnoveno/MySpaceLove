import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Clock,
    Info,
    MessageSquare,
    Mic,
    MicOff,
    MoreHorizontal,
    PhoneOff,
    ScreenShare,
    Settings,
    Smile,
    Users,
    Video,
    VideoOff,
} from "lucide-react";

interface SpaceSummary {
    id: number;
    slug: string;
    title: string;
}

interface Props {
    space?: SpaceSummary;
}

export default function ComingSoon({ space }: Props) {
    const spaceSlug = space?.slug;
    const spaceTitle = space?.title ?? "Space";
    const [activePanel, setActivePanel] = useState<"participants" | "chat" | "schedule">(
        "participants"
    );
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const participants = [
        { name: "You", role: "Host", muted: true, video: true },
        { name: "Partner", role: "Co-host", muted: false, video: true },
        { name: "Asha", role: "Guest", muted: true, video: false },
        { name: "Rio", role: "Guest", muted: true, video: true },
        { name: "Nadia", role: "Guest", muted: false, video: false },
    ];
    const chatMessages = [
        { name: "Partner", time: "20:18", message: "Aku siap mulai. Pilih filmnya?" },
        { name: "You", time: "20:19", message: "Boleh. Aku share screen trailer dulu." },
        { name: "Asha", time: "20:20", message: "Aku ikut vote film action, ya." },
    ];
    const scheduleItems = [
        { title: "Warm-up & cek audio", time: "20:10 - 20:20" },
        { title: "Nobar utama: Sunset Drive", time: "20:20 - 21:40" },
        { title: "After talk", time: "21:40 - 21:55" },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-500">Nobar Space</p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Ruang Nobar {spaceTitle}
                    </h1>
                </div>
            }
        >
            <Head title={`Nobar - ${spaceTitle}`}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-2 sm:px-0"
                style={{ fontFamily: '"Space Grotesk", "Manrope", sans-serif' }}
            >
                <style>{`
                    .nobar-fade {
                        animation: nobarFade 0.6s ease-out both;
                    }
                    .nobar-rise {
                        animation: nobarRise 0.7s ease-out both;
                    }
                    .nobar-stagger > * {
                        animation: nobarRise 0.65s ease-out both;
                    }
                    .nobar-stagger > *:nth-child(2) { animation-delay: 0.08s; }
                    .nobar-stagger > *:nth-child(3) { animation-delay: 0.16s; }
                    .nobar-stagger > *:nth-child(4) { animation-delay: 0.24s; }
                    .nobar-stagger > *:nth-child(5) { animation-delay: 0.32s; }
                    @keyframes nobarFade {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes nobarRise {
                        from { opacity: 0; transform: translateY(12px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                <div className="nobar-fade rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow">
                                <Video className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    Nobar Room
                                </p>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {spaceTitle} - Movie Night
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                                <Clock className="h-4 w-4" aria-hidden="true" />
                                20:18 - 21:45
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                                <Users className="h-4 w-4" aria-hidden="true" />
                                {participants.length} peserta
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                                <Info className="h-4 w-4" aria-hidden="true" />
                                Aman - ruang privat
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[auto_1.7fr]">
                    <aside
                        className={`nobar-stagger flex-shrink-0 rounded-[26px] border border-slate-200 bg-white shadow-sm ${
                            isSidebarCollapsed ? "w-16" : "w-[320px]"
                        }`}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                            {!isSidebarCollapsed && (
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                        Sidebar
                                    </p>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Panel ruang
                                    </h3>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsSidebarCollapsed((value) => !value)}
                                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300"
                                aria-label="Toggle sidebar"
                            >
                                {isSidebarCollapsed ? (
                                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                )}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 px-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setActivePanel("participants")}
                                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                                    activePanel === "participants"
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <Users className="h-4 w-4" aria-hidden="true" />
                                {!isSidebarCollapsed && "Participants"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePanel("chat")}
                                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                                    activePanel === "chat"
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                                {!isSidebarCollapsed && "Chat"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePanel("schedule")}
                                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                                    activePanel === "schedule"
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <Calendar className="h-4 w-4" aria-hidden="true" />
                                {!isSidebarCollapsed && "Schedule"}
                            </button>
                        </div>

                        {!isSidebarCollapsed && (
                            <div className="px-4 pb-4 pt-4">
                                {activePanel === "participants" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {participants.length} orang online
                                            </p>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                                            >
                                                Invite
                                                <ChevronDown
                                                    className="h-3 w-3"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                        {participants.map((participant) => (
                                            <div
                                                key={participant.name}
                                                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {participant.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {participant.role}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {participant.muted ? (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                                                            <MicOff
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    ) : (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                            <Mic
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    )}
                                                    {participant.video ? (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                                            <Video
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    ) : (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                            <VideoOff
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activePanel === "chat" && (
                                    <div className="space-y-4">
                                        {chatMessages.map((chat) => (
                                            <div key={`${chat.name}-${chat.time}`}>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="font-semibold text-slate-700">
                                                        {chat.name}
                                                    </span>
                                                    <span>{chat.time}</span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {chat.message}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                            Ketik pesan ke semua peserta atau kirim ke host.
                                        </div>
                                    </div>
                                )}

                                {activePanel === "schedule" && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Agenda nobar malam ini
                                        </p>
                                        {scheduleItems.map((item) => (
                                            <div
                                                key={item.title}
                                                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                                            >
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {item.time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                    <div className="nobar-rise overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-slate-100 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.7)]">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Video className="h-4 w-4" aria-hidden="true" />
                                Tampilan kamera utama
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-500"
                            >
                                Speaker view
                                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="relative flex min-h-[420px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_rgba(2,6,23,0.98))]">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-semibold text-white">
                                    Y
                                </div>
                                <p className="text-lg font-semibold text-white">
                                    You (Host)
                                </p>
                                <p className="text-xs text-slate-400">
                                    Kamera aktif - kualitas stabil
                                </p>
                            </div>
                            <div className="absolute bottom-6 left-6 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                                Rekaman tidak aktif
                            </div>
                            <div className="absolute right-6 top-6 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                                Koneksi bagus
                            </div>
                        </div>
                        <div className="border-t border-slate-800 bg-slate-950/80 px-5 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                    <span className="rounded-full border border-slate-700 px-2 py-1">
                                        Host: You
                                    </span>
                                    <span className="rounded-full border border-slate-700 px-2 py-1">
                                        Film: Sunset Drive
                                    </span>
                                    <span className="rounded-full border border-slate-700 px-2 py-1">
                                        Sinkronisasi aktif
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow hover:bg-amber-300"
                                >
                                    Mulai film
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nobar-rise flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Live Controls
                        </span>
                        <span className="text-sm text-slate-500">
                            Mode meeting bergaya Zoom untuk nobar kamu.
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                        >
                            <Settings className="h-4 w-4" aria-hidden="true" />
                            Settings
                        </button>
                        <Link
                            href={
                                spaceSlug
                                    ? route("spaces.dashboard", { space: spaceSlug })
                                    : route("dashboard")
                            }
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                <div className="nobar-fade rounded-[32px] border border-slate-900 bg-slate-950 px-4 py-4 text-slate-200 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.7)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <MicOff className="h-4 w-4" aria-hidden="true" />
                                Mute
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <Video className="h-4 w-4" aria-hidden="true" />
                                Start Video
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <ScreenShare className="h-4 w-4" aria-hidden="true" />
                                Share Screen
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                                Chat
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <Users className="h-4 w-4" aria-hidden="true" />
                                Participants
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <Smile className="h-4 w-4" aria-hidden="true" />
                                Reactions
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                More
                            </button>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-red-500"
                        >
                            <PhoneOff className="h-4 w-4" aria-hidden="true" />
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
