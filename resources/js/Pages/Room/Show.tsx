import { Head, useForm, usePage } from "@inertiajs/react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock, MailCheck, Sparkles, X, BellRing, Monitor, Mic, Video } from "lucide-react";
import { PageProps } from "@/types";

interface NobarSchedulePayload {
    id: number;
    title: string;
    description?: string | null;
    scheduled_for?: string | null;
    created_at?: string | null;
}

interface Props {
    spaceId: number;
    space?: {
        id: number;
        slug: string;
        title: string;
    };
    schedules?: NobarSchedulePayload[];
}

function formatDateTime(value?: string | null): string {
    if (!value) {
        return "Belum dijadwalkan";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Belum dijadwalkan";
    }

    return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatRelativeTime(value?: string | null): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);

    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ["year", 1000 * 60 * 60 * 24 * 365],
        ["month", 1000 * 60 * 60 * 24 * 30],
        ["week", 1000 * 60 * 60 * 24 * 7],
        ["day", 1000 * 60 * 60 * 24],
        ["hour", 1000 * 60 * 60],
        ["minute", 1000 * 60],
    ];

    const formatter = new Intl.RelativeTimeFormat(undefined, {
        numeric: "auto",
    });

    for (const [unit, millis] of units) {
        if (absDiff >= millis || unit === "minute") {
            const valueForUnit = Math.round(diff / millis);
            if (valueForUnit !== 0) {
                return formatter.format(valueForUnit, unit);
            }
        }
    }

    return formatter.format(0, "minute");
}

export default function Room({ spaceId, space, schedules = [] }: Props) {
    const { props } = usePage<PageProps>();
    const currentUser = props.auth?.user;
    const currentSpace = props.currentSpace;

    const resolvedSpaceSlug = space?.slug ?? currentSpace?.slug ?? `space-${spaceId}`;
    const resolvedSpaceTitle = space?.title ?? currentSpace?.title ?? `Space #${spaceId}`;

    const resolvedUserName = (() => {
        const baseName = currentUser?.name ?? currentUser?.email ?? "Guest";
        const trimmed = String(baseName).trim();

        if (trimmed.length > 0) {
            return trimmed;
        }

        return `Guest ${spaceId}`;
    })();

    const avatarUrl = currentUser?.profile_photo_url
        ? String(currentUser.profile_photo_url)
        : undefined;

    const resolvedUserId = (() => {
        if (currentUser?.id) {
            return `user-${currentUser.id}`;
        }

        if (currentUser?.email) {
            const sanitized = currentUser.email.replace(/[^a-zA-Z0-9_-]/g, "_");
            return sanitized.trim().slice(0, 40) || `guest-${spaceId}`;
        }

        return `guest-${spaceId}`;
    })();

    const [isScheduleOpen, setScheduleOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimeoutRef = useRef<number | undefined>(undefined);

    const sortedSchedules = useMemo(() => {
        return [...schedules]
            .filter((item) => Boolean(item))
            .sort((a, b) => {
                const aTime = a.scheduled_for ? new Date(a.scheduled_for).getTime() : Number.MAX_SAFE_INTEGER;
                const bTime = b.scheduled_for ? new Date(b.scheduled_for).getTime() : Number.MAX_SAFE_INTEGER;
                return aTime - bTime;
            });
    }, [schedules]);

    const nextSchedule = useMemo(() => {
        const now = Date.now();
        return sortedSchedules.find((item) => {
            if (!item.scheduled_for) {
                return false;
            }
            const scheduleTime = new Date(item.scheduled_for).getTime();
            return !Number.isNaN(scheduleTime) && scheduleTime >= now - 60 * 1000;
        });
    }, [sortedSchedules]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        scheduled_for: "",
        description: "",
        timezone: "",
    });

    useEffect(() => {
        if (!data.timezone) {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tz) {
                    setData("timezone", tz);
                }
            } catch (error) {
                // Ignore timezone resolution errors in unsupported environments
            }
        }
    }, [data.timezone, setData]);

    const closeSchedule = useCallback(() => {
        setScheduleOpen(false);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                window.clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = undefined;
            }
        };
    }, []);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!space?.slug && !currentSpace?.slug) {
            return;
        }

        post(
            route("space.nobar.schedules.store", {
                space: resolvedSpaceSlug,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset("title", "scheduled_for", "description");
                    closeSchedule();

                    if (toastTimeoutRef.current) {
                        window.clearTimeout(toastTimeoutRef.current);
                        toastTimeoutRef.current = undefined;
                    }

                    setToastMessage("Jadwal berhasil disimpan dan email pengingat telah dikirim.");
                    toastTimeoutRef.current = window.setTimeout(() => {
                        setToastMessage(null);
                        toastTimeoutRef.current = undefined;
                    }, 6000);
                },
            },
        );
    };

    return (
        <>
            <Head title={`Nobar ${resolvedSpaceTitle}`} />

            {toastMessage && (
                <div className="fixed inset-x-0 top-6 z-40 flex justify-center px-4">
                    <div className="flex items-center gap-3 rounded-full bg-emerald-600/95 px-5 py-3 text-sm font-medium text-white shadow-xl shadow-emerald-300/40">
                        <BellRing className="h-4 w-4" aria-hidden="true" />
                        <span>{toastMessage}</span>
                        <button
                            type="button"
                            onClick={() => setToastMessage(null)}
                            className="rounded-full bg-white/20 p-1 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            aria-label="Tutup notifikasi"
                        >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {isScheduleOpen && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={closeSchedule} />
                    <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6">
                        <div className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-white shadow-2xl shadow-pink-200/50">
                            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-pink-100 via-white to-transparent opacity-90" aria-hidden="true" />
                            <div className="relative px-6 py-6 sm:px-8 sm:py-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-pink-500">
                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                            Nobar Scheduler
                                        </span>
                                        <h2 className="text-2xl font-semibold text-slate-900">Atur jadwal nobar untuk {resolvedSpaceTitle}</h2>
                                        <p className="text-sm text-slate-500 max-w-xl">
                                            Undangan email akan dikirim ke anggota space setelah jadwal disimpan. Tombol Join/Create tetap tersedia begitu server self-hosted siap.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeSchedule}
                                        className="rounded-full bg-white/80 p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700 hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                                        aria-label="Tutup jadwal"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-5 shadow-inner shadow-pink-100"
                                    >
                                        <div className="space-y-1.5">
                                            <label htmlFor="nobar-title" className="text-sm font-medium text-slate-700">
                                                Judul acara
                                            </label>
                                            <input
                                                id="nobar-title"
                                                type="text"
                                                value={data.title}
                                                onChange={(event) => setData("title", event.target.value)}
                                                className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                                placeholder="Movie night, konser online, dll"
                                                autoFocus
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-rose-500">{errors.title}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="nobar-schedule" className="text-sm font-medium text-slate-700">
                                                Waktu nobar
                                            </label>
                                            <input
                                                id="nobar-schedule"
                                                type="datetime-local"
                                                value={data.scheduled_for}
                                                onChange={(event) => setData("scheduled_for", event.target.value)}
                                                className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                            />
                                            {data.timezone && (
                                                <p className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Disimpan sebagai zona waktu <span className="font-medium">{data.timezone}</span>
                                                </p>
                                            )}
                                            {errors.scheduled_for && (
                                                <p className="text-sm text-rose-500">{errors.scheduled_for}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="nobar-notes" className="text-sm font-medium text-slate-700">
                                                Catatan tambahan (opsional)
                                            </label>
                                            <textarea
                                                id="nobar-notes"
                                                value={data.description}
                                                onChange={(event) => setData("description", event.target.value)}
                                                className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                                rows={3}
                                                placeholder="Link film, daftar camilan, atau dress code lucu"
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-rose-500">{errors.description}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:shadow-xl hover:shadow-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <MailCheck className="h-4 w-4" aria-hidden="true" />
                                                Kirim pengingat ke email
                                            </button>
                                        </div>
                                    </form>

                                    <div className="rounded-2xl border border-pink-100 bg-white/90 p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900">Agenda nobar kalian</h3>
                                                <p className="text-sm text-slate-500">
                                                    {sortedSchedules.length === 0
                                                        ? "Belum ada jadwal nobar yang tersimpan."
                                                        : "Lihat jadwal terdekat dan siapkan popcornnya 🍿"}
                                                </p>
                                            </div>
                                            {nextSchedule && (
                                                <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
                                                    Jadwal terdekat
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
                                            {sortedSchedules.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-pink-200 bg-pink-50/70 p-6 text-center text-sm text-pink-500">
                                                    Pakai tombol Schedule di halaman ini untuk membuat jadwal pertama kalian.
                                                </div>
                                            ) : (
                                                <ul className="space-y-4">
                                                    {sortedSchedules.map((schedule) => {
                                                        const isHighlighted = nextSchedule?.id === schedule.id;
                                                        const relative = formatRelativeTime(schedule.scheduled_for);

                                                        return (
                                                            <li
                                                                key={schedule.id}
                                                                className={`rounded-xl border px-4 py-3 text-sm transition ${
                                                                    isHighlighted
                                                                        ? "border-pink-300 bg-pink-50/80 shadow-sm shadow-pink-100"
                                                                        : "border-pink-100 bg-white hover:border-pink-200"
                                                                }`}
                                                            >
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-sm font-semibold text-slate-900">{schedule.title}</span>
                                                                        <span className="flex items-center gap-2 text-xs text-slate-500">
                                                                            <Calendar className="h-3.5 w-3.5 text-pink-400" aria-hidden="true" />
                                                                            {formatDateTime(schedule.scheduled_for)}
                                                                        </span>
                                                                    </div>
                                                                    {schedule.description && (
                                                                        <p className="text-xs text-slate-600 whitespace-pre-line">
                                                                            {schedule.description}
                                                                        </p>
                                                                    )}
                                                                    {relative && (
                                                                        <span className="inline-flex w-fit items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-pink-600 shadow-inner">
                                                                            {relative}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative min-h-screen bg-gradient-to-br from-rose-950 via-slate-950 to-slate-900 px-4 py-10 sm:px-8">
                <div className="mx-auto flex max-w-6xl flex-col gap-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-200">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                                Nobar Room (Self-hosted)
                            </p>
                            <h1 className="text-3xl font-semibold text-white">
                                {resolvedSpaceTitle}
                            </h1>
                            <p className="max-w-2xl text-sm text-rose-100/80">
                                Streaming room ini akan menggunakan signaling self-hosted (tanpa layanan berbayar). Pengaturan jadwal tetap berjalan; tombol Join/Create akan aktif setelah server WebRTC siap.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setScheduleOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-white/20 transition hover:bg-white/20 hover:ring-white/40"
                        >
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            Buka jadwal nobar
                        </button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
                        <div className="relative overflow-hidden rounded-3xl border border-rose-200/30 bg-white/5 p-6 shadow-xl shadow-rose-900/30 backdrop-blur">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.06),transparent_35%)]" />
                            <div className="relative flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-rose-100">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                        <Monitor className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-rose-100/80">Streaming Room</p>
                                        <p className="text-lg font-semibold text-white">
                                            Self-hosted WebRTC coming online
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-3 text-sm text-rose-100/80 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center gap-2 text-rose-50">
                                            <Video className="h-4 w-4" />
                                            Camera/Screen
                                        </div>
                                        <p className="mt-2 text-xs text-rose-100/70">
                                            Ready to toggle once signaling server is running.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center gap-2 text-rose-50">
                                            <Mic className="h-4 w-4" />
                                            Mic & Host control
                                        </div>
                                        <p className="mt-2 text-xs text-rose-100/70">
                                            Self-hosted controls; no billing or third-party SDK.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center gap-2 text-rose-50">
                                            <Sparkles className="h-4 w-4" />
                                            Chat & Participants
                                        </div>
                                        <p className="mt-2 text-xs text-rose-100/70">
                                            Presence, chat, and kicks will run on private channels.
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-rose-50">
                                    Tombol join/create akan muncul setelah server WebRTC & signaling dikonfigurasi. Tidak ada dependensi vendor pihak ketiga atau layanan berbayar.
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-rose-200/40 bg-white/5 p-6 text-rose-50 shadow-xl shadow-rose-900/30 backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Agenda nobar kalian</h3>
                                    <p className="text-sm text-rose-100/80">
                                        Jadwal dan pengingat email tetap aktif.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setScheduleOpen(true)}
                                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/20 transition hover:bg-white/15"
                                >
                                    Atur jadwal
                                </button>
                            </div>
                            <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
                                {sortedSchedules.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-rose-200/60 bg-white/5 p-6 text-center text-sm text-rose-100/80">
                                        Belum ada jadwal nobar yang tersimpan.
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {sortedSchedules.map((schedule) => {
                                            const isHighlighted = nextSchedule?.id === schedule.id;
                                            const relative = formatRelativeTime(schedule.scheduled_for);

                                            return (
                                                <li
                                                    key={schedule.id}
                                                    className={`rounded-xl border px-4 py-3 text-sm transition ${
                                                        isHighlighted
                                                            ? "border-rose-300/70 bg-white/10 shadow-sm shadow-rose-900/30"
                                                            : "border-rose-200/40 bg-white/5 hover:border-rose-200/70"
                                                    }`}
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-semibold text-white">{schedule.title}</span>
                                                            <span className="flex items-center gap-2 text-xs text-rose-100/80">
                                                                <Calendar className="h-3.5 w-3.5 text-rose-200" aria-hidden="true" />
                                                                {formatDateTime(schedule.scheduled_for)}
                                                            </span>
                                                        </div>
                                                        {schedule.description && (
                                                            <p className="text-xs text-rose-100/75 whitespace-pre-line">
                                                                {schedule.description}
                                                            </p>
                                                        )}
                                                        {relative && (
                                                            <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-rose-50 shadow-inner">
                                                                {relative}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
