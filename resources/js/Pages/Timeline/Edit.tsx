import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { Calendar, ArrowLeft, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "react-beautiful-dnd";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";

interface TimelineItem {
    id: number;
    title: string;
    description: string;
    date: string;
    media_paths: string[];
}

export default function TimelineEdit({ item }: { item: TimelineItem }) {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;
    const { data, setData, post, processing, errors } = useForm({
        title: item.title,
        description: item.description,
        date: item.date,
        media: [] as File[],
        removed: [] as string[],
        ordered: item.media_paths || [],
    });

    const [previews, setPreviews] = useState<string[]>(
        item.media_paths?.map((path) => `/storage/${path}`) || []
    );
    const [fileError, setFileError] = useState<string | null>(null);
    const [modalImage, setModalImage] = useState<string | null>(null);

    // Canvas background hearts
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [parallaxPos, setParallaxPos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        const hearts: any[] = [];
        const drawHeart = (x: number, y: number, s: number, o = 0.6) => {
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
            ctx.fillStyle = `rgba(244,63,94,${o})`;
            ctx.fill();
            ctx.restore();
        };
        const anim = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            hearts.forEach((h, i) => {
                h.x += h.dx;
                h.y += h.dy;
                drawHeart(h.x, h.y, h.s);
                if (h.x < 0 || h.y < 0 || h.x > c.width || h.y > c.height)
                    hearts.splice(i, 1);
            });
            requestAnimationFrame(anim);
        };
        anim();
        const move = (e: MouseEvent) => {
            for (let i = 0; i < 2; i++)
                hearts.push({
                    x: e.clientX,
                    y: e.clientY,
                    s: Math.random() * 8 + 10,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                });
            const cx = window.innerWidth / 2,
                cy = window.innerHeight / 2;
            setParallaxPos({
                x: (e.clientX - cx) * 0.02,
                y: (e.clientY - cy) * 0.02,
            });
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    // Handle image upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const total = previews.length + files.length;
        if (total > 5) {
            setFileError("Maksimal 5 foto.");
            return;
        }
        setFileError(null);
        setData("media", [...data.media, ...files]);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setPreviews((p) => [...p, ...newPreviews]);
        setData("ordered", [...data.ordered, ...newPreviews]);
    };

    // Remove old or new image
    const handleRemove = (index: number) => {
        const current = previews[index];
        const oldIndex = item.media_paths.findIndex(
            (p) => `/storage/${p}` === current
        );

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        if (oldIndex !== -1) {
            // old image
            const removedPath = item.media_paths[oldIndex];
            setData("removed", [...data.removed, removedPath]);
            setData(
                "ordered",
                data.ordered.filter((p) => p !== `/storage/${removedPath}`)
            );
        } else {
            // new image
            const newFiles = [...data.media];
            newFiles.splice(index - item.media_paths.length, 1);
            setData("media", newFiles);
        }
    };

    // Drag reorder
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const reordered = Array.from(previews);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setPreviews(reordered);

        // update order for backend
        const newOrdered = reordered.map((p) => p.replace("/storage/", ""));
        setData("ordered", newOrdered);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("timeline.update", { space: spaceSlug, id: item.id }), {
            forceFormData: true,
            onSuccess: () =>
                router.visit(route("timeline.index", { space: spaceSlug })),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("timeline.index", { space: spaceSlug })}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Momen Spesial
                        </h1>
                        <p className="text-gray-600">
                            Perbarui kenangan dan atur urutannya di{" "}
                            {spaceTitle}
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

                <div className="relative max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 relative z-10 space-y-8"
                    >
                        {/* Text Inputs */}
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
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

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
                                    className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                rows={5}
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Reorderable Preview */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-3">
                                Foto (klik dan seret untuk ubah urutan)
                            </label>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable
                                    droppableId="images"
                                    direction="horizontal"
                                >
                                    {(provided) => (
                                        <div
                                            className="flex gap-4 overflow-x-auto pb-2"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {previews.map((src, i) => (
                                                <Draggable
                                                    draggableId={src}
                                                    index={i}
                                                    key={src}
                                                >
                                                    {(prov) => (
                                                        <div
                                                            ref={prov.innerRef}
                                                            {...prov.draggableProps}
                                                            {...prov.dragHandleProps}
                                                            className="relative group flex-shrink-0"
                                                        >
                                                            <img
                                                                src={src}
                                                                className="w-40 h-32 object-cover rounded-xl shadow cursor-move"
                                                                onClick={() =>
                                                                    setModalImage(
                                                                        src
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemove(
                                                                        i
                                                                    )
                                                                }
                                                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        {/* Upload new */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                Tambah Foto Baru
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
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Link
                                href={route("timeline.index", {
                                    space: spaceSlug,
                                })}
                                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-center"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
                            >
                                {processing
                                    ? "Memperbarui..."
                                    : "Perbarui Momen"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Modal Preview */}
                {modalImage && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        onClick={() => setModalImage(null)}
                    >
                        <img
                            src={modalImage}
                            alt="Preview"
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                        />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
