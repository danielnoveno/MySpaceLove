import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { FileText, Eye, Edit, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Doc {
    id: number;
    title: string;
    notes: string;
    file_path: string;
    created_at: string;
}

interface Props {
    docs: Doc[];
}

export default function DocsIndex({ docs }: Props) {
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 🌟 Background animasi
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

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const handlePreview = (path: string) => setPreviewUrl(`/storage/${path}`);
    const closePreview = () => setPreviewUrl(null);

    const getFileType = (filePath: string) => {
        const ext = filePath.split(".").pop()?.toLowerCase() || "";
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
        if (["pdf"].includes(ext)) return "pdf";
        if (["mp4", "webm"].includes(ext)) return "video";
        return "other";
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        My Documents
                    </h2>
                    <Link
                        href={route("docs.create")}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Upload File
                    </Link>
                </div>
            }
        >
            <Head title="Documents" />

            <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-10 px-6 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />
                {randomHearts.map((h, i) => (
                    <div
                        key={i}
                        className="absolute text-orange-400 select-none"
                        style={{
                            left: h.x,
                            top: h.y,
                            fontSize: h.size,
                            opacity: h.opacity,
                            transform: `translate3d(${parallaxPos.x * 0.5}px, ${
                                parallaxPos.y * 0.5
                            }px, 0)`,
                        }}
                    >
                        ♥
                    </div>
                ))}

                <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.length === 0 ? (
                        <div className="text-center col-span-full py-20">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No documents yet</p>
                        </div>
                    ) : (
                        docs.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6"
                            >
                                <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                                    {doc.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-3 line-clamp-3">
                                    {doc.notes}
                                </p>
                                <p className="text-sm text-gray-500">No files selected yet.</p>
                                <p className="text-xs text-gray-400 mb-4">
                                    Uploaded {formatDate(doc.created_at)}
                                </p>
                                <div className="flex justify-between">
                                    <button
                                        onClick={() =>
                                            handlePreview(doc.file_path)
                                        }
                                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" /> Preview
                                    </button>
                                    <Link
                                        href={route("docs.edit", {
                                            id: doc.id,
                                        })}
                                        className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 📄 Modal Preview */}
                {previewUrl && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full h-[80vh] relative overflow-hidden">
                            <button
                                onClick={closePreview}
                                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {(() => {
                                const type = getFileType(previewUrl);
                                if (type === "image")
                                    return (
                                        <img
                                            src={previewUrl}
                                            className="w-full h-full object-contain"
                                        />
                                    );
                                if (type === "pdf")
                                    return (
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full"
                                        />
                                    );
                                if (type === "video")
                                    return (
                                        <video
                                            src={previewUrl}
                                            controls
                                            className="w-full h-full"
                                        />
                                    );
                                return (
                                    <div className="flex h-72 items-center justify-center text-sm text-gray-400">
                                        No preview available yet.
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
