import { useState, ChangeEvent } from "react";
import { Plus, Trash2, Upload, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import type { FlipbookPage } from "@/types/memoryLane";

interface FlipbookConfigProps {
    pages: FlipbookPage[];
    onChange: (pages: FlipbookPage[]) => void;
    onImageChange: (pageIndex: number, file: File) => void;
    coverImage?: string | null;
    coverTitle?: string;
    onCoverImageChange?: (file: File) => void;
    onCoverTitleChange?: (title: string) => void;
}

export default function FlipbookConfig({
    pages,
    onChange,
    onImageChange,
    coverImage,
    coverTitle = '',
    onCoverImageChange,
    onCoverTitleChange,
}: FlipbookConfigProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(coverImage || null);

    const handleAddPage = () => {
        const newPage: FlipbookPage = {
            id: `page_${Date.now()}`,
            title: "",
            body: "",
            image: null,
        };
        onChange([...pages, newPage]);
    };

    const handleRemovePage = (index: number) => {
        const updated = pages.filter((_, i) => i !== index);
        onChange(updated);
    };

    const handlePageChange = (index: number, field: keyof FlipbookPage, value: string) => {
        const updated = pages.map((page, i) =>
            i === index ? { ...page, [field]: value } : page
        );
        onChange(updated);
    };

    const handleFileChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageChange(index, file);
        }
    };

    const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onCoverImageChange) {
            onCoverImageChange(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className="space-y-4">
            <header className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">
                        Level 2: Flipbook/Scrapbook
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Tutup
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Customize
                            </>
                        )}
                    </button>
                </div>
                <p className="text-sm text-slate-500">
                    Setelah puzzle level 2, user akan melihat flipbook dengan halaman-halaman kenangan. Tambahkan hingga 10 halaman.
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    <strong>{pages.length}</strong> halaman
                </div>
            </header>

            {isExpanded && (
                <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    {/* Cover Configuration */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                        <h4 className="font-semibold text-slate-900">Cover Flipbook</h4>
                        <p className="text-sm text-slate-500">
                            Atur gambar dan judul cover untuk flipbook Anda.
                        </p>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Gambar Cover
                            </label>
                            {coverImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={coverImagePreview}
                                        alt="Cover Preview"
                                        className="h-48 w-full rounded-lg object-cover"
                                    />
                                    <label
                                        htmlFor="flipbook-cover-image"
                                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/50 opacity-0 transition hover:opacity-100"
                                    >
                                        <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                                            Ganti Gambar Cover
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <label
                                    htmlFor="flipbook-cover-image"
                                    className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100"
                                >
                                    <Upload className="h-8 w-8 text-slate-400" />
                                    <span className="mt-2 text-sm text-slate-600">
                                        Upload gambar cover
                                    </span>
                                </label>
                            )}
                            <input
                                id="flipbook-cover-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverImageChange}
                            />
                        </div>

                        {/* Cover Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Judul Cover
                            </label>
                            <input
                                type="text"
                                value={coverTitle}
                                onChange={(e) => onCoverTitleChange?.(e.target.value)}
                                placeholder="Contoh: Kenangan Kita"
                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                maxLength={200}
                            />
                        </div>
                    </div>

                    {/* Pages Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900">Halaman Flipbook</h4>
                        <button
                            type="button"
                            onClick={handleAddPage}
                            disabled={pages.length >= 10}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Halaman
                        </button>

                    {pages.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <p className="mt-2 text-sm text-slate-600">
                                Belum ada halaman. Klik "Tambah Halaman" untuk memulai.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {pages.map((page, index) => (
                            <div
                                key={page.id}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-900">
                                        Halaman {index + 1}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePage(index)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hapus
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">
                                            Gambar
                                        </label>
                                        <div className="mt-2">
                                            {(page.image || page.image_file) ? (
                                                <div className="relative">
                                                    <img
                                                        src={page.image_file ? URL.createObjectURL(page.image_file) : page.image || ''}
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-48 w-full rounded-lg object-cover"
                                                    />
                                                    <label
                                                        htmlFor={`flipbook-image-${index}`}
                                                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/50 opacity-0 transition hover:opacity-100"
                                                    >
                                                        <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                                                            Ganti Gambar
                                                        </span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor={`flipbook-image-${index}`}
                                                    className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100"
                                                >
                                                    <Upload className="h-8 w-8 text-slate-400" />
                                                    <span className="mt-2 text-sm text-slate-600">
                                                        Upload gambar
                                                    </span>
                                                </label>
                                            )}
                                            <input
                                                id={`flipbook-image-${index}`}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(index, e)}
                                            />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">
                                            Judul
                                        </label>
                                        <input
                                            type="text"
                                            value={page.title}
                                            onChange={(e) =>
                                                handlePageChange(index, "title", e.target.value)
                                            }
                                            placeholder="Contoh: Kenangan Pertama Kita"
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                            maxLength={200}
                                        />
                                    </div>

                                    {/* Body */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">
                                            Cerita
                                        </label>
                                        <textarea
                                            value={page.body}
                                            onChange={(e) =>
                                                handlePageChange(index, "body", e.target.value)
                                            }
                                            placeholder="Tulis cerita atau kenangan manis di sini..."
                                            className="mt-1 min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                            maxLength={2000}
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            {page.body.length} / 2000 karakter
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
            )}
        </section>
    );
}
