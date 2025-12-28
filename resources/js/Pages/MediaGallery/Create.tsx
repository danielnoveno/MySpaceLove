import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

const MAX_FILES = 12;
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime", // covers .mov from iOS
];

export default function GalleryCreate() {
    const currentSpace = useCurrentSpace();

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const spaceTitle = currentSpace.title;
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        files: [] as File[],
    });

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const createdPreviewUrls = useRef<string[]>([]);

    const firstFileError = useMemo(() => {
        const match = Object.entries(errors).find(([key]) => key.startsWith("files."));
        return match ? (match[1] as string) : undefined;
    }, [errors]);

    const syncPreviewState = (files: File[]) => {
        createdPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
        createdPreviewUrls.current = [];

        const urls = files.map((file) => {
            const url = URL.createObjectURL(file);
            createdPreviewUrls.current.push(url);
            return url;
        });

        setPreviewUrls(urls);
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (selectedFiles.length === 0) return;

        if (data.files.length + selectedFiles.length > MAX_FILES) {
            setFileError(`Maksimal ${MAX_FILES} file yang dapat diunggah.`);
            return;
        }

        setFileError(null);
        const processedFiles: File[] = [];

        for (const file of selectedFiles) {
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                setFileError(`Format ${file.name} tidak didukung. Gunakan jpg, jpeg, png, gif, mp4, atau mov.`);
                continue;
            }

            processedFiles.push(file);
        }

        const combined = [...data.files, ...processedFiles];
        setData("files", combined);
        syncPreviewState(combined);
        event.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = [...data.files];
        newFiles.splice(index, 1);
        setData("files", newFiles);
        syncPreviewState(newFiles);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setFileError(null);

        post(route("gallery.store", { space: spaceSlug }), {
            forceFormData: true,
            onSuccess: () => {
                createdPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
                createdPreviewUrls.current = [];
                setPreviewUrls([]);
                reset();
            },
            onError: (errorBag) => {
                console.error("Gallery upload failed", errorBag);
            },
        });
    };

    return (
        <AuthenticatedLayout
            loveCursor={{
                color: "#10b981",
                heartCount: 32,
                className: "opacity-60",
            }}
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
                                {data.files.length > 0 && (
                                    <p className="mt-4 text-sm text-gray-600">
                                        {data.files.length} file dipilih
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
                                Preview
                            </h3>
                            {previewUrls.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {previewUrls.map((url, index) => (
                                        <div
                                            key={`${url}-${index}`}
                                            className="relative overflow-hidden rounded-xl border border-emerald-100 shadow-sm"
                                        >
                                            <img
                                                src={url}
                                                alt={`preview-${index}`}
                                                className="h-40 w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white transition hover:bg-black"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Hapus
                                            </button>
                                            <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500/90 px-2 text-xs font-semibold text-white">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    ))}
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
                                disabled={processing || data.files.length === 0}
                                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 font-semibold text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
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
