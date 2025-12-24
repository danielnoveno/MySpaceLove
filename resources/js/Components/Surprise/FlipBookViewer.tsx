import { useState } from "react";
import { ChevronLeft, ChevronRight, Book } from "lucide-react";

export interface FlipBookPage {
    id: string | number;
    title: string;
    body: string;
    image?: string | null;
}

interface FlipBookViewerProps {
    pages: FlipBookPage[];
    onComplete: () => void;
    title?: string;
    description?: string;
    nextLabel?: string;
    prevLabel?: string;
    finishLabel?: string;
}

export default function FlipBookViewer({
    pages,
    onComplete,
    title = "📖 Scrapbook Kenangan",
    description = "Balik tiap halaman untuk melihat kenangan manis kita",
    nextLabel = "Halaman Berikutnya",
    prevLabel = "Halaman Sebelumnya",
    finishLabel = "Selesai",
}: FlipBookViewerProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    const handleNext = () => {
        if (currentPage < pages.length - 1 && !isFlipping) {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsFlipping(false);
            }, 300);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0 && !isFlipping) {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage(prev => prev - 1);
                setIsFlipping(false);
            }, 300);
        }
    };

    const handleFinish = () => {
        onComplete();
    };

    const isLastPage = currentPage === pages.length - 1;
    const isFirstPage = currentPage === 0;
    const page = pages[currentPage];

    if (!page) {
        return (
            <div className="flex min-h-[600px] flex-col items-center justify-center space-y-6 px-4 py-12">
                <div className="text-center space-y-3">
                    <Book className="h-16 w-16 mx-auto text-white/60" />
                    <h2 className="text-2xl font-bold text-white">Belum ada halaman</h2>
                    <p className="text-white/70">
                        Scrapbook masih kosong. Tambahkan kenangan di halaman konfigurasi.
                    </p>
                </div>
                <button
                    onClick={handleFinish}
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                    {finishLabel}
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-[600px] flex-col items-center justify-center space-y-8 px-4 py-12">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl">
                <h2 className="text-3xl font-bold text-white">{title}</h2>
                <p className="text-white/80">{description}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                    <Book className="h-4 w-4" />
                    Halaman {currentPage + 1} dari {pages.length}
                </div>
            </div>

            {/* Book Page */}
            <div className="relative w-full max-w-4xl perspective-1000">
                <div
                    className={`transform-style-3d transition-transform duration-300 ${
                        isFlipping ? "scale-95 opacity-80" : "scale-100 opacity-100"
                    }`}
                >
                    <div className="rounded-3xl border-2 border-white/30 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-12">
                        {/* Page Content */}
                        <div className="space-y-6">
                            {/* Image */}
                            {page.image && (
                                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5">
                                    <img
                                        src={page.image}
                                        alt={page.title}
                                        className="h-64 w-full object-cover md:h-80"
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-white md:text-3xl">
                                {page.title}
                            </h3>

                            {/* Body */}
                            {page.body && (
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-base leading-relaxed text-white/80 md:text-lg whitespace-pre-wrap">
                                        {page.body}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Page Number Indicator */}
                        <div className="mt-8 flex justify-center gap-2">
                            {pages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!isFlipping && index !== currentPage) {
                                            setIsFlipping(true);
                                            setTimeout(() => {
                                                setCurrentPage(index);
                                                setIsFlipping(false);
                                            }, 300);
                                        }
                                    }}
                                    className={`h-2 rounded-full transition-all ${
                                        index === currentPage
                                            ? "w-8 bg-white"
                                            : "w-2 bg-white/30 hover:bg-white/50"
                                    }`}
                                    aria-label={`Go to page ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={handlePrev}
                    disabled={isFirstPage || isFlipping}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/30 disabled:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {prevLabel}
                </button>

                {!isLastPage ? (
                    <button
                        onClick={handleNext}
                        disabled={isFlipping}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {nextLabel}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {finishLabel}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
