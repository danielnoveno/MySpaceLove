import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useToast } from "@/Contexts/ToastContext";
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

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const compressImageToJpeg = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/")) {
        throw new Error("File is not an image.");
    }

    // Keep small files and non-raster types as-is.
    if (file.size <= MAX_UPLOAD_BYTES || file.type === "image/svg+xml" || file.type === "image/gif") {
        return file;
    }

    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image."));
        };
        img.src = url;
    });

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(imageElement.width, imageElement.height));
    const targetWidth = Math.max(1, Math.round(imageElement.width * scale));
    const targetHeight = Math.max(1, Math.round(imageElement.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas context unavailable.");
    }
    ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.78),
    );

    if (!blob) {
        return file;
    }

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
};

export default function CountdownCreate() {
    const currentSpace = useCurrentSpace();
    const { showSuccess, showError } = useToast();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const form = useForm({
        event_name: "",
        event_date: new Date().toISOString().split("T")[0],
        description: "",
        activities: [] as string[],
        image: null as File | null,
    });
    const { data, setData, post, processing, errors, clearErrors } = form;

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

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
        post(route("countdown.store", { space: spaceSlug }), {
            forceFormData: true,
            onSuccess: () => {
                showSuccess("Event countdown berhasil dibuat!");
            },
            onError: (errors) => {
                console.error("Countdown creation failed", errors);
                showError("Gagal membuat countdown. Silakan periksa kembali input Anda.");
            },
        });
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

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileError(null);

        try {
            const processed = await compressImageToJpeg(file);

            if (processed.size > MAX_UPLOAD_BYTES) {
                setFileError("Ukuran maksimal 2MB. Coba pilih/resize gambar lebih kecil.");
                setData("image", null);
                setImagePreview(null);
                return;
            }

            setData("image", processed);

            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(processed));
        } catch (error) {
            console.error("Error processing image:", error);
            setFileError("Failed to process image. Make sure the file format is supported and try again.");
            setData("image", null);
            setImagePreview(null);
        }
    };

    const removeImage = () => {
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
                heartCount: 40,
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
                            Tambah Event Spesial
                        </h1>
                        <p className="text-sm text-violet-500">
                            Susun countdown romantis untuk space {spaceTitle}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Tambah Countdown - ${spaceTitle}`} />

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
                                Apa acaranya?
                            </h2>
                            <p className="text-sm text-violet-500">
                                Tulis nama event, tanggal penting, dan sedikit
                                cerita biar kalian sama-sama menantikan momennya.
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
                                        Tambahkan rencana kecil biar countdown-nya makin bermakna.
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
                                        Upload foto yang menggambarkan event ini.
                                        Opsional tapi bikin countdown makin cantik.
                                    </p>
                                </div>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        data-love-hover
                                        style={loveHoverSecondary}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-600 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                        Hapus Poster
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
                                <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-200 bg-white/90 px-6 py-10 text-center text-sm text-violet-500 transition hover:border-violet-400 hover:bg-violet-50">
                                    <Upload className="h-10 w-10 text-violet-400" />
                                    <span className="mt-3 font-semibold text-violet-700">
                                        Pilih Poster Event
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
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview poster event"
                                            className="h-48 w-full rounded-2xl object-cover shadow-lg"
                                        />
                                    ) : (
                                        <p className="text-center text-sm text-violet-500">
                                            Poster belum dipilih. Kamu boleh melewati langkah ini.
                                        </p>
                                    )}
                                </div>
                            </div>
                            {fileError && (
                                <p className="text-xs text-rose-500 mt-2">{fileError}</p>
                            )}
                            {errors.image && (
                                <p className="text-xs text-rose-500 mt-2">
                                    {errors.image === "validation.uploaded"
                                        ? "Ukuran poster terlalu besar. Coba unggah file di bawah 2MB."
                                        : errors.image}
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
                                {processing ? "Menyimpan..." : "Simpan Event"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
