import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { ArrowLeft, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";

export default function GalleryCreate() {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        file: null as File | null,
    });

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
            ctx.fillStyle = `rgba(16,185,129,${opacity})`; // emerald-500
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
            for (let i = 0; i < 3; i++) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("gallery.store", { space: spaceSlug }), {
            forceFormData: true,
            onSuccess: () =>
                router.visit(route("gallery.index", { space: spaceSlug })),
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData("file", e.target.files?.[0] || null);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("gallery.index", { space: spaceSlug })}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Upload Galeri
                        </h1>
                        <p className="text-gray-600">
                            Tambahkan foto atau video ke galeri {spaceTitle}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Upload Galeri - ${spaceTitle}`} />

            <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
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

                <div
                    className="absolute inset-0 flex justify-center items-center pointer-events-none text-6xl opacity-20 select-none"
                    style={{
                        transform: `translate3d(${parallaxPos.x}px, ${parallaxPos.y}px, 0)`,
                        transition: "transform 0.1s ease-out",
                    }}
                >
                    💚 💖 💚 💚
                </div>

                <div className="relative max-w-3xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 relative z-10 space-y-8"
                    >
                        {/* Title */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Judul
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800"
                                placeholder="Contoh: Foto Liburan"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                File (Foto/Video)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 transition">
                                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition"
                                >
                                    Pilih File
                                </label>
                                {data.file && (
                                    <p className="text-sm text-gray-600 mt-3">
                                        {data.file.name}
                                    </p>
                                )}
                            </div>
                            {errors.file && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.file}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Link
                                href={route("gallery.index", {
                                    space: spaceSlug,
                                })}
                                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-center font-medium"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {processing ? "Mengunggah..." : "Upload"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
