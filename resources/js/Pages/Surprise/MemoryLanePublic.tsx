import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Gift } from "lucide-react";
import SecretCodeGate from "@/Components/Surprise/SecretCodeGate";
import JigsawPuzzleGate from "@/Components/Surprise/JigsawPuzzleGate";
import {
    memoryLaneSteps,
    memoryLaneTokens,
} from "@/data/memoryLaneKit";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type MemoryLanePublicProps = {
    space?: SpaceInfo;
};

const PUZZLE_IMAGE_OPTIONS = [
    {
        label: "Memori Tajen",
        value: "/images/puzzle/example-image-tajen.jpg",
    },
    {
        label: "Memori Sunset",
        value: "/images/puzzle/ea7c8d31ade2c25c5e5d06730def5933.jpg",
    },
    {
        label: "Memori Blossom",
        value: "/images/puzzle/1745990293808.jpeg",
    },
];

export default function MemoryLanePublic({
    space,
}: MemoryLanePublicProps): JSX.Element {
    const spaceTitle = space?.title ?? "kita";
    const storyHref = space?.slug
        ? route("surprise.story.space", { space: space.slug })
        : route("surprise.story");
    const puzzleRows = 4;
    const puzzleCols = 4;
    const totalPuzzlePieces = puzzleRows * puzzleCols;
    const [puzzleImageIndex, setPuzzleImageIndex] = useState(0);
    const activePuzzleOption =
        PUZZLE_IMAGE_OPTIONS[puzzleImageIndex] ?? PUZZLE_IMAGE_OPTIONS[0];
    const puzzleImageUrl =
        activePuzzleOption?.value ?? PUZZLE_IMAGE_OPTIONS[0].value;
    const renderPuzzleButtons = () =>
        PUZZLE_IMAGE_OPTIONS.map((option, index) => {
            const isActive = index === puzzleImageIndex;
            return (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setPuzzleImageIndex(index)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition ${
                        isActive
                            ? "border-white/80 bg-white/20 text-white shadow-[0_12px_26px_rgba(15,23,42,0.35)]"
                            : "border-white/25 text-white/70 hover:border-white/45 hover:text-white"
                    }`}
                >
                    {option.label}
                </button>
            );
        });

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
            <Head title="Memory Lane Kit" />

            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-rose-500/30 via-slate-900 to-amber-500/40" />
            <div className="absolute left-[-120px] top-[-160px] -z-10 h-[500px] w-[500px] rounded-full bg-rose-400/30 blur-3xl" />
            <div className="absolute right-[-160px] bottom-[-200px] -z-10 h-[560px] w-[560px] rounded-full bg-purple-500/30 blur-3xl" />

            <SecretCodeGate
                code="160825"
                title="Masukkan Tanggal Jadian Kita"
                description="Khusus yang hafal tanggal spesial (format DDMMYY)."
                hint="160825"
            >
                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-16 sm:px-8 md:px-12">
                    <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-8 sm:flex-row sm:justify-center">
                        {/* <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/60">
                            Ganti gambar puzzle:
                        </span> */}
                        {/* <div className="flex flex-wrap justify-center gap-2">
                            {renderPuzzleButtons()}
                        </div> */}
                    </div>
                    <JigsawPuzzleGate
                        rows={puzzleRows}
                        cols={puzzleCols}
                        missingCount={totalPuzzlePieces}
                        imageUrl={puzzleImageUrl}
                        title="Susun puzzle Memory Lane"
                        description={`Sebelum lanjut ke kit ruang ${spaceTitle}, selesaikan puzzle ${puzzleCols}x${puzzleRows} ini dulu.`}
                        solvedTitle={`Yes! Puzzle ${spaceTitle} selesai`}
                        solvedDescription="Sekarang kamu bisa lanjut menikmati tiap tahap Memory Lane Kit."
                        resetLabel="Acak ulang kepingan"
                        controls={renderPuzzleButtons()}
                    >
                        <div className="flex flex-col gap-16">
                            <header className="flex flex-col items-center gap-5 text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.48em] text-white/60">
                                    Surprise kit ruang {spaceTitle}
                                </p>
                                <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                                    Memory Lane Kit
                                </h1>
                                <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                                    Ada tiga tahap mini buat kamu siapin sebelum
                                    pasangan buka hadiah utama. Bisa dipakai
                                    untuk ulang tahun, anniversary, atau cuma
                                    mau bikin hari biasa jadi spesial.
                                </p>
                            </header>

                            <section className="space-y-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                                    Step by step
                                </p>
                                <div className="grid gap-6 md:grid-cols-3">
                                    {memoryLaneSteps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className="flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur transition hover:border-white/30 hover:bg-white/15"
                                        >
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-sm font-semibold text-white">
                                                0{index + 1}
                                            </span>
                                            <div className="mt-4 space-y-3">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm leading-6 text-white/70">
                                                    {step.prompt}
                                                </p>
                                            </div>
                                            <div className="mt-5 rounded-2xl border border-dashed border-white/25 bg-black/20 px-4 py-3 text-xs text-white/70">
                                                <span className="font-semibold text-white">
                                                    Tantangan:
                                                </span>{" "}
                                                {step.action}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                                    Token kejutan
                                </p>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {memoryLaneTokens.map((token) => (
                                        <div
                                            key={token.label}
                                            className="rounded-3xl border border-white/20 bg-white/10 p-5 text-sm text-white/80 backdrop-blur transition hover:border-white/35 hover:bg-white/15"
                                        >
                                            <div
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${token.accent}`}
                                            >
                                                {token.label}
                                            </div>
                                            <p className="mt-3 leading-6">
                                                {token.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6 rounded-3xl border border-white/20 bg-black/20 p-6 text-sm text-white/70 backdrop-blur">
                                <p>
                                    Selesai kit ini, buka menu Surprise Story
                                    buat kirim hadiah cerita ulang tahun ruang{" "}
                                    {spaceTitle}. Bagikan link ini biar
                                    pasanganmu dapet kejutan ganda.
                                </p>
                                <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 text-white">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-100">
                                            <Gift className="h-6 w-6" />
                                        </span>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-white">
                                                Surprise Story
                                            </h3>
                                            <p className="text-sm text-white/70">
                                                Hadiahkan cerita ulang tahun
                                                lengkap untuk pasanganmu.
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Link
                                            href={storyHref}
                                            className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                                        >
                                            Buka Storybook
                                        </Link>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-white/60">
                                    Rahasiain kode 160825 ya, cuma kita yang
                                    tahu!
                                </p>
                            </section>
                        </div>
                    </JigsawPuzzleGate>
                </div>
            </SecretCodeGate>
        </div>
    );
}
