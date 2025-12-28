import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { BookOpen, Sparkles, Heart, ArrowRight, Star } from "lucide-react";
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
    const [isHovering, setIsHovering] = useState(false);

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
        <div className="relative min-h-screen overflow-hidden" style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}>
            <Head title={headTitle} />
            
            {!showBook ? (
                <div className="relative min-h-screen flex items-center justify-center p-6">
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[10%] left-[15%] text-4xl opacity-20 animate-float" style={{ animationDuration: '3s' }}>💕</div>
                        <div className="absolute top-[20%] right-[20%] text-3xl opacity-15 animate-float" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>⭐</div>
                        <div className="absolute top-[60%] left-[10%] text-3xl opacity-20 animate-float" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🌸</div>
                        <div className="absolute bottom-[20%] right-[15%] text-4xl opacity-15 animate-float" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>💖</div>
                        <div className="absolute bottom-[30%] left-[25%] text-3xl opacity-20 animate-float" style={{ animationDuration: '3.8s', animationDelay: '2s' }}>✨</div>
                        <div className="absolute top-[40%] right-[10%] text-3xl opacity-15 animate-float" style={{ animationDuration: '4.2s', animationDelay: '2.5s' }}>🦋</div>
                    </div>

                    {/* Main content */}
                    <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
                        {/* Title section */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <BookOpen className="w-5 h-5 text-pink-300" />
                                <span className="text-sm font-semibold text-white/90 tracking-wider">MEMORY FLIPBOOK</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl">
                                {coverTitle}
                            </h1>
                            
                            <p className="text-lg text-white/70 max-w-md mx-auto">
                                Sebuah koleksi kenangan indah yang telah kita lalui bersama 💕
                            </p>
                        </div>

                        {/* Cover preview */}
                        {coverImage && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                                <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl transform group-hover:scale-105 transition duration-500">
                                    <img
                                        src={coverImage}
                                        alt={coverTitle}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-6 text-white/80">
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
                                <span className="text-sm font-medium">{bookPages.length} Halaman</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-white/40"></div>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                                <span className="text-sm font-medium">Kenangan Spesial</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleNextClick}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                {/* Animated gradient background */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-size-200 animate-gradient"></div>
                                
                                {/* Glow effect */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-75 transition duration-300"></div>
                                
                                {/* Button content */}
                                <span className="relative flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 animate-pulse" />
                                    <span>Buka Flipbook</span>
                                    <ArrowRight className={`w-6 h-6 transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} />
                                </span>
                            </button>

                            <p className="mt-4 text-sm text-white/50">
                                Klik untuk memulai perjalanan kenangan kita ✨
                            </p>
                        </div>
                    </div>

                    {/* CSS Animations */}
                    <style>{`
                        @keyframes float {
                            0%, 100% {
                                transform: translateY(0px) rotate(0deg);
                            }
                            50% {
                                transform: translateY(-20px) rotate(5deg);
                            }
                        }
                        
                        @keyframes gradient {
                            0%, 100% {
                                background-position: 0% 50%;
                            }
                            50% {
                                background-position: 100% 50%;
                            }
                        }
                        
                        .animate-float {
                            animation: float ease-in-out infinite;
                        }
                        
                        .animate-gradient {
                            background-size: 200% 200%;
                            animation: gradient 3s ease infinite;
                        }
                        
                        .bg-size-200 {
                            background-size: 200% 200%;
                        }
                    `}</style>
                </div>
            ) : (
                <Book pages={bookPages as any} coverImage={coverImage as any} coverTitle={coverTitle} />
            )}
        </div>
    );
}
