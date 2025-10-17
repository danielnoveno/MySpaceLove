import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { Calendar, ArrowLeft, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
    spaceId: number;
}

export default function TimelineCreate({ spaceId }: Props) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        media: [] as File[],
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [parallaxPos, setParallaxPos] = useState({ x: 0, y: 0 });
    const [previews, setPreviews] = useState<string[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    // ====== Canvas animasi ======
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

    // ====== Submit ======
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route("timeline.store", { spaceId }), {
            forceFormData: true,
            onSuccess: () => router.visit(route("timeline.index", { spaceId })),
        });
    };

    // ====== File handler ======
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalFiles = data.media.length + files.length;

        if (totalFiles > 5) {
            setFileError("Maksimal 5 foto yang dapat diunggah.");
            return;
        }

        setFileError(null);

        const newFiles = [...data.media, ...files];
        setData("media", newFiles);

        const newPreviews = [
            ...previews,
            ...files.map((file) => URL.createObjectURL(file)),
        ];
        setPreviews(newPreviews);
    };

    const removeFile = (index: number) => {
        const newFiles = [...data.media];
        const newPreviews = [...previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setData("media", newFiles);
        setPreviews(newPreviews);
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
                            Tambah Momen Spesial
                        </h1>
                        <p className="text-gray-600">
                            Catat kenangan indah bersama pasangan
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Tambah Momen" />

            <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />

                <div className="relative max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 relative z-10"
                    >
                        <div className="space-y-8">
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
                                    placeholder="Contoh: Anniversary Pertama"
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
                                    placeholder="Ceritakan momen spesial ini..."
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
                                    Foto Kenangan
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-pink-400 transition">
                                    <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                        id="media-upload"
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className="cursor-pointer bg-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-pink-600 transition"
                                    >
                                        Pilih Foto (maks. 5)
                                    </label>
                                    {fileError && (
                                        <p className="text-red-500 text-sm mt-3">
                                            {fileError}
                                        </p>
                                    )}
                                </div>

                                {/* Preview grid */}
                                {previews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {previews.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={url}
                                                    className="w-full h-32 object-cover rounded-xl shadow"
                                                    alt={`preview-${index}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

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
                                        ? "Menyimpan..."
                                        : "Simpan Momen"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
