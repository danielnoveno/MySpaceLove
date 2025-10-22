import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import SecretCodeGate from "@/Components/Surprise/SecretCodeGate";
import StoryFlipBook from "@/Components/Surprise/StoryFlipBook";
import type { StoryBookContent } from "@/data/loveStoryChapters";

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
    const [isFinished, setIsFinished] = useState(false);
    const nextHref = space?.slug
        ? route("location.public", { space: space.slug })
        : null;
    const headTitle = storyBook.headTitle;
    const hero = storyBook.hero;
    const secretGate = storyBook.secretGate;
    const flipbookLabels = storyBook.flipbook;
    const footer = storyBook.footer;
    const preparedChapters = useMemo(
        () => storyBook.chapters ?? [],
        [storyBook.chapters],
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <Head title={headTitle} />

            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-rose-500/30 via-slate-900 to-violet-700/30" />
            <div className="absolute left-1/2 top-0 -z-10 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-pink-400/30 blur-3xl" />
            <div className="absolute right-[10%] bottom-[-120px] -z-10 h-[580px] w-[480px] rounded-full bg-purple-500/40 blur-3xl" />

            <SecretCodeGate
                code={secretGate.code}
                title={secretGate.title}
                description={secretGate.description}
                placeholder={secretGate.placeholder}
                buttonLabel={secretGate.buttonLabel}
                errorMessage={secretGate.errorMessage}
                hint={secretGate.hint}
                hintLabel={secretGate.hintLabel}
                accessLabel={secretGate.accessLabel}
                inputLabel={secretGate.inputLabel}
            >
                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-16 px-4 py-16 sm:px-8 md:px-12">
                    <header className="flex flex-col items-center gap-6 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.48em] text-white/60">
                            {hero.tagline}
                        </p>
                        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                            {hero.title}
                        </h1>
                        <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                            {hero.description}
                        </p>
                    </header>

                    <StoryFlipBook
                        chapters={preparedChapters}
                        onReachEnd={() => setIsFinished(true)}
                        labels={flipbookLabels}
                    />

                    <footer className="w-full max-w-4xl space-y-6 text-center text-sm text-white/70">
                        <div className="mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <p>{footer.reminder}</p>
                        {isFinished && (
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
            </SecretCodeGate>
        </div>
    );
}
