import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2, ArrowLeft, BookOpenCheck, Feather } from "lucide-react";

interface JournalPayload {
    id: number;
    title: string;
    content: string;
    mood: string;
}

interface SpacePayload {
    id: number;
    slug: string;
    title: string;
}

interface Props {
    journal: JournalPayload;
    space: SpacePayload;
}

export default function JournalEdit({ journal, space }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: journal.title ?? "",
        content: journal.content ?? "",
        mood: journal.mood ?? "",
    });

    const baseFieldClass =
        "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200";

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(
            route("journal.update", {
                space: space.slug,
                id: journal.id,
            }),
        );
    };

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#f472b6",
                heartCount: 32,
                className: "opacity-70",
            }}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("journal.index", { space: space.slug })}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Edit Jurnal
                        </h1>
                        <p className="text-sm text-slate-500">
                            {space.title}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Jurnal" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4 py-10 sm:px-6 lg:px-8">
                <div className="absolute inset-x-8 top-24 hidden h-56 rounded-full bg-rose-200/35 blur-3xl md:block" aria-hidden="true" />

                <div className="relative mx-auto max-w-3xl">
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 space-y-8 rounded-3xl border border-white/60 bg-white/85 p-8 shadow-xl backdrop-blur md:p-10"
                    >
                        <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-100/60 to-pink-100/60 px-6 py-5 text-sm text-rose-700 shadow-inner">
                            <div className="flex items-start gap-3">
                                <BookOpenCheck className="mt-1 h-5 w-5 text-rose-500" />
                                <div>
                                    <p className="font-semibold">
                                        Rapikan kembali cerita kalian.
                                    </p>
                                    <p className="mt-1 text-rose-600">
                                        Jurnal yang rapi memudahkan kalian menelusuri memori indah kapan pun rindu datang.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-800">
                                    Judul Cerita
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(event) =>
                                        setData("title", event.target.value)
                                    }
                                    className={baseFieldClass}
                                    placeholder="Perbarui judul ceritamu"
                                />
                                {errors.title && (
                                    <p className="text-xs text-rose-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-800">
                                    Isi Jurnal
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(event) =>
                                        setData("content", event.target.value)
                                    }
                                    rows={7}
                                    className={`${baseFieldClass} min-h-[180px] resize-y leading-relaxed`}
                                    placeholder="Ceritakan kembali apa yang terjadi hari itu."
                                />
                                {errors.content && (
                                    <p className="text-xs text-rose-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-800">
                                    Mood Cerita
                                </label>
                                <div className="relative">
                                    <Feather className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
                                    <select
                                        value={data.mood}
                                        onChange={(event) =>
                                            setData("mood", event.target.value)
                                        }
                                        className={`${baseFieldClass} appearance-none pr-10`}
                                    >
                                        <option value="">Pilih Mood</option>
                                        <option value="happy">Bahagia</option>
                                        <option value="grateful">Bersyukur</option>
                                        <option value="miss">Rindu</option>
                                        <option value="excited">Excited</option>
                                        <option value="melancholy">Melankolis</option>
                                    </select>
                                </div>
                                {errors.mood && (
                                    <p className="text-xs text-rose-500">
                                        {errors.mood}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {processing ? "Menyimpan..." : "Update Jurnal"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
