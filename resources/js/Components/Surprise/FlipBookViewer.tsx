import { useState, useMemo, memo } from "react";
import { ChevronLeft, ChevronRight, Book, Heart, Star, Sparkles, Flower2 } from "lucide-react";

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

// Template desain yang berbeda untuk setiap halaman
const pageTemplates = [
    {
        // Template 1: Romantic Pink dengan Hati
        background: "linear-gradient(135deg, #ffeef8 0%, #ffe0f0 50%, #ffd4e8 100%)",
        pattern: "radial-gradient(circle at 20% 30%, rgba(255, 105, 180, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 182, 193, 0.15) 0%, transparent 50%)",
        decorations: [
            { icon: Heart, color: "#ff69b4", size: 40, top: "10%", left: "5%", rotation: -15, opacity: 0.3 },
            { icon: Heart, color: "#ff1493", size: 30, top: "15%", right: "8%", rotation: 20, opacity: 0.25 },
            { icon: Heart, color: "#ffb6c1", size: 25, bottom: "12%", left: "10%", rotation: 10, opacity: 0.2 },
            { icon: Heart, color: "#ff69b4", size: 35, bottom: "8%", right: "6%", rotation: -25, opacity: 0.3 },
        ],
        textColor: "#8b0045",
        titleColor: "#c71585",
        borderColor: "rgba(255, 105, 180, 0.3)",
    },
    {
        // Template 2: Dreamy Purple dengan Bintang
        background: "linear-gradient(135deg, #f3e7ff 0%, #e9d5ff 50%, #dcc3ff 100%)",
        pattern: "radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)",
        decorations: [
            { icon: Star, color: "#9333ea", size: 35, top: "8%", left: "7%", rotation: 0, opacity: 0.35 },
            { icon: Star, color: "#a855f7", size: 28, top: "12%", right: "10%", rotation: 45, opacity: 0.3 },
            { icon: Sparkles, color: "#c084fc", size: 32, bottom: "10%", left: "8%", rotation: -20, opacity: 0.25 },
            { icon: Star, color: "#9333ea", size: 30, bottom: "15%", right: "7%", rotation: 15, opacity: 0.3 },
        ],
        textColor: "#581c87",
        titleColor: "#7c3aed",
        borderColor: "rgba(147, 51, 234, 0.3)",
    },
    {
        // Template 3: Soft Peach dengan Bunga
        background: "linear-gradient(135deg, #fff5f0 0%, #ffe8dc 50%, #ffdcc8 100%)",
        pattern: "radial-gradient(circle at 25% 25%, rgba(251, 146, 60, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(253, 186, 116, 0.1) 0%, transparent 50%)",
        decorations: [
            { icon: Flower2, color: "#fb923c", size: 38, top: "12%", left: "6%", rotation: -10, opacity: 0.3 },
            { icon: Flower2, color: "#fdba74", size: 32, top: "10%", right: "9%", rotation: 25, opacity: 0.25 },
            { icon: Flower2, color: "#fb923c", size: 28, bottom: "14%", left: "9%", rotation: 15, opacity: 0.28 },
            { icon: Sparkles, color: "#fdba74", size: 30, bottom: "10%", right: "8%", rotation: -15, opacity: 0.25 },
        ],
        textColor: "#7c2d12",
        titleColor: "#ea580c",
        borderColor: "rgba(251, 146, 60, 0.3)",
    },
    {
        // Template 4: Mint Green dengan Daun
        background: "linear-gradient(135deg, #f0fdf9 0%, #d1fae5 50%, #a7f3d0 100%)",
        pattern: "radial-gradient(circle at 35% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), radial-gradient(circle at 65% 70%, rgba(52, 211, 153, 0.12) 0%, transparent 50%)",
        decorations: [
            { icon: Sparkles, color: "#10b981", size: 36, top: "9%", left: "8%", rotation: 10, opacity: 0.32 },
            { icon: Heart, color: "#34d399", size: 30, top: "14%", right: "7%", rotation: -20, opacity: 0.28 },
            { icon: Sparkles, color: "#10b981", size: 32, bottom: "11%", left: "7%", rotation: 20, opacity: 0.3 },
            { icon: Heart, color: "#34d399", size: 28, bottom: "13%", right: "9%", rotation: -10, opacity: 0.25 },
        ],
        textColor: "#064e3b",
        titleColor: "#059669",
        borderColor: "rgba(16, 185, 129, 0.3)",
    },
    {
        // Template 5: Sky Blue dengan Awan
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
        pattern: "radial-gradient(circle at 40% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
        decorations: [
            { icon: Star, color: "#0ea5e9", size: 34, top: "11%", left: "9%", rotation: -5, opacity: 0.3 },
            { icon: Sparkles, color: "#38bdf8", size: 30, top: "13%", right: "8%", rotation: 30, opacity: 0.28 },
            { icon: Star, color: "#0ea5e9", size: 28, bottom: "12%", left: "10%", rotation: 12, opacity: 0.25 },
            { icon: Sparkles, color: "#38bdf8", size: 32, bottom: "9%", right: "7%", rotation: -18, opacity: 0.3 },
        ],
        textColor: "#0c4a6e",
        titleColor: "#0284c7",
        borderColor: "rgba(14, 165, 233, 0.3)",
    },
    {
        // Template 6: Lavender Dreams dengan Hati & Bintang
        background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
        pattern: "radial-gradient(circle at 28% 35%, rgba(192, 132, 252, 0.15) 0%, transparent 50%), radial-gradient(circle at 72% 65%, rgba(216, 180, 254, 0.15) 0%, transparent 50%)",
        decorations: [
            { icon: Heart, color: "#c084fc", size: 36, top: "10%", left: "7%", rotation: -12, opacity: 0.32 },
            { icon: Star, color: "#d8b4fe", size: 30, top: "12%", right: "9%", rotation: 22, opacity: 0.28 },
            { icon: Sparkles, color: "#c084fc", size: 32, bottom: "13%", left: "8%", rotation: 8, opacity: 0.3 },
            { icon: Heart, color: "#d8b4fe", size: 28, bottom: "11%", right: "10%", rotation: -20, opacity: 0.25 },
        ],
        textColor: "#581c87",
        titleColor: "#9333ea",
        borderColor: "rgba(192, 132, 252, 0.3)",
    },
];

// Memoized decoration component
const DecorationIcon = memo(({ deco, idx }: { deco: any; idx: number }) => {
    const IconComponent = deco.icon;
    return (
        <div
            className="absolute animate-float"
            style={{
                top: deco.top,
                bottom: deco.bottom,
                left: deco.left,
                right: deco.right,
                transform: `rotate(${deco.rotation}deg)`,
                opacity: deco.opacity,
                animationDelay: `${idx * 0.5}s`,
            }}
        >
            <IconComponent 
                size={deco.size} 
                color={deco.color}
                fill={deco.color}
                strokeWidth={1.5}
            />
        </div>
    );
});

DecorationIcon.displayName = 'DecorationIcon';

function FlipBookViewer({
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

    const handlePageJump = (index: number) => {
        if (!isFlipping && index !== currentPage) {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage(index);
                setIsFlipping(false);
            }, 300);
        }
    };

    const isLastPage = currentPage === pages.length - 1;
    const isFirstPage = currentPage === 0;
    const page = pages[currentPage];
    
    // Memoize template to avoid recalculation
    const template = useMemo(() => 
        pageTemplates[currentPage % pageTemplates.length],
        [currentPage]
    );

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
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">{title}</h2>
                <p className="text-white/90 drop-shadow">{description}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md shadow-lg border border-white/30">
                    <Book className="h-4 w-4" />
                    Halaman {currentPage + 1} dari {pages.length}
                </div>
            </div>

            {/* Book Page */}
            <div className="relative w-full max-w-4xl perspective-1000">
                <div
                    className={`transform-style-3d transition-all duration-500 ${
                        isFlipping ? "scale-95 opacity-70 rotate-y-12" : "scale-100 opacity-100"
                    }`}
                >
                    {/* Outer shadow for depth */}
                    <div className="absolute -inset-2 rounded-[2rem] bg-black/10 blur-xl" />
                    
                    <div 
                        className="relative rounded-[2rem] border-4 shadow-2xl overflow-hidden"
                        style={{
                            background: template.background,
                            borderColor: template.borderColor,
                        }}
                    >
                        {/* Pattern overlay */}
                        <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: template.pattern }}
                        />
                        
                        {/* Decorative elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {template.decorations.map((deco, idx) => (
                                <DecorationIcon key={idx} deco={deco} idx={idx} />
                            ))}
                        </div>

                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 rounded-tl-[2rem] opacity-30" style={{ borderColor: template.borderColor }} />
                        <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 rounded-tr-[2rem] opacity-30" style={{ borderColor: template.borderColor }} />
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 rounded-bl-[2rem] opacity-30" style={{ borderColor: template.borderColor }} />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 rounded-br-[2rem] opacity-30" style={{ borderColor: template.borderColor }} />

                        {/* Page Content */}
                        <div className="relative z-10 p-8 md:p-12 space-y-6">
                            {/* Image with lazy loading */}
                            {page.image && (
                                <div className="overflow-hidden rounded-2xl border-4 border-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
                                    <img
                                        src={page.image}
                                        alt={page.title}
                                        className="h-64 w-full object-cover md:h-80"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <h3 
                                className="text-2xl md:text-4xl font-bold drop-shadow-sm"
                                style={{ color: template.titleColor }}
                            >
                                {page.title}
                            </h3>

                            {/* Body */}
                            {page.body && (
                                <div className="prose prose-lg max-w-none">
                                    <p 
                                        className="text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium"
                                        style={{ color: template.textColor }}
                                    >
                                        {page.body}
                                    </p>
                                </div>
                            )}

                            {/* Page Number Indicator */}
                            <div className="pt-6 flex justify-center gap-2">
                                {pages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageJump(index)}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${
                                            index === currentPage
                                                ? "w-10 shadow-md"
                                                : "w-2.5 hover:w-4"
                                        }`}
                                        style={{
                                            backgroundColor: index === currentPage 
                                                ? template.titleColor 
                                                : `${template.titleColor}40`,
                                        }}
                                        aria-label={`Go to page ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={handlePrev}
                    disabled={isFirstPage || isFlipping}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/40 disabled:hover:bg-white/20 disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 backdrop-blur-md shadow-lg"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {prevLabel}
                </button>

                {!isLastPage ? (
                    <button
                        onClick={handleNext}
                        disabled={isFlipping}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-xl transition hover:from-rose-600 hover:to-purple-700 hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {nextLabel}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 text-sm font-semibold text-white shadow-xl transition hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {finishLabel}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(var(--rotation));
                    }
                    50% {
                        transform: translateY(-10px) rotate(var(--rotation));
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default memo(FlipBookViewer);
