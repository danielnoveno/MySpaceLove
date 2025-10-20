import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import SecretCodeGate from "@/Components/Surprise/SecretCodeGate";
import StoryFlipBook from "@/Components/Surprise/StoryFlipBook";
import {
    loveStoryChapters,
    type LoveStoryChapter,
} from "@/data/loveStoryChapters";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type StoryBookProps = {
    chapters?: LoveStoryChapter[];
    space?: SpaceInfo;
};

export default function StoryBook({
    chapters,
    space,
}: StoryBookProps): JSX.Element {
    const [isFinished, setIsFinished] = useState(false);
    const preparedChapters = useMemo(
        () => (chapters && chapters.length > 0 ? chapters : loveStoryChapters),
        [chapters],
    );
    const spaceTitle = space?.title ?? "My Favorite Person";
    const nextHref = space?.slug
        ? route("location.public", { space: space.slug })
        : null;

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <Head title="Cerita Ulang Tahun" />

            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-rose-500/30 via-slate-900 to-violet-700/30" />
            <div className="absolute left-1/2 top-0 -z-10 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-pink-400/30 blur-3xl" />
            <div className="absolute right-[10%] bottom-[-120px] -z-10 h-[580px] w-[480px] rounded-full bg-purple-500/40 blur-3xl" />

            <SecretCodeGate
                code="160825"
                title="Masukkan Tanggal Jadian Kita"
                description="Tanggal spesial (format DDMMYY) buat buka hadiah ini."
                hint="Contoh: 160825"
            >
                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-16 px-4 py-16 sm:px-8 md:px-12">
                    <header className="flex flex-col items-center gap-6 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.48em] text-white/60">
                            Halaman rahasia untukmu
                        </p>
                        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                            Happy Birthday, {spaceTitle}
                        </h1>
                        <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                            Kubuat buku digital ini supaya kamu bisa lagi flashback
                            ke setiap bab perjalanan kita. Baca pelan-pelan aja,
                            tekan tombol berikutnya kalau ingin lanjut ke halaman
                            selanjutnya. Semoga bikin kamu senyum lagi hari ini.
                        </p>
                    </header>

                    <StoryFlipBook
                        chapters={preparedChapters}
                        onReachEnd={() => setIsFinished(true)}
                    />

                    <footer className="w-full max-w-4xl space-y-6 text-center text-sm text-white/70">
                        <div className="mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <p>
                            Kalau kamu mau nambahin cerita baru, tinggal kabarin aku
                            ya. Kita bisa update bareng lagi kapan saja.
                        </p>
                        {isFinished && (
                            <p className="text-base font-semibold text-white">
                                Terima kasih sudah jadi rumah ternyaman. Aku cinta
                                kamu every single day.
                            </p>
                        )}
                        {nextHref && (
                            <div className="pt-2">
                                <Link
                                    href={nextHref}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                >
                                    Next
                                </Link>
                            </div>
                        )}
                    </footer>
                </div>
            </SecretCodeGate>
        </div>
    );
}
