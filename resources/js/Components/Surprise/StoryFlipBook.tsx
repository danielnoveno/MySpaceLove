import { useCallback, useMemo, useState, type MouseEvent } from "react";
import {
    animated,
    useSpring,
    useTransition,
    type SpringValue,
} from "react-spring";
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    Sparkles,
    Star,
    Flower,
    BookOpen,
} from "lucide-react";
import type {
    LoveStoryChapter,
    LoveStoryDecoration,
} from "@/data/loveStoryChapters";

type StoryFlipBookLabels = {
    empty: string;
    narratorLabel: string;
    progressSuffix: string;
    messageLabel: string;
    previous: string;
    next: string;
    finish: string;
    dateFallback: string;
};

type StoryFlipBookProps = {
    chapters: LoveStoryChapter[];
    onReachEnd?: () => void;
    labels?: Partial<StoryFlipBookLabels>;
};

const DEFAULT_LABELS: StoryFlipBookLabels = {
    empty: "No stories to display yet.",
    narratorLabel: "Love log",
    progressSuffix: "complete",
    messageLabel: "A note for you",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    dateFallback: "Special memory",
};

const DECORATION_SIZE = [68, 52, 60, 56];
const DECORATION_MULTIPLIER = [18, -14, 12, -10];
const DECORATION_POSITIONS: Array<
    Partial<Record<"top" | "bottom" | "left" | "right", string>>
> = [
    { top: "6%", left: "6%" },
    { top: "10%", right: "10%" },
    { bottom: "14%", left: "12%" },
    { bottom: "10%", right: "14%" },
];

const DECORATION_ICONS: Record<LoveStoryDecoration, typeof Heart> = {
    hearts: Heart,
    sparkles: Sparkles,
    stars: Star,
    petals: Flower,
};

const getDecorationStyle = (
    xy: SpringValue<[number, number]>,
    multiplier: number,
) => ({
    transform: xy.to(
        (x, y) =>
            `translate3d(${x * multiplier}px, ${y * multiplier}px, 0) rotateZ(${
                x * multiplier * 0.4
            }deg)`,
    ),
});

const gradientBorder = (accent: string) =>
    `linear-gradient(135deg, ${accent}1A 0%, ${accent}33 50%, ${accent}00 100%)`;

export function StoryFlipBook({
    chapters,
    onReachEnd,
    labels,
}: StoryFlipBookProps): JSX.Element {
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<"forward" | "backward">(
        "forward",
    );

    const [parallax, parallaxApi] = useSpring(() => ({
        xy: [0, 0] as [number, number],
        config: { mass: 10, tension: 200, friction: 35 },
    }));

    const transitions = useTransition(currentIndex, {
        key: currentIndex,
        from: {
            opacity: 0,
            transform: `perspective(1600px) rotateY(${
                direction === "forward" ? -90 : 90
            }deg) translateX(${direction === "forward" ? 60 : -60}%) scale(0.92)`,
        },
        enter: {
            opacity: 1,
            transform:
                "perspective(1600px) rotateY(0deg) translateX(0%) scale(1)",
        },
        leave: {
            opacity: 0,
            transform: `perspective(1600px) rotateY(${
                direction === "forward" ? 88 : -88
            }deg) translateX(${direction === "forward" ? -54 : 54}%) scale(0.92)`,
        },
        config: { tension: 240, friction: 32, precision: 0.01 },
    });

    const totalPages = chapters.length;
    if (totalPages === 0) {
        return (
            <div className="rounded-3xl border border-white/30 bg-white/10 px-8 py-10 text-center text-white/70 backdrop-blur">
                {resolvedLabels.empty}
            </div>
        );
    }
    const progress = useMemo(
        () => Math.round(((currentIndex + 1) / totalPages) * 100),
        [currentIndex, totalPages],
    );

    const currentChapter = chapters[currentIndex];

    const handlePointer = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            parallaxApi.start({
                xy: [x * 20, y * 20],
            });
        },
        [parallaxApi],
    );

    const resetPointer = useCallback(() => {
        parallaxApi.start({ xy: [0, 0] });
    }, [parallaxApi]);

    const handleNext = useCallback(() => {
        if (currentIndex < totalPages - 1) {
            setDirection("forward");
            setCurrentIndex((prev) => Math.min(prev + 1, totalPages - 1));
        } else if (onReachEnd) {
            onReachEnd();
        }
    }, [currentIndex, onReachEnd, totalPages]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection("backward");
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }
    }, [currentIndex]);

    return (
        <div className="flex w-full max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.36em] text-white/70">
                    <span>{currentChapter.chapterLabel}</span>
                    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/80 backdrop-blur">
                        <BookOpen size={16} />
                        <span>
                            {currentIndex + 1} / {totalPages}
                        </span>
                    </div>
                <span>{currentChapter.dateLabel ?? resolvedLabels.dateFallback}</span>
            </div>

            <div
                className="relative mx-auto h-[620px] w-full max-w-4xl"
                style={{ perspective: "1600px" }}
                onMouseMove={handlePointer}
                onMouseLeave={resetPointer}
            >
                <div className="absolute inset-0 rounded-[2.75rem] bg-white/20 blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />

                <div className="relative h-full overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-white/30">
                    <div
                        className="absolute inset-0"
                        style={{ background: currentChapter.theme.gradient }}
                    />

                    <animated.div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            opacity: parallax.xy.to(
                                (x, y) =>
                                    0.6 +
                                    Math.min(
                                        0.3,
                                        (Math.abs(x) + Math.abs(y)) / 60,
                                    ),
                            ),
                        }}
                    >
                        {currentChapter.decorations.map((decor, index) => {
                            const Icon =
                                DECORATION_ICONS[decor] ?? Sparkles;
                            const position =
                                DECORATION_POSITIONS[
                                    index % DECORATION_POSITIONS.length
                                ];
                            const multiplier =
                                DECORATION_MULTIPLIER[
                                    index % DECORATION_MULTIPLIER.length
                                ];
                            const size =
                                DECORATION_SIZE[
                                    index % DECORATION_SIZE.length
                                ];

                            return (
                                <animated.div
                                    key={`${decor}-${index}`}
                                    className="absolute text-white/70"
                                    style={{
                                        ...position,
                                        ...getDecorationStyle(
                                            parallax.xy,
                                            multiplier,
                                        ),
                                    }}
                                >
                                    <Icon
                                        size={size}
                                        className="drop-shadow-lg"
                                        strokeWidth={1.5}
                                        color={currentChapter.theme.accent}
                                    />
                                </animated.div>
                            );
                        })}
                    </animated.div>

                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 mix-blend-soft-light" />
                    </div>

                    <div className="absolute inset-0">
                        {transitions((style, index) => {
                            const chapter = chapters[index];

                            return (
                                <animated.div
                                    key={chapter.id}
                                    style={style}
                                    className="absolute inset-0 flex flex-col"
                                >
                                    <div
                                        className="absolute inset-6 rounded-[2rem] border"
                                        style={{
                                            borderImage:
                                                `${gradientBorder(chapter.theme.accent)} 1`,
                                            borderWidth: "1px",
                                        }}
                                    />

                                    <div className="relative z-10 flex h-full flex-col justify-between p-12 text-left text-slate-800">
                                        <div className="space-y-5">
                                            <div className="inline-flex items-center gap-3 rounded-full bg-white/60 px-5 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-slate-500 shadow-sm backdrop-blur">
                                                <span>{chapter.chapterLabel}</span>
                                                {chapter.dateLabel && (
                                                    <span className="text-xs tracking-[0.2em] text-slate-400">
                                                        {chapter.dateLabel}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="max-w-xl space-y-3 text-slate-900">
                                                <h2 className="text-4xl font-bold leading-tight text-slate-900 drop-shadow-sm">
                                                    {chapter.title}
                                                </h2>
                                                <p className="text-lg text-slate-600">
                                                    {chapter.intro}
                                                </p>
                                            </div>

                                            <p className="max-w-2xl text-base leading-7 text-slate-700">
                                                {chapter.story}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {chapter.highlights.map(
                                                    (highlight, idx) => (
                                                        <div
                                                            key={`${chapter.id}-highlight-${idx}`}
                                                            className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/70 px-5 py-4 text-slate-700 shadow backdrop-blur-sm"
                                                        >
                                                            <div
                                                                className="absolute inset-0 opacity-60"
                                                                style={{
                                                                    background: `radial-gradient(circle at top left, ${chapter.theme.soft}, transparent 65%)`,
                                                                }}
                                                            />
                                                            <div className="relative space-y-1">
                                                                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                                                                    {
                                                                        highlight.title
                                                                    }
                                                                </h3>
                                                                <p className="text-sm leading-6 text-slate-700">
                                                                    {
                                                                        highlight.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {chapter.quote && (
                                                <div className="max-w-sm">
                                                    <div className="rounded-3xl bg-white/70 p-6 text-slate-700 shadow-md backdrop-blur">
                                                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                                                            {resolvedLabels.messageLabel}
                                                        </p>
                                                        <blockquote className="mt-3 text-lg font-semibold leading-7 text-slate-800">
                                                            &ldquo;{chapter.quote.text}&rdquo;
                                                        </blockquote>
                                                        {chapter.quote.author && (
                                                            <p className="mt-3 text-sm text-slate-500">
                                                                &mdash; {chapter.quote.author}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </animated.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-medium uppercase tracking-[0.24em] text-white/70">
                    <span>{resolvedLabels.narratorLabel}</span>
                    <span>
                        {progress}% {resolvedLabels.progressSuffix}
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <animated.div
                        className="h-full rounded-full bg-white"
                        style={{
                            width: `${progress}%`,
                            opacity: parallax.xy.to(
                                (x, y) =>
                                    0.65 +
                                    Math.min(
                                        0.25,
                                        (Math.abs(x) + Math.abs(y)) / 80,
                                    ),
                            ),
                        }}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                            background: "rgba(255,255,255,0.18)",
                            color: "rgba(255,255,255,0.85)",
                        }}
                    >
                        <ArrowLeft size={16} />
                        {resolvedLabels.previous}
                    </button>

                    <button
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-800 shadow-lg shadow-white/40 transition hover:shadow-xl hover:shadow-white/50"
                    >
                        {currentIndex === totalPages - 1 ? (
                            <>
                                {resolvedLabels.finish}
                                <Sparkles size={18} />
                            </>
                        ) : (
                            <>
                                {resolvedLabels.next}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StoryFlipBook;
