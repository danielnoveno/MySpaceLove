import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import {
    ArrowLeft,
    Calendar,
    Plus,
    Sparkles,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
} from "react";

interface CountdownPayload {
    id: number;
    event_name: string;
    event_date: string;
    description?: string | null;
    activities?: string[] | null;
    image?: string | null;
}

interface FormData {
    event_name: string;
    event_date: string;
    description: string;
    activities: string[];
    image: File | null;
    _method: "PUT";
}

export default function CountdownEdit({
    countdown,
}: {
    countdown: CountdownPayload;
}) {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const initialActivities = useMemo(
        () =>
            Array.isArray(countdown?.activities)
                ? countdown.activities.filter(
                      (activity): activity is string =>
                          typeof activity === "string",
                  )
                : [],
        [countdown?.activities],
    );

    const form = useForm<FormData>({
        event_name: countdown?.event_name ?? "",
        event_date: countdown?.event_date
            ? new Date(countdown.event_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        description: countdown?.description ?? "",
        activities: initialActivities,
        image: null,
        _method: "PUT",
    });

    const { data, setData, post, processing, errors, clearErrors } = form;

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const existingImageUrl = countdown?.image
        ? `/storage/${countdown.image}`
        : null;
    const activePreview = imagePreview ?? existingImageUrl;

    const loveHoverPrimary = {
        "--love-hover-color": "#8b5cf6",
    } as CSSProperties;
    const loveHoverSecondary = {
        "--love-hover-color": "#6b7280",
    } as CSSProperties;
    const loveHoverAccent = {
        "--love-hover-color": "#a855f7",
    } as CSSProperties;
    const loveHoverDelete = {
        "--love-hover-color": "#ef4444",
    } as CSSProperties;

    const hasActivities = useMemo(
        () => data.activities.length > 0,
        [data.activities.length],
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrors();
        form.transform((payload) => {
            const prunedActivities = payload.activities
                .map((activity) => activity.trim())
                .filter((activity) => activity.length > 0);

            const transformed: Record<string, unknown> = {
                ...payload,
                activities: prunedActivities,
            };

            if (!(payload.image instanceof File)) {
                delete transformed.image;
            }

            return transformed;
        });
        post(
            route("countdown.update", {
                space: spaceSlug,
                id: countdown.id,
            }),
            {
                forceFormData: true,
            },
        );
    };

    const handleActivityChange = (index: number, value: string) => {
        const updated = [...data.activities];
        updated[index] = value;
        setData("activities", updated);
    };

    const addActivity = () => {
        setData("activities", [...data.activities, ""]);
    };

    const removeActivity = (index: number) => {
        const updated = data.activities.filter((_, idx) => idx !== index);
        setData("activities", updated);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setData("image", file);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const clearSelectedImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setData("image", null);
    };

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#8b5cf6",
                heartCount: 38,
                className: "opacity-55",
            }}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("countdown.index", { space: spaceSlug })}
                        className="rounded-lg p-2 transition hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-violet-900">
                            Edit Event Spesial
                        </h1>
                        <p className="text-sm text-violet-500">
                            Perbarui countdown romantis untuk space {spaceTitle}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Countdown - ${spaceTitle}`} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ede9fe_0,_transparent_45%)] opacity-50" />

                <div className="relative mx-auto w-full max-w-4xl">
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 space-y-10 rounded-[30px] border border-violet-100 bg-white/85 p-8 shadow-xl backdrop-blur-sm md:p-10"
                    >
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-violet-500">
                                <Sparkles className="h-3 w-3" />
                                Detail Event
                            </span>
                            <h2 className="text-2xl font-semibold text-violet-900">
                                Update informasi utama
                            </h2>
                            <p className="text-sm text-violet-500">
                                Perbaiki nama event, tanggal spesial, dan deskripsi biar kalian tetap excited nunggu momennya.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-violet-900">
                                    Nama Event
                                </label>
                                <input
                                    type="text"
                                    value={data.event_name}
                                    onChange={(event) =>
                                        setData("event_name", event.target.value)
                                    }
                                    className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-violet-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                    placeholder="Contoh: Anniversary ke-3"
                                />
                                {errors.event_name && (
                                    <p className="text-xs text-rose-500">
                                        {errors.event_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-violet-900">
                                    Tanggal Event
                                </label>
                                <div className="relative">
                                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                                    <input
                                        type="date"
                                        value={data.event_date}
                                        onChange={(event) =>
                                            setData(
                                                "event_date",
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border border-violet-200 bg-white px-10 py-3 text-sm text-violet-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                    />
                                </div>
                                {errors.event_date && (
                                    <p className="text-xs text-rose-500">
                                        {errors.event_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-violet-900">
                                Deskripsi Singkat
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(event) =>
                                    setData("description", event.target.value)
                                }
                                rows={4}
                                className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-violet-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                placeholder="Ceritakan sedikit tentang event ini dan kenapa kamu excited."
                            />
                            {errors.description && (
                                <p className="text-xs text-rose-500">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 rounded-3xl border border-violet-100 bg-violet-50/60 p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-violet-900">
                                        Agenda Aktivitas
                                    </h3>
                                    <p className="text-sm text-violet-500">
                                        Tambahkan atau edit rencana kecil biar countdown semakin bermakna.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addActivity}
                                    data-love-hover
                                    style={loveHoverAccent}
                                    className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-600 transition hover:bg-violet-500 hover:text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Agenda
                                </button>
                            </div>

                            {hasActivities ? (
                                <div className="space-y-3">
                                    {data.activities.map((activity, index) => (
                                        <div
                                            key={`activity-${index}`}
                                            className="flex flex-col gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-900 shadow-sm sm:flex-row sm:items-center"
                                        >
                                            <input
                                                type="text"
                                                value={activity}
                                                onChange={(event) =>
                                                    handleActivityChange(
                                                        index,
                                                        event.target.value,
                                                    )
                                                }
                                                className="flex-1 rounded-xl border border-transparent bg-violet-50 px-3 py-2 text-sm text-violet-900 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                                placeholder={`Agenda #${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeActivity(index)
                                                }
                                                data-love-hover
                                                style={loveHoverDelete}
                                                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-2xl border border-dashed border-violet-200 bg-white/70 px-4 py-6 text-center text-sm text-violet-500">
                                    No agenda yet. Click &quot;Add Agenda&quot; to start planning your romantic activities.
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-violet-900">
                                        Poster / Thumbnail
                                    </h3>
                                    <p className="text-sm text-violet-500">
                                        Unggah poster baru untuk event ini. Jika tidak, poster lama akan tetap digunakan.
                                    </p>
                                </div>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={clearSelectedImage}
                                        data-love-hover
                                        style={loveHoverSecondary}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-600 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                        Batalkan poster baru
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
                                <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-200 bg-white/90 px-6 py-10 text-center text-sm text-violet-500 transition hover:border-violet-400 hover:bg-violet-50">
                                    <Upload className="h-10 w-10 text-violet-400" />
                                    <span className="mt-3 font-semibold text-violet-700">
                                        Pilih Poster Baru
                                    </span>
                                    <span className="mt-1 text-xs text-violet-400">
                                        Format JPG, PNG, atau GIF (maks 2 MB)
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                <div className="flex items-center justify-center rounded-3xl border border-violet-100 bg-violet-50/60 p-4">
                                    {activePreview ? (
                                        <img
                                            src={activePreview}
                                            alt="Preview poster event"
                                            className="h-48 w-full rounded-2xl object-cover shadow-lg"
                                        />
                                    ) : (
                                        <p className="text-center text-sm text-violet-500">
                                            No poster displayed yet. Upload a new poster to replace it.
                                        </p>
                                    )}
                                </div>
                            </div>
                            {errors.image && (
                                <p className="text-xs text-rose-500">
                                    {errors.image}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <Link
                                href={route("countdown.index", {
                                    space: spaceSlug,
                                })}
                                data-love-hover
                                style={loveHoverSecondary}
                                className="flex-1 rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-600 hover:text-white"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                data-love-hover
                                style={loveHoverPrimary}
                                className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? "Menyimpan..." : "Update Event"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
