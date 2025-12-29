import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Gift } from "lucide-react";
import SecretCodeGate from "@/Components/Surprise/SecretCodeGate";
import LoveCursorCanvas from "@/Components/LoveCursorCanvas";
import JigsawPuzzleGate from "@/Components/Surprise/JigsawPuzzleGate";
import LuckyBoxGacha, { type Reward } from "@/Components/Surprise/LuckyBoxGacha";
import FlipBookViewer, { type FlipBookPage } from "@/Components/Surprise/FlipBookViewer";
import type { MemoryLaneContent } from "@/types/memoryLane";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type MemoryLanePublicProps = {
    memoryLane: MemoryLaneContent;
    space?: SpaceInfo;
    skipPuzzle?: boolean;
};

type LevelState = "puzzle" | "reward" | "flipbook" | "completed";

export default function MemoryLanePublic({
    memoryLane,
    space,
    skipPuzzle = false,
}: MemoryLanePublicProps): JSX.Element {
    const storyHref = space?.slug
        ? route("surprise.story.space", { space: space.slug })
        : route("surprise.story");
    const puzzleRows = memoryLane.puzzle.grid.rows ?? 4;
    const puzzleCols = memoryLane.puzzle.grid.cols ?? 4;
    const totalPuzzlePieces = puzzleRows * puzzleCols;
    const levels = memoryLane.puzzle.levels ?? [];
    
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [completedLevels, setCompletedLevels] = useState<number[]>([]);
    const [levelStates, setLevelStates] = useState<Map<number, LevelState>>(new Map());
    const [kitUnlocked, setKitUnlocked] = useState(skipPuzzle || levels.length === 0);
    const [selectedRewards, setSelectedRewards] = useState<Map<number, Reward[]>>(new Map());

    const activeLevel = !kitUnlocked ? levels[currentLevelIndex] ?? null : null;
    const currentLevelState = levelStates.get(currentLevelIndex) || "puzzle";

    const handlePuzzleSolved = () => {
        if (!completedLevels.includes(currentLevelIndex)) {
            setCompletedLevels((prev) => [...prev, currentLevelIndex]);
        }

        // Determine what comes after the puzzle
        const level = levels[currentLevelIndex];
        if (level?.rewards && level.rewards.length > 0) {
            // Level 1: Show gacha
            setLevelStates(prev => new Map(prev).set(currentLevelIndex, "reward"));
        } else if (level?.flipbook && level.flipbook.length > 0) {
            // Level 2: Show flipbook
            setLevelStates(prev => new Map(prev).set(currentLevelIndex, "flipbook"));
        } else {
            // No reward/flipbook, mark as completed
            setLevelStates(prev => new Map(prev).set(currentLevelIndex, "completed"));
            if (levels.length === 1) {
                setKitUnlocked(true);
            }
        }
    };

    const handleRewardComplete = (rewards: Reward[]) => {
        setSelectedRewards(prev => new Map(prev).set(currentLevelIndex, rewards));
        setLevelStates(prev => new Map(prev).set(currentLevelIndex, "completed"));
    };

    const handleFlipbookComplete = () => {
        setLevelStates(prev => new Map(prev).set(currentLevelIndex, "completed"));
    };

    const handleContinue = () => {
        if (currentLevelIndex < levels.length - 1) {
            setCurrentLevelIndex((index) => index + 1);
        } else {
            setKitUnlocked(true);
        }
    };

    const effectiveCompleted = useMemo(() => {
        if (kitUnlocked) {
            return levels.map((_, index) => index);
        }
        return completedLevels;
    }, [completedLevels, kitUnlocked, levels]);

    const memoryLaneBody = (
        <div className="flex flex-col gap-16">
            <header className="flex flex-col items-center gap-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.48em] text-white/60">
                    {memoryLane.intro.tagline}
                </p>
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                    {memoryLane.intro.title}
                </h1>
                <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                    {memoryLane.intro.description}
                </p>
            </header>

            <section className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                    {memoryLane.intro.stepsHeading}
                </p>
                <div className="grid gap-6 md:grid-cols-3">
                    {memoryLane.steps.map((step, index) => (
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
                                    {memoryLane.intro.challengeLabel}
                                </span>{" "}
                                {step.action}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                    {memoryLane.intro.tokensHeading}
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                    {memoryLane.tokens.map((token) => (
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
                <p>{memoryLane.intro.closing.description}</p>
                <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 text-white">
                    <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-100">
                            <Gift className="h-6 w-6" />
                        </span>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white">
                                {memoryLane.intro.closing.story.title}
                            </h3>
                            <p className="text-sm text-white/70">
                                {memoryLane.intro.closing.story.description}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Link
                            href={storyHref}
                            className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            {memoryLane.intro.closing.story.button}
                        </Link>
                    </div>
                </div>
                <p className="text-center text-xs text-white/60">
                    {memoryLane.intro.closing.footnote}
                </p>
            </section>
            {kitUnlocked && effectiveCompleted.length >= 3 && space?.slug && (
                <section className="mt-8 flex justify-center">
                    <Link
                        href={route("storybook.show", { space: space.slug })}
                        className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                        Lihat Story Book
                    </Link>
                </section>
            )}
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
            <Head title={memoryLane.headTitle} />

            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-rose-500/30 via-slate-900 to-amber-500/40" />
            <div className="absolute left-[-120px] top-[-160px] -z-10 h-[500px] w-[500px] rounded-full bg-rose-400/30 blur-3xl" />
            <div className="absolute right-[-160px] bottom-[-200px] -z-10 h-[560px] w-[560px] rounded-full bg-purple-500/30 blur-3xl" />
            <LoveCursorCanvas color="#f97316" heartCount={34} className="opacity-55" />

            <SecretCodeGate
                code={memoryLane.secretGate.code}
                title={memoryLane.secretGate.title}
                description={memoryLane.secretGate.description}
                placeholder={memoryLane.secretGate.placeholder}
                buttonLabel={memoryLane.secretGate.buttonLabel}
                errorMessage={memoryLane.secretGate.errorMessage}
                hint={memoryLane.secretGate.hint}
                hintLabel={memoryLane.secretGate.hintLabel}
                accessLabel={memoryLane.secretGate.accessLabel}
                inputLabel={memoryLane.secretGate.inputLabel}
            >
                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-16 sm:px-8 md:px-12">
                    {levels.length > 0 && (
                        <div className="mb-8 flex flex-wrap justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.32em]">
                            {levels.map((level, index) => {
                                const isComplete = effectiveCompleted.includes(index);
                                const isCurrent =
                                    !kitUnlocked && index === currentLevelIndex && !isComplete;
                                const badgeClass = isComplete
                                    ? "border-emerald-300 bg-emerald-500/20 text-emerald-100"
                                    : isCurrent
                                    ? "border-white/60 bg-white/15 text-white"
                                    : "border-white/20 text-white/50";

                                return (
                                    <div
                                        key={level.id}
                                        className={`rounded-full border px-4 py-2 transition ${badgeClass}`}
                                    >
                                        {level.label}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!kitUnlocked && activeLevel ? (
                        <>
                            {/* Puzzle Phase */}
                            {currentLevelState === "puzzle" && (
                                <JigsawPuzzleGate
                                    key={activeLevel.id}
                                    rows={puzzleRows}
                                    cols={puzzleCols}
                                    missingCount={totalPuzzlePieces}
                                    imageUrl={
                                        activeLevel.image ??
                                        levels[currentLevelIndex]?.image ??
                                        "/images/puzzle/defaultimage.png"
                                    }
                                    title={activeLevel.label ?? memoryLane.puzzle.title}
                                    description={memoryLane.puzzle.description}
                                    solvedTitle={activeLevel.summaryTitle}
                                    solvedDescription={activeLevel.summaryBody}
                                    resetLabel={memoryLane.puzzle.resetLabel}
                                    pretitle={memoryLane.puzzle.pretitle}
                                    dragLabel={memoryLane.puzzle.dragLabel}
                                    movesLabel={memoryLane.puzzle.movesLabel}
                                    onSolved={handlePuzzleSolved}
                                >
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={handleContinue}
                                            className="rounded-full bg-white/20 px-6 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            {currentLevelIndex < levels.length - 1
                                                ? "Lanjut Level"
                                                : "Buka Memory Lane"}
                                        </button>
                                    </div>
                                </JigsawPuzzleGate>
                            )}

                            {/* Reward/Gacha Phase (Level 1) */}
                            {currentLevelState === "reward" && activeLevel.rewards && (
                                <LuckyBoxGacha
                                    rewards={activeLevel.rewards}
                                    maxSelections={2}
                                    onComplete={handleRewardComplete}
                                    title="🎁 Lucky Box"
                                    description="Pilih 2 kotak hadiah dan dapatkan kejutan spesial!"
                                    selectLabel="Pilih"
                                    confirmLabel="Lanjutkan"
                                />
                            )}

                            {/* Flipbook Phase (Level 2) */}
                            {currentLevelState === "flipbook" && activeLevel.flipbook && (
                                <FlipBookViewer
                                    pages={activeLevel.flipbook}
                                    onComplete={handleFlipbookComplete}
                                    title="📖 Scrapbook Kenangan"
                                    description="Balik tiap halaman untuk melihat kenangan manis kita"
                                    nextLabel="Halaman Berikutnya"
                                    prevLabel="Halaman Sebelumnya"
                                    finishLabel="Selesai"
                                />
                            )}

                            {/* Completed Phase - Show Continue Button */}
                            {currentLevelState === "completed" && (
                                <div className="flex min-h-[400px] items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        {currentLevelIndex < levels.length - 1
                                            ? "Lanjut ke Level Berikutnya"
                                            : "Buka Memory Lane"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : null}

                    {kitUnlocked && (
                        <div className="mt-12">
                            {memoryLaneBody}
                        </div>
                    )}
                </div>
            </SecretCodeGate>

            {space?.slug && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Link
                        href={route("surprise.story.space", { space: space.slug })}
                        className="group flex items-center gap-2 rounded-full bg-white/10 p-3 pr-5 backdrop-blur-md transition hover:bg-white/20"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition group-hover:scale-110 group-hover:bg-rose-600">
                            <Gift className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-semibold text-white">Buka Story Book</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
