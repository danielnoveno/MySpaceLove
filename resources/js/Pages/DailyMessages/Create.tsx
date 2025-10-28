import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import {
    ArrowLeft,
    CalendarDays,
    Loader2,
    Sparkles,
    Wand2,
} from "lucide-react";
import { PageProps } from "@/types";

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}

interface NoticeState {
    tone: "success" | "error";
    message: string;
}

export default function DailyMessageCreate() {
    const currentSpace = useCurrentSpace();
    const { props } = usePage<
        PageProps & {
            space?: {
                id: number;
                slug: string;
                title: string;
            } | null;
        }
    >();
    const resolvedSpace = currentSpace ?? props.space ?? null;

    if (!resolvedSpace) {
        return null;
    }

    const spaceSlug = resolvedSpace.slug;
    const spaceTitle = resolvedSpace.title;

    const today = new Date().toISOString().split("T")[0];

    const form = useForm({
        date: today,
        message: "",
    });

    const { data, setData, post, errors, processing } = form;

    const [loadingAI, setLoadingAI] = useState(false);
    const [mood, setMood] = useState("");
    const [notice, setNotice] = useState<NoticeState | null>(null);

    useEffect(() => {
        const token = getCookie("XSRF-TOKEN");
        if (token) {
            axios.defaults.headers.common["X-XSRF-TOKEN"] = token;
        }
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!data.date) {
            setNotice({
                tone: "error",
                message: "Tanggal wajib dipilih sebelum menyimpan pesan harian.",
            });
            return;
        }

        setNotice(null);
        post(route("daily.store", { space: spaceSlug }));
    };

    const generateAI = async () => {
        if (!data.date) {
            setNotice({
                tone: "error",
                message: "Pilih tanggal terlebih dahulu sebelum meminta AI menulis pesan.",
            });
            return;
        }

        setLoadingAI(true);
        setNotice(null);

        const isImprovisation = data.message.trim().length > 0;

        try {
            const payload: {
                date: string;
                message?: string;
                mood?: string;
            } = {
                date: data.date,
            };

            if (isImprovisation) {
                payload.message = data.message;
            }

            if (mood.trim().length > 0) {
                payload.mood = mood.trim();
            }

            const regenerateUrl =
                route("daily.regenerate", { space: spaceSlug }) + "?json=true";

            const response = await axios.post(regenerateUrl, payload, {
                headers: { "Content-Type": "application/json" },
            });

            const aiMessage = response.data?.message?.message;

            if (aiMessage) {
                setData("message", aiMessage);
                setNotice({
                    tone: "success",
                    message: isImprovisation
                        ? "Pesan berhasil diimprovisasi oleh AI."
                        : "Pesan romantis dari AI siap disimpan!",
                });
            } else {
                setNotice({
                    tone: "error",
                    message:
                        "AI tidak mengembalikan pesan. Coba lagi beberapa saat lagi.",
                });
            }
        } catch (error) {
            console.error("Generate AI error:", error);
            const errMsg =
                (axios.isAxiosError(error)
                    ? error.response?.data?.error
                    : null) ??
                "Gagal meminta AI menulis pesan. Silakan coba ulang.";
            setNotice({
                tone: "error",
                message: errMsg,
            });
        } finally {
            setLoadingAI(false);
        }
    };

    const baseFieldClass =
        "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200";

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#ec4899",
                heartCount: 32,
                className: "opacity-70",
            }}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("daily.index", { space: spaceSlug })}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Tambah Pesan Harian
                        </h1>
                        <p className="text-sm text-slate-500">
                            Kirimkan kalimat manis untuk {spaceTitle}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Tambah Pesan Harian - ${spaceTitle}`} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 py-10 sm:px-6 lg:px-8">
                <div className="absolute inset-x-8 top-20 hidden h-56 rounded-full bg-pink-200/40 blur-3xl md:block" aria-hidden="true" />

                <div className="relative mx-auto max-w-3xl">
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 space-y-8 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur md:p-10"
                    >
                        <div className="rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-100/60 to-rose-100/60 px-6 py-5 text-sm text-pink-700 shadow-inner">
                            <div className="flex items-start gap-3">
                                <Sparkles className="mt-1 h-5 w-5 text-pink-500" />
                                <div>
                                    <p className="font-semibold">
                                        Tulis pesannya, biarkan AI menghangatkan suasana.
                                    </p>
                                    <p className="mt-1 text-pink-600">
                                        Kamu bisa memberi konteks mood supaya pesan terasa lebih personal.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {notice && (
                            <div
                                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                                    notice.tone === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-rose-200 bg-rose-50 text-rose-600"
                                }`}
                            >
                                {notice.message}
                            </div>
                        )}

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-800">
                                    Tanggal Pesan
                                </label>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(event) =>
                                            setData("date", event.target.value)
                                        }
                                        className={`${baseFieldClass} pl-10`}
                                    />
                                </div>
                                {errors.date && (
                                    <p className="text-xs text-rose-500">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-800">
                                    Pesan Romantis
                                </label>
                                <textarea
                                    value={data.message}
                                    onChange={(event) =>
                                        setData("message", event.target.value)
                                    }
                                    rows={5}
                                    className={`${baseFieldClass} min-h-[140px] resize-y`}
                                    placeholder="Tuliskan pesan dari hati atau minta AI bantu menyusunnya."
                                />
                                {errors.message && (
                                    <p className="text-xs text-rose-500">
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-800">
                                    Mood / Prompt Tambahan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={mood}
                                    onChange={(event) =>
                                        setMood(event.target.value)
                                    }
                                    placeholder="Contoh: Kita lagi LDR dan kangen banget malam ini."
                                    className={baseFieldClass}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={generateAI}
                                disabled={loadingAI}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-pink-200 bg-white/80 px-6 py-3 text-sm font-semibold text-pink-600 shadow-sm transition hover:border-pink-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loadingAI ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Wand2 className="h-4 w-4" />
                                )}
                                {loadingAI
                                    ? "Memproses..."
                                    : data.message.trim().length > 0
                                    ? "Improvisasi dengan AI"
                                    : "Generate Pesan AI"}
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {processing ? "Menyimpan..." : "Simpan Pesan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
