import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Plus, Edit, Heart, Eye } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";

interface GalleryItem {
    id: number;
    title: string;
    file_path: string;
}

export default function GalleryIndex({ items }: { items: GalleryItem[] }) {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [parallaxPos, setParallaxPos] = useState({ x: 0, y: 0 });
    const [randomHearts] = useState(() =>
        Array.from({ length: 30 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 14 + 8,
            opacity: Math.random() * 0.5 + 0.2,
        }))
    );

    const polaroidAngles = useMemo(() => {
        return items.reduce<Record<number, number>>((acc, item, index) => {
            const seed = Math.sin(item.id * 37.21 + index * 11.3) * 1000;
            const angle = ((seed - Math.floor(seed)) * 12 - 6).toFixed(2);
            acc[item.id] = Number(angle);
            return acc;
        }, {});
    }, [items]);

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
            ctx.fillStyle = `rgba(34,197,94,${opacity})`; // hijau emerald-500
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
            for (let i = 0; i < 2; i++) createHeart(e.clientX, e.clientY);

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-green-500" />
                        Galeri {spaceTitle}
                    </h2>
                    <Link
                        href={route("gallery.create", { space: spaceSlug })}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Upload
                    </Link>
                </div>
            }
        >
            <Head title={`Gallery - ${spaceTitle}`} />

            {/* Background Animasi */}
            <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {randomHearts.map((h, idx) => (
                        <div
                            key={idx}
                            className="absolute text-green-400 select-none"
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

                {/* Konten Galeri */}
                <div className="relative z-10 max-w-6xl mx-auto">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                    Belum ada foto/video
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Upload momen spesial pertamamu ✨
                                </p>
                                <Link
                                    href={route("gallery.create", { space: spaceSlug })}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg inline-block hover:shadow-lg transition-all"
                                >
                                    Upload Sekarang
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {items.map((item) => {
                                const rotation = polaroidAngles[item.id] ?? 0;
                                const shadowRotation = rotation > 0 ? rotation - 6 : rotation + 6;
                                const storagePath = `/storage/${item.file_path}`;

                                return (
                                    <div key={item.id} className="relative group">
                                        <div
                                            className="absolute inset-0 rounded-[30px] bg-white/60 shadow-lg -z-10 transition duration-300 group-hover:translate-x-2 group-hover:-translate-y-2"
                                            style={{ transform: `rotate(${shadowRotation}deg)` }}
                                        />
                                        <div
                                            className="relative bg-white rounded-[30px] shadow-2xl border border-rose-50 px-6 pt-6 pb-8 transition duration-300 group-hover:-translate-y-2"
                                            style={{ transform: `rotate(${rotation}deg)` }}
                                        >
                                            <div className="overflow-hidden rounded-2xl border-4 border-white shadow-inner">
                                                <img
                                                    src={storagePath}
                                                    alt={item.title}
                                                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                />
                                            </div>
                                            <p className="mt-5 text-center text-lg font-semibold text-gray-800">
                                                {item.title || "Untitled"}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-gray-400">
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 transition"
                                                >
                                                    <Eye className="h-4 w-4" /> Detail
                                                </button>
                                                <div className="flex items-center gap-4">
                                                    <Link
                                                        href={route("gallery.edit", {
                                                            space: spaceSlug,
                                                            id: item.id,
                                                        })}
                                                        className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 transition"
                                                    >
                                                        <Edit className="h-4 w-4" /> Edit
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            confirm("Yakin hapus?") &&
                                                            router.delete(
                                                                route("gallery.destroy", {
                                                                    space: spaceSlug,
                                                                    id: item.id,
                                                                }),
                                                            )
                                                        }
                                                        className="text-rose-500 hover:text-rose-600 transition"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
                            <img
                                src={`/storage/${selectedItem.file_path}`}
                                alt={selectedItem.title}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg mb-4"
                            />
                            <h3 className="text-2xl font-semibold mb-2 text-center">
                                {selectedItem.title}
                            </h3>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
