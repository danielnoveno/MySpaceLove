import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState, useEffect } from "react";
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
    isVerified?: boolean;
};

type LevelState = "puzzle" | "reward" | "flipbook" | "completed";

export default function MemoryLanePublic({
    memoryLane,
    space,
    skipPuzzle = false,
    isVerified = false,
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
    const [isSubmittingPin, setIsSubmittingPin] = useState(false);
    const [kitUnlocked, setKitUnlocked] = useState(skipPuzzle || levels.length === 0);
    const [selectedRewards, setSelectedRewards] = useState<Map<number, Reward[]>>(new Map());

    const activeLevel = levels[currentLevelIndex] ?? null;
    const currentLevelState = levelStates.get(currentLevelIndex) || "puzzle";

    const allLevelsFinished = (levels.length > 0 && currentLevelIndex >= levels.length - 1 && currentLevelState === "completed") || (levels.length > 0 && kitUnlocked);
    const showFinalPinGate = (levels.length === 0 || allLevelsFinished) && !isVerified;

    // Automatic redirect to story if verified and levels finished or 0 levels
    useEffect(() => {
        if (isVerified && (levels.length === 0 || allLevelsFinished)) {
            router.visit(storyHref);
        }
    }, [isVerified, allLevelsFinished, levels.length, storyHref]);

    const handlePinSubmit = (pin: string) => {
        if (!space?.slug) return;
        
        setIsSubmittingPin(true);
        router.post(route("surprise.memory.verifyPin", { space: space.slug }), { pin }, {
            preserveScroll: true,
            onFinish: () => setIsSubmittingPin(false),
        });
    };

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
            // All levels are completed. The allLevelsFinished will become true.
            // If already verified, the useEffect will handle the redirect.
            if (isVerified) {
                router.visit(storyHref);
            }
        }
    };

    const effectiveCompleted = useMemo(() => {
        if (allLevelsFinished) {
            return levels.map((_, index) => index);
        }
        return completedLevels;
    }, [completedLevels, allLevelsFinished, levels]);

    const mainContent = (
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-16 sm:px-8 md:px-12">
            {levels.length > 0 && !allLevelsFinished && (
                <div className="mb-8 flex flex-wrap justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.32em]">
                    {levels.map((level, index) => {
                        const isComplete = effectiveCompleted.includes(index);
                        const isCurrent =
                            !allLevelsFinished && index === currentLevelIndex && !isComplete;
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

            {!allLevelsFinished && activeLevel ? (
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
                                        : "Selesaikan Semua Puzzle"}
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
                                    : "Buka Hadiah Terakhir"}
                            </button>
                        </div>
                    )}
                </>
            ) : null}

            {allLevelsFinished && !isVerified && (
                <div className="mt-12 flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-500 animate-bounce">
                            <Gift className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Semua Puzzle Terkumpul!</h2>
                        <p className="text-white/70">Masukkan PIN spesial kita untuk membuka hadiah utama.</p>
                    </div>
                </div>
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

            {showFinalPinGate ? (
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
                    onSubmit={handlePinSubmit}
                    isSubmitting={isSubmittingPin}
                    isUnlocked={isVerified}
                >
                    {mainContent}
                </SecretCodeGate>
            ) : (
                mainContent
            )}
        </div>
    );
}
