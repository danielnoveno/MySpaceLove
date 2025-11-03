import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Clock, Sparkles, Video } from "lucide-react";

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">Stay tuned!</p>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Fitur Nobar
                    </h1>
                </div>
            }
        >
            <Head title="Fitur Nobar - Segera Hadir" />

            <div className="mx-auto w-full max-w-3xl space-y-8 px-4 sm:px-0">
                <div className="rounded-3xl border border-dashed border-pink-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
                        <Video className="h-10 w-10 text-pink-500" aria-hidden="true" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold text-gray-900">
                        Fitur Nobar Segera Hadir
                    </h2>
                    <p className="mt-4 text-sm text-gray-600">
                        Kami lagi menyiapkan pengalaman nonton bareng terbaik untuk kalian.
                        Terima kasih sudah sabar menunggu—kami akan segera hadir dengan update terbaru.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-6 shadow-sm">
                        <div className="flex items-center gap-3 text-amber-600">
                            <Clock className="h-5 w-5" aria-hidden="true" />
                            <span className="text-sm font-semibold tracking-wide uppercase">
                                Sedang Dipoles
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-amber-700">
                            Tim kami masih menyempurnakan ruang nobar supaya stabil, nyaman, dan mudah dipakai.
                            Begitu siap, kamu dan pasangan bisa langsung menikmati malam film jarak jauh dari {spaceTitle}.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-purple-100 bg-purple-50/80 p-6 shadow-sm">
                        <div className="flex items-center gap-3 text-purple-600">
                            <Sparkles className="h-5 w-5" aria-hidden="true" />
                            <span className="text-sm font-semibold tracking-wide uppercase">
                                Ditunggu, ya!
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-purple-700">
                            Kami bakal kabari kamu langsung dari dashboard saat fitur ini aktif.
                            Sementara itu, terus lengkapi Memory Lane, tulis journal, atau atur kejutan lain untuk pasanganmu.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900">Butuh sesuatu?</h3>
                        <p className="text-sm text-gray-600">
                            Kalau ada ide atau kebutuhan khusus untuk nobar, tinggal kirimkan lewat menu Support ya!
                        </p>
                    </div>
                    <Link
                        href={
                            spaceSlug
                                ? route("spaces.dashboard", { space: spaceSlug })
                                : route("dashboard")
                        }
                        className="inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-500"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
