import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { Head } from "@inertiajs/react";
import HTMLFlipBook from "react-pageflip";
import {
    BookOpen,
    Heart,
    Sparkles,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import "@/Components/PageFlip/App.css";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type ScrapbookPage = {
    id: string;
    label?: string | null;
    title?: string | null;
    body?: string | null;
    image?: string | null;
};

type StoryBookPageProps = {
    space: SpaceInfo;
    pages: ScrapbookPage[];
};

const MAX_CANVAS_WIDTH = 900;

export default function StoryBookPage({ space, pages }: StoryBookPageProps) {
    const {
        translations: memoryLaneStrings,
    } = useTranslation<Record<string, any>>("memory_lane");
    const heroStrings = memoryLaneStrings?.storybook?.hero ?? {};
    const emptyStrings = memoryLaneStrings?.storybook?.empty ?? {};
    const playerStrings = memoryLaneStrings?.storybook?.player ?? {};

    const heroTitle = heroStrings.title ?? "Our Memory Storybook";
    const heroSubtitle =
        heroStrings.subtitle ??
        "Flip through curated memories from the Memory Lane Kit.";
    const heroCta = heroStrings.cta ?? "Start flipping";

    const emptyTitle =
        emptyStrings.title ?? "No scrapbook pages yet";
    const emptyBody =
        emptyStrings.body ??
        "Add photos and notes to the Memory Lane Kit to see them bloom into a storybook.";

    const playerPrev = playerStrings.previous ?? "Previous page";
    const playerNext = playerStrings.next ?? "Next page";

    const [isViewing, setIsViewing] = useState(false);
    const flipRef = useRef<any>(null);

    const preparedPages = useMemo(() => {
        return (pages ?? []).map((page, index) => ({
            id: page.id ?? `page-${index + 1}`,
            label: page.label ?? `Level ${index + 1}`,
            title: page.title ?? page.label ?? `Level ${index + 1}`,
            body: page.body ?? "",
            image: page.image ?? null,
        }));
    }, [pages]);

    const hasPages = preparedPages.length > 0;

    const handleStart = () => {
        if (hasPages) {
            setIsViewing(true);
        }
    };

    const handlePrevious = () => {
        flipRef.current?.pageFlip()?.flipPrev();
    };

    const handleNext = () => {
        flipRef.current?.pageFlip()?.flipNext();
    };

    const headTitle = `${heroTitle} - ${space.title}`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#CFCAB5]/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#498386]">
                        <Sparkles className="h-4 w-4" />
                        {memoryLaneStrings?.meta?.storybook ?? "Storybook"}
                    </span>
                    <h1 className="text-3xl font-semibold text-[#355659]">
                        {heroTitle}
                    </h1>
                    <p className="max-w-2xl text-sm text-[#4f6364]">
                        {heroSubtitle}
                    </p>
                </div>
            }
        >
            <Head title={headTitle} />
            <div className="relative min-h-screen bg-gradient-to-br from-[#f5f1e6] via-white to-[#d5ede9] pb-16">
                <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-10 sm:px-6 lg:px-8">
                    {!isViewing && (
                        <div className="relative overflow-hidden rounded-[40px] border border-[#c9dcd9] bg-white/90 p-8 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#498386]/10 via-transparent to-[#cfcab5]/30" />
                            <div className="relative flex flex-col items-center gap-6 text-center">
                                <div className="flex items-center justify-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#498386] shadow">
                                    <BookOpen className="h-5 w-5" />
                                    <span>{space.title}</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-[#355659]">
                                    {heroTitle}
                                </h2>
                                <p className="max-w-2xl text-sm text-[#4f6364]">
                                    {heroSubtitle}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleStart}
                                    disabled={!hasPages}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#498386] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#3c6e70] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    {heroCta}
                                </button>
                                {!hasPages && (
                                    <div className="mt-6 max-w-xl rounded-3xl border border-[#f2d2cf] bg-[#fff6f4] p-5 text-left shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Heart className="h-6 w-6 text-[#e07a7a]" />
                                            <div>
                                                <p className="text-base font-semibold text-[#6f3f44]">
                                                    {emptyTitle}
                                                </p>
                                                <p className="text-sm text-[#845a60]">
                                                    {emptyBody}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isViewing && hasPages && (
                        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6">
                            <div className="relative w-full overflow-hidden rounded-[42px] border border-[#d7e5e2] bg-white/90 p-6 shadow-2xl">
                                <HTMLFlipBook
                                    width={Math.min(MAX_CANVAS_WIDTH, 360)}
                                    height={520}
                                    maxShadowOpacity={0.5}
                                    drawShadow
                                    className="mx-auto"
                                    usePortrait
                                    ref={flipRef}
                                    disableFlipByClick
                                >
                                    {preparedPages.map((page) => (
                                        <article
                                            key={page.id}
                                            className="page flex h-full flex-col overflow-hidden rounded-[32px] bg-gradient-to-br from-white to-[#f6faf9]"
                                        >
                                            <div className="flex h-full flex-col gap-4 p-6">
                                                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#498386]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#498386]">
                                                    <Sparkles className="h-4 w-4" />
                                                    {page.label}
                                                </span>
                                                {page.image && (
                                                    <div className="relative overflow-hidden rounded-3xl border border-[#d9ebe7] bg-white">
                                                        <img
                                                            src={page.image}
                                                            alt={page.title ?? page.label ?? "Memory"}
                                                            className="h-60 w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-2">
                                                    <h3 className="text-xl font-semibold text-[#355659]">
                                                        {page.title}
                                                    </h3>
                                                    {page.body && (
                                                        <p className="text-sm leading-relaxed text-[#4f6364]">
                                                            {page.body}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </HTMLFlipBook>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-[#d7e5e2] bg-white/80 px-5 py-2 shadow">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#498386] shadow-sm transition hover:bg-[#f1faf8]"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {playerPrev}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#498386] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3c6e70]"
                                >
                                    {playerNext}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
