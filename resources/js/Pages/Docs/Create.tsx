import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, router } from "@inertiajs/react";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function DocsCreate() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: "",
        file: null as File | null,
        notes: "",
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [parallaxPos, setParallaxPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const hearts: any[] = [];

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
            ctx: any,
            x: number,
            y: number,
            s: number,
            o = 0.6
        ) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(s / 20, s / 20);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(0, -3, -5, -15, -20, -15);
            ctx.bezierCurveTo(-55, -15, -55, 22.5, -55, 22.5);
            ctx.bezierCurveTo(-55, 40, -35, 62, 0, 80);
            ctx.bezierCurveTo(35, 62, 55, 40, 55, 22.5);
            ctx.bezierCurveTo(55, 22.5, 55, -15, 20, -15);
            ctx.bezierCurveTo(5, -15, 0, -3, 0, 0);
            ctx.fillStyle = `rgba(251,146,60,${o})`;
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
                )
                    hearts.splice(i, 1);
            });
            requestAnimationFrame(animate);
        };
        animate();

        const handleMouseMove = (e: MouseEvent) => {
            for (let i = 0; i < 2; i++) createHeart(e.clientX, e.clientY);
            setParallaxPos({
                x: (e.clientX - window.innerWidth / 2) * 0.02,
                y: (e.clientY - window.innerHeight / 2) * 0.02,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route("docs.store"), {
            forceFormData: true,
            onSuccess: () => router.visit(route("docs.index")),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("docs.index")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Upload Dokumen
                        </h1>
                        <p className="text-gray-600">
                            Simpan file penting & kenangan kalian
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Upload Document" />

            <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />

                <div className="relative max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 relative z-10 space-y-8"
                    >
                        <div>
                            <label className="block font-semibold text-gray-800 mb-2">
                                Judul Dokumen
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500"
                                placeholder="Contoh: Tiket Liburan"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-800 mb-2">
                                File
                            </label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    setData("file", e.target.files?.[0] || null)
                                }
                                className="block w-full border border-gray-300 rounded-2xl p-3 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-800 mb-2">
                                Catatan
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                rows={4}
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500"
                                placeholder="Tambahkan deskripsi singkat..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Link
                                href={route("docs.index")}
                                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-center font-medium"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                {processing ? "Menyimpan..." : "Simpan Dokumen"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
