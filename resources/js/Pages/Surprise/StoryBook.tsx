import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import type { ScrapbookContent, ScrapbookPage, StoryBookContent } from "@/data/loveStoryChapters";
import { useTranslation } from "@/hooks/useTranslation";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type StoryBookProps = {
    storyBook: StoryBookContent;
    space?: SpaceInfo;
};

const palette = {
    primary: "#498386",
    accent: "#CFCAB5",
    background: "bg-gradient-to-br from-[#f3f1ed] via-white to-[#dbe7e4]",
};

const formatString = (template: string, replacements: Record<string, string | number>): string =>
    Object.entries(replacements).reduce(
        (carry, [key, value]) => carry.replace(new RegExp(`:${key}`, "g"), String(value)),
        template,
    );

export default function StoryBook({ storyBook, space }: StoryBookProps): JSX.Element {
    const { t } = useTranslation("app");
    const translate = (key: string, fallback?: string) => t(`storybook.${key}`, fallback ?? key);
    const action = (key: string, fallback?: string) => t(`storybook.actions.${key}`, fallback ?? key);

    const pageLabelTemplate = translate("page_label", "Page :number");
    const progressTemplate = storyBook.flipbook.progressSuffix ?? translate("progress_template", ":current of :total");

    const scrapbook: ScrapbookContent | undefined = storyBook.scrapbook;
    const pages = useMemo<ScrapbookPage[]>(() => {
        const items = scrapbook?.pages ?? [];

        return items
            .map((page, index) => {
                const fallbackLabel = formatString(pageLabelTemplate, { number: index + 1 });

                return {
                    ...page,
                    label: page.label?.trim().length ? page.label : fallbackLabel,
                    title: page.title?.trim().length ? page.title : fallbackLabel,
                    body: page.body?.trim().length ? page.body : undefined,
                };
            })
            .filter((page) => page.title || page.body || page.image)
            .map((page, index) => ({
                ...page,
                label: page.label ?? formatString(pageLabelTemplate, { number: index + 1 }),
            }));
    }, [pageLabelTemplate, scrapbook?.pages]);

    const [started, setStarted] = useState<boolean>(pages.length === 0);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const currentPage = pages[activeIndex] ?? null;
    const nextPage = pages[activeIndex + 1] ?? null;

    const manageUrl = scrapbook?.manage_url;
    const scrapbookTitle = scrapbook?.title;
    const scrapbookSubtitle = scrapbook?.subtitle;
    const emptyState = scrapbook?.empty ?? translate("empty");

    const canGoBack = activeIndex > 0;
    const canGoNext = activeIndex < pages.length - 1;

    const goPrevious = () => {
        if (canGoBack) {
            setActiveIndex((index) => index - 1);
        }
    };

    const goNext = () => {
        if (canGoNext) {
            setActiveIndex((index) => index + 1);
        }
    };

    const resetScrapbook = () => {
        setStarted(false);
        setActiveIndex(0);
    };

    const progressLabel = pages.length
        ? formatString(progressTemplate, {
              current: activeIndex + 1,
              total: pages.length,
          })
        : null;

    return (
        <div className={`min-h-screen ${palette.background} text-slate-800`}>
            <Head title={storyBook.headTitle} />

            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
                <section className="rounded-4xl relative overflow-hidden bg-white/80 shadow-xl">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `radial-gradient(circle at top left, ${palette.accent}, transparent 60%), radial-gradient(circle at bottom right, ${palette.primary}, transparent 55%)`,
                        }}
                    />
                    <div className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
                        <div className="space-y-4 md:max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#498386]/10 px-4 py-2 text-sm font-semibold text-[#498386]">
                                <Sparkles className="h-4 w-4" />
                                {storyBook.hero.tagline}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                                {storyBook.hero.title}
                            </h1>
                            <p className="text-base text-slate-600 md:text-lg">{storyBook.hero.description}</p>
                        </div>
                        <div className="flex flex-col gap-4 rounded-3xl border border-[#498386]/20 bg-white/70 p-6 text-sm text-slate-600 shadow-lg">
                            <span className="text-base font-semibold text-[#498386]">
                                <BookOpen className="mr-2 inline h-5 w-5" />
                                {scrapbookTitle ?? translate("manage")}
                            </span>
                            <p>{scrapbookSubtitle}</p>
                            {manageUrl ? (
                                <Link
                                    href={manageUrl}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#498386] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d]"
                                >
                                    {translate("manage")}
                                </Link>
                            ) : null}
                            {pages.length > 0 && !started && (
                                <button
                                    type="button"
                                    onClick={() => setStarted(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-semibold text-[#498386] transition hover:bg-[#498386]/10"
                                >
                                    {action("start")}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {pages.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#498386]/30 bg-white/60 p-10 text-center shadow-lg">
                        <p className="text-lg font-semibold text-slate-700">{emptyState}</p>
                        {manageUrl && (
                            <Link
                                href={manageUrl}
                                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#498386] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d]"
                            >
                                {translate("manage")}
                            </Link>
                        )}
                    </div>
                ) : (
                    <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                        <div className="flex flex-col gap-6">
                            <div className="rounded-4xl relative overflow-hidden border border-[#498386]/20 bg-white/80 shadow-2xl">
                                <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})` }} />
                                <div className="relative z-10 flex flex-col gap-6 p-6 md:p-10">
                                    <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-[#498386]">
                                        <span>{currentPage?.label}</span>
                                        {progressLabel && <span>{progressLabel}</span>}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:items-start">
                                        {currentPage?.image ? (
                                            <div className="overflow-hidden rounded-3xl border border-[#CFCAB5] bg-white/60 shadow">
                                                <img
                                                    src={currentPage.image}
                                                    alt={currentPage.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-full min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-[#CFCAB5] bg-white/50 text-sm text-[#498386]">
                                                {storyBook.flipbook.messageLabel}
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-semibold text-slate-900">{currentPage?.title}</h2>
                                            {currentPage?.body && <p className="text-base leading-relaxed text-slate-600">{currentPage.body}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={goPrevious}
                                                disabled={!canGoBack}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-medium text-[#498386] transition hover:bg-[#498386]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                {action("previous")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                disabled={!canGoNext}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-medium text-[#498386] transition hover:bg-[#498386]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {action("next")}
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetScrapbook}
                                            className="inline-flex items-center gap-2 rounded-full bg-[#498386]/10 px-4 py-2 text-sm font-medium text-[#498386] transition hover:bg-[#498386]/20"
                                        >
                                            {action("back")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {nextPage ? (
                            <aside className="rounded-4xl border border-[#498386]/20 bg-white/60 p-6 shadow-xl">
                                <p className="text-xs uppercase tracking-[0.35em] text-[#498386]/70">
                                    {action("next")}
                                </p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-900">{nextPage.title}</h3>
                                {nextPage.image && (
                                    <div className="mt-4 overflow-hidden rounded-3xl border border-[#CFCAB5]/60">
                                        <img src={nextPage.image} alt={nextPage.title} className="h-48 w-full object-cover" />
                                    </div>
                                )}
                                {nextPage.body && (
                                    <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-5">{nextPage.body}</p>
                                )}
                            </aside>
                        ) : (
                            <aside className="rounded-4xl border border-dashed border-[#498386]/30 bg-white/50 p-6 text-sm text-slate-600 shadow-inner">
                                <p>{storyBook.footer.finishMessage}</p>
                            </aside>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
