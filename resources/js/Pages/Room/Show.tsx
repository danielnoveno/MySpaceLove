import { Head, useForm, usePage } from "@inertiajs/react";
import { FormEvent, useEffect, useMemo } from "react";
import { Calendar, Clock, MailCheck, Sparkles } from "lucide-react";
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

const TUIROOMKIT_ENTRY_PATH = "/tuiroomkit/index.html";

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

    const resolvedUserId = currentUser?.id
        ? `user-${String(currentUser.id)}`
        : `guest-${spaceId}`;
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

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
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
                },
            },
        );
    };

    const iframeSrc = useMemo(() => {
        const params = new URLSearchParams({
            roomId: `space-${spaceId}`,
            userId: resolvedUserId,
            userName: resolvedUserName,
            lang: "id-ID",
            spaceSlug: resolvedSpaceSlug,
            spaceTitle: resolvedSpaceTitle,
            dashboardUrl: `/spaces/${resolvedSpaceSlug}/dashboard`,
        });

        if (avatarUrl) {
            params.set("avatarUrl", avatarUrl);
        }

        return `${TUIROOMKIT_ENTRY_PATH}?${params.toString()}`;
    }, [avatarUrl, resolvedSpaceSlug, resolvedSpaceTitle, resolvedUserId, resolvedUserName, spaceId]);

    return (
        <>
            <Head title={`Nobar ${resolvedSpaceTitle}`} />
            <div className="min-h-screen bg-neutral-900 flex flex-col">
                <section className="w-full bg-gradient-to-b from-pink-50 via-white to-purple-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col gap-3 text-center">
                                <span className="inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.32em] text-pink-500">
                                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                                    Nobar Space
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                                    Jadwalkan nobar dengan {resolvedSpaceTitle}
                                </h1>
                                <p className="text-base text-slate-600 max-w-3xl mx-auto">
                                    Buat pengingat nobar yang otomatis terkirim ke email kalian berdua. Tetap gunakan ruangan TUIRoomKit di bawah untuk streaming bareng seperti biasa.
                                </p>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                                <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/60 border border-pink-100 p-6 sm:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                                            <Calendar className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Buat Jadwal Nobar</h2>
                                            <p className="text-sm text-slate-500">Undang pasanganmu dengan reminder otomatis via email.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-1">
                                            <label htmlFor="nobar-title" className="text-sm font-medium text-slate-700">
                                                Judul acara
                                            </label>
                                            <input
                                                id="nobar-title"
                                                type="text"
                                                value={data.title}
                                                onChange={(event) => setData("title", event.target.value)}
                                                className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
                                                placeholder="Movie night, konser online, dll"
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-rose-500">{errors.title}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="nobar-schedule" className="text-sm font-medium text-slate-700">
                                                Waktu nobar
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <input
                                                        id="nobar-schedule"
                                                        type="datetime-local"
                                                        value={data.scheduled_for}
                                                        onChange={(event) => setData("scheduled_for", event.target.value)}
                                                        className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-2.5 text-sm text-slate-900 focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
                                                    />
                                                </div>
                                            </div>
                                            {data.timezone && (
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Disimpan sebagai zona waktu <span className="font-medium">{data.timezone}</span>
                                                </p>
                                            )}
                                            {errors.scheduled_for && (
                                                <p className="text-sm text-rose-500">{errors.scheduled_for}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="nobar-notes" className="text-sm font-medium text-slate-700">
                                                Catatan tambahan (opsional)
                                            </label>
                                            <textarea
                                                id="nobar-notes"
                                                value={data.description}
                                                onChange={(event) => setData("description", event.target.value)}
                                                className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-2.5 text-sm text-slate-900 focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
                                                rows={3}
                                                placeholder="Link film, daftar camilan, atau dress code lucu"
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-rose-500">{errors.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:shadow-xl hover:shadow-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <MailCheck className="h-4 w-4" aria-hidden="true" />
                                                Kirim pengingat ke email
                                            </button>
                                            {recentlySuccessful && (
                                                <p className="text-sm text-emerald-600">Jadwal berhasil disimpan dan email pengingat telah dikirim.</p>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-white rounded-3xl border border-pink-100/70 p-6 sm:p-8 shadow-lg shadow-pink-100/40">
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Agenda nobar kalian</h2>
                                            <p className="text-sm text-slate-500">Lihat jadwal terdekat dan siapkan popcornnya 🍿</p>
                                        </div>
                                        {nextSchedule && (
                                            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
                                                Jadwal terdekat
                                            </span>
                                        )}
                                    </div>

                                    {sortedSchedules.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/60 p-8 text-center">
                                            <p className="text-sm font-medium text-pink-600">Belum ada jadwal nobar.</p>
                                            <p className="mt-2 text-sm text-pink-500">Isi formulir di samping untuk mulai menjadwalkan sesi perdana kalian.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-5">
                                            {sortedSchedules.map((schedule) => {
                                                const isHighlighted = nextSchedule?.id === schedule.id;
                                                const relative = formatRelativeTime(schedule.scheduled_for);
                                                return (
                                                    <li
                                                        key={schedule.id}
                                                        className={`rounded-2xl border px-5 py-4 transition shadow-sm ${
                                                            isHighlighted
                                                                ? "border-pink-300 bg-pink-50/80 shadow-pink-100"
                                                                : "border-pink-100 bg-white/80 hover:border-pink-200"
                                                        }`}
                                                    >
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                <div>
                                                                    <h3 className="text-base font-semibold text-slate-900">{schedule.title}</h3>
                                                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-pink-400" aria-hidden="true" />
                                                                        <span>{formatDateTime(schedule.scheduled_for)}</span>
                                                                    </p>
                                                                </div>
                                                                {relative && (
                                                                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-pink-600 shadow-inner">
                                                                        {relative}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {schedule.description && (
                                                                <p className="text-sm text-slate-600 whitespace-pre-line">
                                                                    {schedule.description}
                                                                </p>
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
                </section>

                <div className="flex-1 bg-neutral-900">
                    <iframe
                        title="Tencent Nobar Room"
                        src={iframeSrc}
                        className="h-full w-full border-0 bg-neutral-900"
                        allowFullScreen
                        allow="microphone; camera; fullscreen; display-capture; clipboard-read; clipboard-write; speaker"
                    />
                </div>
            </div>
        </>
    );
}
