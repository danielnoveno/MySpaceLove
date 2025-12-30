import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Trash2, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useToast } from "@/Contexts/ToastContext";
const MAX_FILES = 12;
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime", // covers .mov from iOS
];

type ProcessingStatus = "pending" | "processing" | "uploading" | "complete" | "error";

interface FileWithStatus {
    file: File;
    originalFile: File;
    status: ProcessingStatus;
    progress: number;
    error?: string;
    originalSize?: number;
    compressedSize?: number;
}

export default function GalleryCreate() {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;
    const { showSuccess, showError } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        files: [] as File[],
    });

    const [filesWithStatus, setFilesWithStatus] = useState<FileWithStatus[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const createdPreviewUrls = useRef<string[]>([]);

    const firstFileError = useMemo(() => {
        const match = Object.entries(errors).find(([key]) => key.startsWith("files."));
        return match ? (match[1] as string) : undefined;
    }, [errors]);

    // Helper function to convert image to WebP
    const convertImageToWebP = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            // If it's a video, return as-is
            if (file.type.startsWith("video/")) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Could not get canvas context"));
                        return;
                    }

                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Could not convert image"));
                                return;
                            }

                            const webpFile = new File(
                                [blob],
                                file.name.replace(/\.[^/.]+$/, ".webp"),
                                { type: "image/webp" }
                            );
                            resolve(webpFile);
                        },
                        "image/webp",
                        0.75 // 75% quality to match backend
                    );
                };
                img.onerror = () => reject(new Error("Could not load image"));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error("Could not read file"));
            reader.readAsDataURL(file);
        });
    };

    // Helper function to update file status
    const updateFileStatus = (
        index: number,
        updates: Partial<FileWithStatus>
    ) => {
        setFilesWithStatus((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
        );
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (selectedFiles.length === 0) return;

        if (filesWithStatus.length + selectedFiles.length > MAX_FILES) {
            setFileError(`Maksimal ${MAX_FILES} file yang dapat diunggah.`);
            return;
        }

        setFileError(null);

        // Initialize files with pending status
        const newFilesWithStatus: FileWithStatus[] = selectedFiles.map((file) => ({
            file,
            originalFile: file,
            status: "pending" as ProcessingStatus,
            progress: 0,
            originalSize: file.size,
        }));

        setFilesWithStatus((prev) => [...prev, ...newFilesWithStatus]);

        // Process each file sequentially
        const startIndex = filesWithStatus.length;
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const currentIndex = startIndex + i;

            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                updateFileStatus(currentIndex, {
                    status: "error",
                    error: `Format ${file.name} tidak didukung`,
                });
                continue;
            }

            try {
                // Update to processing status
                updateFileStatus(currentIndex, {
                    status: "processing",
                    progress: 30,
                });

                // Convert to WebP (if image)
                const processedFile = await convertImageToWebP(file);

                updateFileStatus(currentIndex, {
                    file: processedFile,
                    status: "complete",
                    progress: 100,
                    compressedSize: processedFile.size,
                });
            } catch (error) {
                updateFileStatus(currentIndex, {
                    status: "error",
                    error: "Gagal memproses file",
                });
            }
        }

        event.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        setFilesWithStatus((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setFileError(null);

        // Collect all processed files (complete status)
        const processedFiles = filesWithStatus
            .filter((item) => item.status === "complete")
            .map((item) => item.file);

        if (processedFiles.length === 0) {
            setFileError("Tidak ada file yang berhasil diproses");
            return;
        }

        // Update all files to uploading status
        setFilesWithStatus((prev) =>
            prev.map((item) =>
                item.status === "complete"
                    ? { ...item, status: "uploading" as ProcessingStatus, progress: 0 }
                    : item
            )
        );

        // Set the files to upload
        setData("files", processedFiles);

        // Use a small delay to ensure state is updated
        setTimeout(() => {
            post(route("gallery.store", { space: spaceSlug }), {
                forceFormData: true,
                onSuccess: () => {
                    showSuccess("Galeri berhasil diunggah!");
                    createdPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
                    createdPreviewUrls.current = [];
                    setFilesWithStatus([]);
                    reset();
                },
                onError: (errorBag) => {
                    console.error("Gallery upload failed", errorBag);
                    
                    // Show specific error message if available, otherwise generic error
                    const errorMessage = errorBag.files 
                        ? `Upload gagal: ${errorBag.files}` 
                        : "Gagal mengunggah galeri. Silakan periksa kembali input Anda.";
                    
                    showError(errorMessage);
                    
                    // Revert files back to complete status on error
                    setFilesWithStatus((prev) =>
                        prev.map((item) =>
                            item.status === "uploading"
                                ? { ...item, status: "complete" as ProcessingStatus, progress: 100 }
                                : item
                        )
                    );
                },
            });
        }, 100);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("gallery.index", { space: spaceSlug })}
                        className="rounded-lg p-2 transition hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upload Galeri</h1>
                        <p className="text-gray-600">Tambahkan foto atau video ke galeri {spaceTitle}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Upload Galeri - ${spaceTitle}`} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4 sm:px-6 lg:px-8">

                <div className="relative mx-auto max-w-3xl">
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 space-y-8 rounded-3xl border border-emerald-100 bg-white/85 p-8 shadow-lg backdrop-blur-sm md:p-10"
                    >
                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-800">
                                Judul Koleksi (opsional)
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(event) => setData("title", event.target.value)}
                                className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-gray-800 transition focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                                placeholder="Contoh: Foto Liburan"
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-base font-semibold text-gray-800">File (Foto/Video)</label>
                            <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-white/80 p-8 text-center transition hover:border-emerald-400">
                                <Upload className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
                                <p className="mb-4 text-sm text-gray-600">
                                    Tarik dan letakkan file di sini atau pilih manual (maks. {MAX_FILES} file sekaligus)
                                </p>
                                <p className="mb-4 text-xs text-emerald-500">
                                    Semua file yang dipilih sekaligus akan tersimpan sebagai satu koleksi.
                                </p>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    name="files"
                                    multiple
                                    onChange={handleFileChange}
                                    accept="image/*,video/mp4,video/quicktime"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition hover:bg-emerald-600"
                                >
                                    Pilih File
                                </label>
                                {filesWithStatus.length > 0 && (
                                    <p className="mt-4 text-sm text-gray-600">
                                        {filesWithStatus.length} file dipilih
                                    </p>
                                )}
                            </div>
                            {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
                            {errors.files && <p className="text-sm text-red-500 mt-2">{errors.files}</p>}
                            {firstFileError && (
                                <p className="text-sm text-red-500 mt-2">
                                    {firstFileError === "validation.uploaded"
                                        ? "Ukuran salah satu file terlalu besar (maks. 30MB)."
                                        : firstFileError}
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white/75 p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                                Preview & Status
                            </h3>
                            {filesWithStatus.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {filesWithStatus.map((fileItem, index) => {
                                        const previewUrl = URL.createObjectURL(fileItem.originalFile);
                                        const isVideo = fileItem.originalFile.type.startsWith("video/");
                                        
                                        // Format file size
                                        const formatSize = (bytes?: number) => {
                                            if (!bytes) return "—";
                                            return bytes > 1024 * 1024
                                                ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
                                                : `${(bytes / 1024).toFixed(1)} KB`;
                                        };

                                        // Status icon and color
                                        const getStatusDisplay = () => {
                                            switch (fileItem.status) {
                                                case "pending":
                                                    return {
                                                        icon: <Loader2 className="h-4 w-4 text-gray-400" />,
                                                        text: "Menunggu",
                                                        color: "bg-gray-100 text-gray-700",
                                                    };
                                                case "processing":
                                                    return {
                                                        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
                                                        text: "Memproses",
                                                        color: "bg-blue-100 text-blue-700",
                                                    };
                                                case "uploading":
                                                    return {
                                                        icon: <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />,
                                                        text: "Mengunggah",
                                                        color: "bg-emerald-100 text-emerald-700",
                                                    };
                                                case "complete":
                                                    return {
                                                        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                                                        text: "Siap",
                                                        color: "bg-emerald-100 text-emerald-700",
                                                    };
                                                case "error":
                                                    return {
                                                        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                                                        text: "Error",
                                                        color: "bg-red-100 text-red-700",
                                                    };
                                            }
                                        };

                                        const statusDisplay = getStatusDisplay();

                                        return (
                                            <div
                                                key={`${fileItem.originalFile.name}-${index}`}
                                                className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm"
                                            >
                                                {/* Preview Image/Video */}
                                                <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                                                    {isVideo ? (
                                                        <video
                                                            src={previewUrl}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={previewUrl}
                                                            alt={`preview-${index}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                    
                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white transition hover:bg-black"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Hapus
                                                    </button>

                                                    {/* File Number */}
                                                    <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                                                        #{index + 1}
                                                    </span>
                                                </div>

                                                {/* File Info and Status */}
                                                <div className="p-3 space-y-2">
                                                    {/* Status Badge */}
                                                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusDisplay.color}`}>
                                                        {statusDisplay.icon}
                                                        {statusDisplay.text}
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {(fileItem.status === "processing" || fileItem.status === "uploading") && (
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-300"
                                                                style={{ width: `${fileItem.progress}%` }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* File Size Info */}
                                                    {fileItem.status === "complete" && !isVideo && (
                                                        <div className="text-xs text-gray-600">
                                                            <div className="flex items-center justify-between">
                                                                <span>Original:</span>
                                                                <span className="font-medium">{formatSize(fileItem.originalSize)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span>WebP:</span>
                                                                <span className="font-medium text-emerald-600">
                                                                    {formatSize(fileItem.compressedSize)}
                                                                    {fileItem.originalSize && fileItem.compressedSize && (
                                                                        <span className="ml-1 text-emerald-500">
                                                                            (-{Math.round((1 - fileItem.compressedSize / fileItem.originalSize) * 100)}%)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Error Message */}
                                                    {fileItem.status === "error" && fileItem.error && (
                                                        <p className="text-xs text-red-600">{fileItem.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No files selected yet.</p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white/70 p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                                Tips Upload
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Format foto: JPG, JPEG, PNG, GIF (maks. 30MB per file).</li>
                                <li>Format video: MP4 atau MOV (maks. 30MB per file).</li>
                                <li>Berikan judul agar memori mudah ditemukan kembali.</li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                            <Link
                                href={route("gallery.index", { space: spaceSlug })}
                                className="flex-1 rounded-xl border border-gray-300 px-6 py-4 text-center font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    filesWithStatus.length === 0 ||
                                    filesWithStatus.some((f) => f.status === "processing" || f.status === "pending") ||
                                    !filesWithStatus.some((f) => f.status === "complete")
                                }
                                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 font-semibold text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing || filesWithStatus.some((f) => f.status === "uploading")
                                    ? "Mengunggah..."
                                    : filesWithStatus.some((f) => f.status === "processing")
                                    ? "Memproses..."
                                    : "Upload"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
