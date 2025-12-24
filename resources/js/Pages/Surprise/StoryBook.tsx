import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import type { ScrapbookContent, ScrapbookPage, StoryBookContent } from "@/data/loveStoryChapters";
import Book from "@/Components/PageFlip/components/Book.jsx";
import "@/Components/PageFlip/App.css";

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
    const [showBook, setShowBook] = useState(false);

    const handleNextClick = () => {
        setShowBook(true);
    };

    // Prepare pages for Book component
    const bookPages = scrapbookPages.map((page, index) => ({
        id: page.id || `page-${index}`,
        title: page.title || page.label || `Page ${index + 1}`,
        body: page.body || '',
        image: page.image || null,
    }));

    const coverImage = scrapbook?.coverImage || null;
    const coverTitle = scrapbook?.coverTitle || 'Our Story';

    return (
        <div className="relative min-h-screen bg-black text-white">
            <Head title={headTitle} />
            {!showBook ? (
                <button
                    onClick={handleNextClick}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Next
                </button>
            ) : (
                <Book pages={bookPages as any} coverImage={coverImage as any} coverTitle={coverTitle} />
            )}
        </div>
    );
}
