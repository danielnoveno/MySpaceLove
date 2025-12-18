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
import { convertImageToWebP } from "@/utils/imageConverter";
import { useTranslation } from "@/hooks/useTranslation";

interface TimelineItem {
    uuid: string;
    title: string;
    description: string | null;
    date: string;
    media_paths: string[];
}

type ExistingMediaItem = {
    kind: "existing";
    path: string;
    url: string;
};

type NewMediaItem = {
    kind: "new";
    id: string;
    file: File;
    url: string;
};

type MediaItem = ExistingMediaItem | NewMediaItem;

export default function TimelineEdit({ item }: { item: TimelineItem }) {
    const currentSpace = useCurrentSpace();
    const { t: errorTranslator } = useTranslation("errors");
    const { translations: timelineStrings } = useTranslation<Record<string, any>>("timeline");
    const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
    const MAX_FILES = 5;
    const translatedSizeError = errorTranslator(
        "timeline.image_too_large",
        "File size too large. Maximum 10 MB for memory and special moment photos."
    );
    const translatedMaxFiles = errorTranslator(
        "timeline.max_media_count",
        "You can upload up to :count photos at once."
    ).replace(":count", String(MAX_FILES));
    const conversionError = errorTranslator(
        "upload.image_not_convertible",
        "The image could not be processed into .webp format."
    );
    const editHeadingStrings = timelineStrings?.edit?.heading ?? {};
    const createFormStrings = timelineStrings?.create?.form ?? {};
    const cancelLabel = createFormStrings.actions?.cancel ?? "Cancel";
    const submitLabel = editHeadingStrings.submit ?? createFormStrings.actions?.submit ?? "Save memory";
    const submittingLabel = editHeadingStrings.submitting ?? createFormStrings.actions?.submitting ?? "Saving…";
    const mediaLabel = editHeadingStrings.media_label ?? createFormStrings.media?.label ?? "Photos";
    const mediaButton = editHeadingStrings.media_button ?? createFormStrings.media?.button ?? "Choose photos";
    const mediaHelper = (createFormStrings.media?.helper as string | undefined)?.replace(":count", String(MAX_FILES)) ??
        `Upload up to ${MAX_FILES} photos.`;

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;
    const headTitle = timelineStrings?.meta?.edit ?? "Edit Memory";

    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        description: string;
        date: string;
        media: File[];
        media_keys: string[];
        removed: string[];
        ordered: string[];
    }>({
        title: item.title ?? "",
        description: item.description ?? "",
        date: item.date,
        media: [],
        media_keys: [],
        removed: [],
        ordered: item.media_paths || [],
    });

    const initialExistingMedia = (item.media_paths ?? []).map((path) => ({
        kind: "existing" as const,
        path,
        url: `/storage/${path}`,
    }));

    const [mediaItems, setMediaItems] = useState<MediaItem[]>(
        initialExistingMedia
    );
    const createdPreviewUrls = useRef<string[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [modalImage, setModalImage] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            createdPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
            createdPreviewUrls.current = [];
        };
    }, []);

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
    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
            return;
        }

        const total = mediaItems.length + files.length;
        if (total > MAX_FILES) {
            setFileError(translatedMaxFiles);
            return;
        }

        const convertedMedia: NewMediaItem[] = [];
        const convertedFiles: File[] = [];
        const newUrls: string[] = [];

        for (const file of files) {
            try {
                const webpFile = await convertImageToWebP(file);

                if (webpFile.size > MAX_UPLOAD_BYTES) {
                    setFileError(translatedSizeError);
                    newUrls.forEach((url) => URL.revokeObjectURL(url));
                    return;
                }

                const id =
                    typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `new-${Date.now()}-${Math.random()
                              .toString(16)
                              .slice(2, 10)}`;
                const url = URL.createObjectURL(webpFile);
                createdPreviewUrls.current.push(url);
                newUrls.push(url);
                convertedFiles.push(webpFile);
                convertedMedia.push({
                    kind: "new",
                    id,
                    file: webpFile,
                    url,
                });
            } catch (error) {
                console.error("Failed to convert image to WebP", error);
                setFileError(conversionError);
                newUrls.forEach((url) => URL.revokeObjectURL(url));
                return;
            }
        }

        setFileError(null);
        setMediaItems((prev) => [...prev, ...convertedMedia]);
        setData((current) => ({
            ...current,
            media: [...current.media, ...convertedFiles],
            media_keys: [
                ...current.media_keys,
                ...convertedMedia.map((item) => item.id),
            ],
        }));
    };

    // Remove old or new image
    const handleRemove = (index: number) => {
        const target = mediaItems[index];
        if (!target) {
            return;
        }

        setMediaItems((prev) => prev.filter((_, idx) => idx !== index));

        if (target.kind === "existing") {
            setData((current) => ({
                ...current,
                removed: current.removed.includes(target.path)
                    ? current.removed
                    : [...current.removed, target.path],
            }));
        } else {
            URL.revokeObjectURL(target.url);
            createdPreviewUrls.current = createdPreviewUrls.current.filter(
                (url) => url !== target.url
            );

            setData((current) => {
                const keyIndex = current.media_keys.indexOf(target.id);
                if (keyIndex === -1) {
                    return current;
                }
                const nextMedia = [...current.media];
                const nextKeys = [...current.media_keys];

                nextMedia.splice(keyIndex, 1);
                nextKeys.splice(keyIndex, 1);

                return {
                    ...current,
                    media: nextMedia as File[],
                    media_keys: nextKeys,
                };
            });
        }
    };

    // Drag reorder
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const destinationIndex = result.destination.index;
        setMediaItems((prev) => {
            const reordered = Array.from(prev);
            const [removed] = reordered.splice(result.source.index, 1);
            if (!removed) {
                return prev;
            }
            reordered.splice(destinationIndex, 0, removed);
            return reordered;
        });
    };

    useEffect(() => {
        setData((current) => ({
            ...current,
            ordered: mediaItems.map((media) =>
                media.kind === "existing" ? media.path : media.id
            ),
        }));
    }, [mediaItems, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("timeline.update", { space: spaceSlug, timeline: item.uuid }), {
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
                            {editHeadingStrings.title ?? "Edit Memory"}
                        </h1>
                        <p className="text-gray-600">
                            {(editHeadingStrings.subtitle as string | undefined)?.replace(
                                ":space",
                                spaceTitle,
                            ) ?? `Refresh the details for ${spaceTitle}.`}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={headTitle} />
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
                                {createFormStrings.title?.label ?? "Moment Title"}
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                                placeholder={
                                    createFormStrings.title?.placeholder ??
                                    "e.g. Our first anniversary dinner"
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                {createFormStrings.date?.label ?? "Date"}
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
                                {createFormStrings.description?.label ?? "Description"}
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                rows={5}
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                                placeholder={
                                    createFormStrings.description?.placeholder ??
                                    "Tell the story behind this moment…"
                                }
                            />
                        </div>

                        {/* Reorderable Preview */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-3">
                                {mediaLabel}
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
                                            {mediaItems.map((preview, index) => {
                                                const dragId =
                                                    preview.kind === "existing"
                                                        ? `existing-${preview.path}`
                                                        : `new-${preview.id}`;
                                                return (
                                                    <Draggable
                                                        draggableId={dragId}
                                                        index={index}
                                                        key={dragId}
                                                    >
                                                        {(prov) => (
                                                            <div
                                                                ref={prov.innerRef}
                                                                {...prov.draggableProps}
                                                                {...prov.dragHandleProps}
                                                                className="group relative flex-shrink-0"
                                                            >
                                                                <img
                                                                    src={preview.url}
                                                                    className="h-32 w-40 cursor-move rounded-xl object-cover shadow"
                                                                    onClick={() =>
                                                                        setModalImage(
                                                                            preview.url
                                                                        )
                                                                    }
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemove(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        {/* Upload new */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">
                                {mediaLabel}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-pink-400 transition">
                                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600 mb-4">{mediaHelper}</p>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(event) => {
                                        void handleFileChange(event);
                                    }}
                                    accept="image/*"
                                    className="hidden"
                                    id="media-upload"
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="cursor-pointer bg-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-pink-600 transition"
                                >
                                    {mediaButton}
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
                                {cancelLabel}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
                            >
                                {processing ? submittingLabel : submitLabel}
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
