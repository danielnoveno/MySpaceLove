import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { ArrowLeft, Calendar, Upload, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { convertImageToWebP } from "@/utils/imageConverter";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Contexts/ToastContext";

const MAX_FILES = 5;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type TimelineTranslations = Record<string, any>;

export default function TimelineCreate() {
    const currentSpace = useCurrentSpace();
    const { showSuccess, showError } = useToast();
    const { translations: timelineStrings } =
        useTranslation<TimelineTranslations>("timeline");
    const { t: errorTranslator } = useTranslation("errors");

    const headingStrings = timelineStrings?.create?.heading ?? {};
    const formStrings = timelineStrings?.create?.form ?? {};

    const headTitle = timelineStrings?.meta?.create ?? "Add Memory";

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        media: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const createdPreviewUrls = useRef<string[]>([]);

    useEffect(() => {
        return () => {
            createdPreviewUrls.current.forEach((url) =>
                URL.revokeObjectURL(url)
            );
        };
    }, []);

    const cancelLabel = formStrings.actions?.cancel ?? "Cancel";
    const submitLabel = formStrings.actions?.submit ?? "Save memory";
    const submittingLabel = formStrings.actions?.submitting ?? "Saving…";
    const mediaHelper = (formStrings.media?.helper as string | undefined)?.replace(
        ":count",
        String(MAX_FILES)
    );
    const mediaLabel = formStrings.media?.label ?? "Photos";
    const mediaButton = formStrings.media?.button ?? "Choose photos";
    const emptyMedia = formStrings.media?.empty ?? "No photos selected yet.";
    const previewLabel = formStrings.media?.preview_label ?? "Preview";

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (fileError) {
            return;
        }

        clearErrors();
        post(route("timeline.store", { space: spaceSlug }), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                showSuccess("Momen spesial berhasil ditambahkan!");
                router.visit(route("timeline.index", { space: spaceSlug }));
            },
            onError: (errors) => {
                console.error("Timeline creation failed", errors);
                showError("Gagal menyimpan momen. Silakan periksa kembali input Anda.");
            },
        });
    };

    const translatedSizeError = useMemo(
        () =>
            errorTranslator(
                "timeline.image_too_large",
                "File size too large. Maximum 10 MB for memory and special moment photos."
            ),
        [errorTranslator]
    );

    const maxFilesError = useMemo(
        () =>
            errorTranslator(
                "timeline.max_media_count",
                "You can upload up to :count photos at once."
            ).replace(":count", String(MAX_FILES)),
        [errorTranslator]
    );

    const conversionError = useMemo(
        () =>
            errorTranslator(
                "upload.image_not_convertible",
                "The image could not be processed into .webp format."
            ),
        [errorTranslator]
    );

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) {
            return;
        }

        if (data.media.length + selectedFiles.length > MAX_FILES) {
            setFileError(maxFilesError);
            return;
        }

        const convertedFiles: File[] = [];
        const newPreviews: string[] = [];

        for (const file of selectedFiles) {
            try {
                const webpFile = await convertImageToWebP(file);

                if (webpFile.size > MAX_UPLOAD_BYTES) {
                    setFileError(translatedSizeError);
                    return;
                }

                convertedFiles.push(webpFile);
                const url = URL.createObjectURL(webpFile);
                createdPreviewUrls.current.push(url);
                newPreviews.push(url);
            } catch (error) {
                console.error("Error converting image to WebP:", error);
                setFileError(conversionError);
                return;
            }
        }

        setFileError(null);
        setData("media", [...data.media, ...convertedFiles]);
        setPreviews([...previews, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        const newFiles = [...data.media];
        const newPreviews = [...previews];
        const [removedPreview] = newPreviews.splice(index, 1);
        if (removedPreview) {
            URL.revokeObjectURL(removedPreview);
            createdPreviewUrls.current = createdPreviewUrls.current.filter(
                (url) => url !== removedPreview
            );
        }
        newFiles.splice(index, 1);
        setData("media", newFiles);
        setPreviews(newPreviews);
    };

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#f43f5e",
                heartCount: 42,
                className: "opacity-70",
            }}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("timeline.index", { space: spaceSlug })}
                        className="rounded-lg p-2 transition hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {headingStrings.title ?? "Add Special Moment"}
                        </h1>
                        <p className="text-gray-600">
                            {(headingStrings.subtitle as string | undefined)?.replace(
                                ":space",
                                spaceTitle
                            ) ?? `Record a cherished memory for ${spaceTitle}.`}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={headTitle} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="relative mx-auto max-w-4xl">
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-lg backdrop-blur-sm md:p-10"
                    >
                        <div className="space-y-8">
                            <div>
                                <label className="mb-2 block text-base font-semibold text-gray-800">
                                    {formStrings.title?.label ?? "Moment Title"}
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                    className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-gray-800 transition focus:border-transparent focus:ring-2 focus:ring-pink-500"
                                    placeholder={
                                        formStrings.title?.placeholder ??
                                        "e.g. Our first anniversary dinner"
                                    }
                                />
                                {errors.title && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-base font-semibold text-gray-800">
                                    {formStrings.date?.label ?? "Date"}
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) =>
                                            setData("date", e.target.value)
                                        }
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className="w-full rounded-2xl border border-gray-300 pl-12 pr-5 py-4 text-gray-800 transition focus:border-transparent focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                {errors.date && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-base font-semibold text-gray-800">
                                    {formStrings.description?.label ?? "Description"}
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    rows={6}
                                    className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-gray-800 transition focus:border-transparent focus:ring-2 focus:ring-pink-500"
                                    placeholder={
                                        formStrings.description?.placeholder ??
                                        "Tell the story behind this moment…"
                                    }
                                />
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-3 block text-base font-semibold text-gray-800">
                                    {mediaLabel}
                                </label>
                                <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-pink-400">
                                    <Upload className="mx-auto mb-4 h-16 w-16 text-pink-500" />
                                    <p className="mb-2 text-sm text-gray-600">
                                        {mediaHelper ?? `Upload up to ${MAX_FILES} photos.`}
                                    </p>
                                    <input
                                        type="file"
                                        id="timeline-media"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="timeline-media"
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600"
                                    >
                                        {mediaButton}
                                    </label>
                                    {data.media.length > 0 && (
                                        <p className="mt-4 text-sm text-gray-600">
                                            {data.media.length} / {MAX_FILES}
                                        </p>
                                    )}
                                </div>
                                {fileError && (
                                    <p className="mt-2 text-sm text-red-500">{fileError}</p>
                                )}
                                {errors.media && (
                                    <p className="mt-2 text-sm text-red-500">{errors.media}</p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-pink-100 bg-white/75 p-6 shadow-sm">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pink-600">
                                    {previewLabel}
                                </h3>
                                {previews.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {previews.map((url, index) => (
                                            <div
                                                key={`${url}-${index}`}
                                                className="group relative overflow-hidden rounded-2xl border border-pink-100 shadow-sm"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`preview-${index}`}
                                                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-black/60 p-2 text-white transition hover:bg-black"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">{emptyMedia}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Link
                                href={route("timeline.index", { space: spaceSlug })}
                                className="flex-1 rounded-xl border border-gray-300 px-6 py-4 text-center font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                {cancelLabel}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 font-semibold text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? submittingLabel : submitLabel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
