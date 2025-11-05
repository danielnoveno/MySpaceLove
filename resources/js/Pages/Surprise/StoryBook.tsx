import { Head, Link } from "@inertiajs/react";
import { useMemo } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import LoveCursorCanvas from "@/Components/LoveCursorCanvas";
import type { ScrapbookContent, ScrapbookPage, StoryBookContent } from "@/data/loveStoryChapters";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type StoryBookProps = {
    storyBook: StoryBookContent;
    space?: SpaceInfo;
};

export default function StoryBook({
    storyBook,
    space,
}: StoryBookProps): JSX.Element {
    const nextHref = space?.slug
        ? route("location.public", { space: space.slug })
        : null;
    const headTitle = storyBook.headTitle;
    const hero = storyBook.hero;
    const footer = storyBook.footer;
    const scrapbook: ScrapbookContent | undefined = storyBook.scrapbook;

    const scrapbookPages = useMemo<ScrapbookPage[]>(() => {
        const pages = scrapbook?.pages ?? [];

        return pages
            .map((page, index) => ({
                ...page,
                label:
                    page.label && page.label.trim().length > 0
                        ? page.label
                        : `Page ${index + 1}`,
                title: page.title?.trim().length ? page.title : `Page ${index + 1}`,
                body:
                    page.body && page.body.trim().length > 0
                        ? page.body
                        : undefined,
            }))
            .filter(
                (page) =>
                    (page.title && page.title.trim().length > 0) ||
                    (page.body && page.body.trim().length > 0) ||
                    Boolean(page.image),
            );
    }, [scrapbook?.pages]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <Head title={headTitle} />

            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-rose-500/30 via-slate-900 to-violet-700/30" />
            <div className="absolute left-1/2 top-0 -z-10 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-pink-400/30 blur-3xl" />
            <div className="absolute right-[10%] bottom-[-120px] -z-10 h-[580px] w-[480px] rounded-full bg-purple-500/40 blur-3xl" />
            <LoveCursorCanvas color="#fb7185" heartCount={36} className="opacity-50" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-8 md:px-12">
                <header className="flex flex-col items-center gap-5 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        {hero.tagline}
                    </div>
                    <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                        {hero.title}
                    </h1>
                    <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                        {hero.description}
                    </p>
                </header>

                <section className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                                {scrapbook?.title ?? "Digital scrapbook"}
                            </p>
                            {scrapbook?.subtitle && (
                                <p className="mt-2 max-w-3xl text-sm text-white/70">
                                    {scrapbook.subtitle}
                                </p>
                            )}
                        </div>
                        <BookOpen className="hidden h-8 w-8 text-white/30 sm:block" aria-hidden="true" />
                    </div>

                    {scrapbookPages.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {scrapbookPages.map((page, index) => (
                                <article
                                    key={page.id ?? `scrapbook-${index}`}
                                    className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:border-white/30 hover:bg-white/15"
                                >
                                    <div className="flex flex-col gap-5 md:flex-row">
                                        {page.image && (
                                            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 md:w-48">
                                                <img
                                                    src={page.image}
                                                    alt={page.title}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-3">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/80">
                                                {page.label}
                                            </span>
                                            <h3 className="text-xl font-semibold text-white sm:text-2xl">
                                                {page.title}
                                            </h3>
                                            {page.body && (
                                                <p className="text-sm leading-relaxed text-white/70 whitespace-pre-line">
                                                    {page.body}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-white/25 bg-white/5 p-10 text-center text-sm text-white/70">
                            <p>{scrapbook?.empty ?? "No scrapbook pages yet."}</p>
                            {scrapbook?.manage_url && scrapbook?.cta && (
                                <div className="mt-6">
                                    <Link
                                        href={scrapbook.manage_url}
                                        className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                    >
                                        {scrapbook.cta}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <footer className="w-full max-w-4xl self-center space-y-6 text-center text-sm text-white/70">
                    <div className="mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <p>{footer.reminder}</p>
                    {footer.finishMessage && (
                        <p className="text-base font-semibold text-white">
                            {footer.finishMessage}
                        </p>
                    )}
                    {nextHref && (
                        <div className="pt-2">
                            <Link
                                href={nextHref}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                            >
                                {footer.nextButton}
                            </Link>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}
