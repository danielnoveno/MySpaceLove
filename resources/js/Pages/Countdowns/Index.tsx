import ConfirmDialog from "@/Components/ConfirmDialog";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { Head, Link, router } from "@inertiajs/react";
import { Calendar, Edit, Sparkles, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState, type CSSProperties } from "react";

interface CountdownItem {
    id: number;
    event_name: string;
    event_date: string;
    description?: string;
    activities?: string[];
    image?: string | null;
}

interface Props {
    items: CountdownItem[];
}

type CountdownTone = "future" | "present" | "past" | "unset";

const toneClasses: Record<CountdownTone, string> = {
    future: "border-emerald-200 bg-emerald-50 text-emerald-600",
    present: "border-amber-200 bg-amber-50 text-amber-700",
    past: "border-slate-200 bg-slate-100 text-slate-600",
    unset: "border-violet-200 bg-violet-50 text-violet-600",
};


const parseDateValue = (value?: string | null): Date | null => {
    if (!value) {
        return null;
    }

    const normalized = value.includes("T") ? value : `${value}T00:00:00`;
    const parsed = new Date(normalized);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function CountdownIndex({ items }: Props) {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const [pendingDelete, setPendingDelete] = useState<CountdownItem | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const formatEventDate = useCallback((value?: string | null) => {
        const date = parseDateValue(value);

        if (!date) {
            return value ?? "-";
        }

        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }, []);

    const buildCountdownMeta = useCallback(
        (value?: string | null): {
            label: string;
            tone: CountdownTone;
            daysUntil: number | null;
            timestamp: number;
        } => {
            const target = parseDateValue(value);

            if (!target) {
                return {
                    label: "Not scheduled",
                    tone: "unset",
                    daysUntil: null,
                    timestamp: Number.MAX_SAFE_INTEGER,
                };
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);

            const diffDays = Math.round(
                (target.getTime() - today.getTime()) / 86400000,
            );

            if (diffDays > 1) {
                return {
                    label: `${diffDays} days left`,
                    tone: "future",
                    daysUntil: diffDays,
                    timestamp: target.getTime(),
                };
            }

            if (diffDays === 1) {
                return {
                    label: "Tomorrow",
                    tone: "future",
                    daysUntil: diffDays,
                    timestamp: target.getTime(),
                };
            }

            if (diffDays === 0) {
                return {
                    label: "Today!",
                    tone: "present",
                    daysUntil: diffDays,
                    timestamp: target.getTime(),
                };
            }

            return {
                label: `${Math.abs(diffDays)} days ago`,
                tone: "past",
                daysUntil: diffDays,
                timestamp: target.getTime(),
            };
        },
        [],
    );

    const events = useMemo(() => {
        return items
            .map((item) => {
                const meta = buildCountdownMeta(item.event_date);
                const imageUrl = item.image ? `/storage/${item.image}` : null;
                const activities = Array.isArray(item.activities)
                    ? item.activities.filter(
                          (activity) =>
                              typeof activity === "string" &&
                              activity.trim().length > 0,
                      )
                    : [];

                return {
                    ...item,
                    formattedDate: formatEventDate(item.event_date),
                    countdownLabel: meta.label,
                    countdownTone: meta.tone,
                    daysUntil: meta.daysUntil,
                    timestamp: meta.timestamp,
                    imageUrl,
                    activities,
                };
            })
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [items, buildCountdownMeta, formatEventDate]);

    const scheduledUpcoming = useMemo(
        () =>
            events.filter(
                (event) =>
                    typeof event.daysUntil === "number" && event.daysUntil >= 0,
            ),
        [events],
    );
    const completedEvents = useMemo(
        () =>
            events.filter(
                (event) =>
                    typeof event.daysUntil === "number" && event.daysUntil < 0,
            ),
        [events],
    );
    const unscheduledEvents = useMemo(
        () => events.filter((event) => event.daysUntil === null),
        [events],
    );

    const nextEvent =
        scheduledUpcoming[0] ?? unscheduledEvents[0] ?? events[0] ?? null;

    const upcomingCount = scheduledUpcoming.length;
    const pastCount = completedEvents.length;
    const draftCount = unscheduledEvents.length;
    const totalEvents = events.length;

    const loveHoverCreate = {
        "--love-hover-color": "#a855f7",
    } as CSSProperties;
    const loveHoverEdit = {
        "--love-hover-color": "#8b5cf6",
    } as CSSProperties;
    const loveHoverDelete = {
        "--love-hover-color": "#ef4444",
    } as CSSProperties;

    const confirmDelete = useCallback((item: CountdownItem) => {
        setPendingDelete(item);
    }, []);

    const handleDelete = () => {
        if (!pendingDelete) {
            return;
        }
        setDeleting(true);

        router.delete(
            route("countdown.destroy", {
                space: spaceSlug,
                id: pendingDelete.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDelete(null);
                },
                onError: () => {
                    setPendingDelete(null);
                },
                onFinish: () => setDeleting(false),
            },
        );
    };

    const renderEventCard = (event: (typeof events)[number]) => {
        const countdownClass = toneClasses[event.countdownTone] ?? toneClasses.unset;

        return (
            <article
                key={event.id}
                className="group relative overflow-hidden rounded-[26px] border border-violet-100/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="relative h-56 w-full overflow-hidden">
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.event_name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-violet-100 via-white to-fuchsia-100 text-violet-600">
                            <Sparkles className="h-10 w-10" />
                            <span className="text-sm font-medium">
                                No event poster yet
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent px-6 py-4 text-white">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                            <Calendar className="h-4 w-4 text-white/70" />
                            {event.formattedDate}
                        </div>
                        <h3 className="mt-1 text-lg font-semibold">
                            {event.event_name}
                        </h3>
                    </div>
                </div>

            <div className="space-y-4 p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm leading-relaxed text-violet-600/80">
                            {event.description?.trim().length
                                ? event.description
                                : "No description yet. Write a little story to make this event more special."}
                        </p>
                        <span
                            className={`inline-flex min-w-[130px] items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] ${countdownClass}`}
                        >
                            {event.countdownLabel}
                        </span>
                    </div>

                    {event.activities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {event.activities.map((activity, index) => (
                                <span
                                    key={`${event.id}-activity-${index}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    {activity}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <Link
                            href={route("countdown.edit", {
                                space: spaceSlug,
                                id: event.id,
                            })}
                            data-love-hover
                            style={loveHoverEdit}
                            className="inline-flex items-center gap-2 rounded-full border border-violet-200 px-4 py-2 text-sm font-medium text-violet-600 transition hover:bg-violet-500 hover:text-white"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={() => confirmDelete(event)}
                            data-love-hover
                            style={loveHoverDelete}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500 hover:text-white"
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                        </button>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#8b5cf6",
                heartCount: 38,
                className: "opacity-55",
            }}
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.45em] text-violet-400">
                        Rencana spesial
                    </p>
                    <h2 className="text-3xl font-semibold text-violet-900">
                        Upcoming Events - {spaceTitle}
                    </h2>
                </div>
            }
        >
            <Head title={`Upcoming Events - ${spaceTitle}`} />

            <div className="relative mx-auto max-w-6xl space-y-10 px-6 pb-16">
                <section className="rounded-[28px] border border-violet-100/80 bg-white/85 p-8 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.45em] text-violet-400">
                                Countdown romantis
                            </p>
                            <h3 className="text-2xl font-semibold text-violet-900">
                                Simpan semua agenda spesial kalian
                            </h3>
                            <p className="mt-2 text-sm text-violet-500">
                                Tandai tanggal penting supaya selalu siap kasih kejutan terbaik buat pasanganmu.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-violet-100/70 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 text-sm text-violet-700">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
                                        Mendatang
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {upcomingCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
                                        Selesai
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {pastCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
                                        Tanpa tanggal
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {draftCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
                                        Total
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {totalEvents}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={route("countdown.create", {
                                    space: spaceSlug,
                                })}
                                data-love-hover
                                style={loveHoverCreate}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200"
                            >
                                <Sparkles className="h-4 w-4" />
                                Tambah Event
                            </Link>
                        </div>
                    </div>

                    {nextEvent ? (
                        <div className="mt-6 rounded-2xl border border-violet-100/70 bg-violet-50/70 p-6 text-sm text-violet-700">
                            <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
                                Event terdekat
                            </p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-violet-900">
                                        {nextEvent.event_name}
                                    </h4>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                                        <span className="inline-flex items-center gap-2 text-violet-600">
                                            <Calendar className="h-4 w-4" />
                                            {nextEvent.formattedDate}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] ${toneClasses[nextEvent.countdownTone]}`}
                                >
                                    {nextEvent.countdownLabel}
                                </span>
                            </div>
                        </div>
                    ) : !events.length ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-6 text-sm text-violet-500">
                            No special events recorded yet. Start filling your romantic event list!
                        </div>
                    ) : null}
                </section>

                {events.length === 0 ? (
                    <section className="rounded-[28px] border border-dashed border-violet-200 bg-white/70 p-12 text-center text-sm text-violet-500 shadow-sm">
                        <p>
                            Tambahkan tanggal penting seperti anniversary, video call jarak jauh, atau quality time berikutnya.
                        </p>
                        <p className="mt-1">
                            Kami bantu hitung mundurnya supaya kamu selalu siap kasih kejutan terbaik.
                        </p>
                    </section>
                ) : (
                    <>
                        {scheduledUpcoming.length > 0 && (
                            <section className="space-y-6">
                                <h3 className="text-xl font-semibold text-violet-900">
                                    Event Mendatang
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {scheduledUpcoming.map(renderEventCard)}
                                </div>
                            </section>
                        )}

                        {unscheduledEvents.length > 0 && (
                            <section className="space-y-6">
                                <h3 className="text-xl font-semibold text-violet-900">
                                    Draft & Perlu Jadwal
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {unscheduledEvents.map(renderEventCard)}
                                </div>
                            </section>
                        )}

                        {completedEvents.length > 0 && (
                            <section className="space-y-6 border-t border-violet-100 pt-10">
                                <h3 className="text-xl font-semibold text-violet-900">
                                    Event Selesai
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {completedEvents.map(renderEventCard)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <ConfirmDialog
                open={pendingDelete !== null}
                title={
                    pendingDelete
                        ? `Hapus "${pendingDelete.event_name}"?`
                        : "Hapus event?"
                }
                description={
                    pendingDelete
                        ? `Event countdown "${pendingDelete.event_name}" akan dihapus dari daftar dan tidak bisa dipulihkan.`
                        : "Event countdown akan dihapus dari daftar."
                }
                confirmLabel="Ya, hapus event"
                cancelLabel="Batal"
                tone="danger"
                loading={deleting}
                onCancel={() => {
                    if (!deleting) {
                        setPendingDelete(null);
                    }
                }}
                onConfirm={handleDelete}
            />
        </AuthenticatedLayout>
    );
}




