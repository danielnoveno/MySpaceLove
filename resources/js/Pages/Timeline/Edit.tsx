import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { Calendar, ArrowLeft, Upload, Image, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TimelineItem {
    id: number;
    title: string;
    description: string;
    date: string;
    media_path: string | null;
}

interface Props {
    item: TimelineItem;
    spaceId: number;
}

export default function TimelineEdit({ item, spaceId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: item.title,
        description: item.description,
        date: item.date,
        media: null as File | null,
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

    // Modal Image State
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState<string | null>(null);

    const handleImageClick = (src: string) => {
        setModalImage(src);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalImage(null);
    };

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
            for (let i = 0; i < 3; i++) createHeart(e.clientX, e.clientY);
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
        post(route("timeline.update", { spaceId, id: item.id }), {
            forceFormData: true,
            onSuccess: () => router.visit(route("timeline.index", { spaceId })),
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData("media", file);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("timeline.index", { spaceId })}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Momen Spesial
                        </h1>
                        <p className="text-gray-600">
                            Perbarui kenangan indah ini
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Momen" />

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

                <div className="relative max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 relative z-10 space-y-8"
                    >
                        {/* Current Image Preview */}
                        {item.media_path && (
                            <div className="text-center relative">
                                <img
                                    src={`/storage/${item.media_path}`}
                                    alt={item.title}
                                    className="w-96 h-60 object-cover rounded-xl shadow mx-auto cursor-pointer relative z-10"
                                    onClick={() =>
                                        handleImageClick(
                                            `/storage/${item.media_path}`
                                        )
                                    }
                                />
                                {/* Overlay hanya untuk efek hover, jangan pakai pointer-events */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition rounded-xl flex items-center justify-center pointer-events-none">
                                    <Image className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition" />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Foto saat ini
                                </p>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Judul Momen
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-gray-800"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Tanggal
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData("date", e.target.value)
                                    }
                                    className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-gray-800"
                                />
                            </div>
                            {errors.date && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.date}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                rows={6}
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-gray-800"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Media Upload */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Ganti Foto
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-pink-400 transition">
                                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                    id="media-upload"
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="cursor-pointer bg-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-pink-600 transition"
                                >
                                    Pilih Foto Baru
                                </label>
                                {data.media && (
                                    <p className="text-sm text-gray-600 mt-3">
                                        {data.media.name}
                                    </p>
                                )}
                            </div>
                            {errors.media && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.media}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Link
                                href={route("timeline.index", { spaceId })}
                                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-center font-medium"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {processing
                                    ? "Memperbarui..."
                                    : "Perbarui Momen"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Modal Image Popup */}
                {showModal && modalImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
                        onClick={closeModal}
                    >
                        <div className="relative max-w-3xl max-h-full p-4">
                            <img
                                src={modalImage}
                                alt="Preview"
                                className="w-full h-auto rounded-xl shadow-lg transform transition-transform duration-300 z-40"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
