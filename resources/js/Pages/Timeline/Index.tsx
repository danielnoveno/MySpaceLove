import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Calendar, Edit, Plus, Heart, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TimelineItem {
    id: number;
    title: string;
    description: string;
    date: string;
    media_path?: string;
}

interface Props {
    timelines: TimelineItem[];
    spaceId: number;
}

export default function TimelineIndex({ timelines, spaceId }: Props) {
    const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [parallaxPos, setParallaxPos] = useState({ x: 0, y: 0 });
    const [randomHearts] = useState(() =>
        Array.from({ length: 40 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 14 + 8,
            opacity: Math.random() * 0.5 + 0.2,
        }))
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const hearts: {
            x: number;
            y: number;
            size: number;
            dx: number;
            dy: number;
        }[] = [];

        const createHeart = (x: number, y: number) => {
            hearts.push({
                x,
                y,
                size: Math.random() * 8 + 10,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
            });
        };

        const drawHeart = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            size: number,
            opacity = 0.6
        ) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(size / 20, size / 20);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(0, -3, -5, -15, -20, -15);
            ctx.bezierCurveTo(-55, -15, -55, 22.5, -55, 22.5);
            ctx.bezierCurveTo(-55, 40, -35, 62, 0, 80);
            ctx.bezierCurveTo(35, 62, 55, 40, 55, 22.5);
            ctx.bezierCurveTo(55, 22.5, 55, -15, 20, -15);
            ctx.bezierCurveTo(5, -15, 0, -3, 0, 0);
            ctx.fillStyle = `rgba(244,63,94,${opacity})`;
            ctx.fill();
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            hearts.forEach((h, i) => {
                h.x += h.dx;
                h.y += h.dy;
                drawHeart(ctx, h.x, h.y, h.size);
                if (
                    h.x < 0 ||
                    h.y < 0 ||
                    h.x > canvas.width ||
                    h.y > canvas.height
                ) {
                    hearts.splice(i, 1);
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleMouseMove = (e: MouseEvent) => {
            for (let i = 0; i < 2; i++) {
                createHeart(e.clientX, e.clientY);
            }
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            setParallaxPos({
                x: (e.clientX - centerX) * 0.02,
                y: (e.clientY - centerY) * 0.02,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Love Timeline
                    </h2>
                    <Link
                        href={route("timeline.create", { spaceId })}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Momen
                    </Link>
                </div>
            }
        >
            <Head title="Love Timeline" />

            {/* Background Animasi */}
            <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {randomHearts.map((h, idx) => (
                        <div
                            key={idx}
                            className="absolute text-pink-400 select-none"
                            style={{
                                left: h.x,
                                top: h.y,
                                fontSize: h.size,
                                opacity: h.opacity,
                                transform: `translate3d(${
                                    parallaxPos.x * 0.5
                                }px, ${parallaxPos.y * 0.5}px, 0)`,
                                transition: "transform 0.2s ease-out",
                            }}
                        >
                            ♥
                        </div>
                    ))}
                </div>

                <div
                    className="absolute inset-0 flex justify-center items-center pointer-events-none text-6xl opacity-20 select-none"
                    style={{
                        transform: `translate3d(${parallaxPos.x}px, ${parallaxPos.y}px, 0)`,
                        transition: "transform 0.1s ease-out",
                    }}
                >
                    ❤️ 💕 💖 💘 💓
                </div>

                {/* Konten Timeline */}
                <div className="relative z-10 max-w-6xl mx-auto">
                    {timelines.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                    Belum ada momen tersimpan
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Mulai tambahkan momen spesial pertama
                                    kalian!
                                </p>
                                <Link
                                    href={route("timeline.create", { spaceId })}
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg inline-block hover:shadow-lg transition-all"
                                >
                                    Tambah Momen Pertama
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {timelines.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    {item.media_path && (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={`/storage/${item.media_path}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(item.date)}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {item.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() =>
                                                    setSelectedItem(item)
                                                }
                                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Detail
                                            </button>
                                            <Link
                                                href={route("timeline.edit", {
                                                    spaceId,
                                                    id: item.id,
                                                })}
                                                className="text-pink-600 hover:text-pink-700 flex items-center gap-1 text-sm font-medium"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Detail */}
                {selectedItem && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-lg p-6 max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedItem.media_path && (
                                <img
                                    src={`/storage/${selectedItem.media_path}`}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-2xl font-semibold mb-2 text-center">
                                {selectedItem.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 text-center">
                                {formatDate(selectedItem.date)}
                            </p>
                            <p className="text-gray-700 text-center">
                                {selectedItem.description}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
