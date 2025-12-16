import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link, router } from "@inertiajs/react";
import { ArrowLeft, Eye } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DocFormData, PageProps } from "@/types";

// 🧠 Config untuk react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function DocsEdit() {
    const { doc } = usePage().props as PageProps;
    const [previewVisible, setPreviewVisible] = useState(false);
    const [numPages, setNumPages] = useState<number | null>(null);

    if (!doc) return <div>Dokumen tidak ditemukan.</div>;

    const { data, setData, post, processing } = useForm<DocFormData>({
        title: doc.title || "",
        file: null,
        notes: doc.notes || "",
        _method: "put",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("docs.update", { id: doc.id }), {
            forceFormData: true,
            onSuccess: () => router.visit(route("docs.index")),
        });
    };

    const getFileType = (filePath: string) => {
        const ext = filePath.split(".").pop()?.toLowerCase() || "";
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
        if (["pdf"].includes(ext)) return "pdf";
        if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext))
            return "document";
        if (["mp4", "webm"].includes(ext)) return "video";
        return "other";
    };

    const fileType = getFileType(doc.file_path);
    const fileUrl = `/storage/${doc.file_path}`;

    const renderPreview = () => {
        switch (fileType) {
            case "image":
                return (
                    <img
                        src={fileUrl}
                        alt="Preview"
                        className="w-full h-auto object-contain rounded-lg shadow"
                    />
                );
            case "pdf":
                const publicUrl = `${
                    window.location.origin
                }/storage/${doc.file_path.replace(/^public\//, "")}`;
                console.log("📄 PDF URL:", publicUrl);
                return (
                    <div className="border rounded-xl bg-gray-100 p-4 flex flex-col items-center">
                        <Document
                            file={{ url: publicUrl }}
                            onLoadSuccess={({ numPages }) =>
                                setNumPages(numPages)
                            }
                            loading={<p>Memuat PDF...</p>}
                            onLoadError={(err) =>
                                console.error("❌ Gagal load PDF:", err)
                            }
                        >
                            {Array.from(
                                new Array(numPages || 0),
                                (el, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        width={700}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="shadow-md my-3 rounded-lg"
                                    />
                                )
                            )}
                        </Document>
                    </div>
                );
            case "document":
                return (
                    <iframe
                        src={`https://docs.google.com/gview?url=${window.location.origin}${fileUrl}&embedded=true`}
                        className="w-full h-[600px] border rounded-lg shadow"
                        title="Document Preview"
                    />
                );
            case "video":
                return (
                    <video
                        src={fileUrl}
                        controls
                        className="w-full h-auto rounded-lg shadow"
                    />
                );
            default:
                return (
                    <div className="text-center text-gray-600 py-10">
                        Preview tidak tersedia untuk format ini.
                    </div>
                );
        }
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
                            Edit Dokumen
                        </h1>
                        <p className="text-gray-600">
                            Perbarui informasi atau ganti file
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Document" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-10 px-6">
                <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block font-semibold text-gray-800 mb-2">
                                Judul
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-800 mb-2">
                                Ganti File (opsional)
                            </label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    setData("file", e.target.files?.[0] || null)
                                }
                                className="block w-full border border-gray-300 rounded-2xl p-3 bg-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewVisible(!previewVisible)
                                }
                                className="flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                {previewVisible
                                    ? "Tutup Preview"
                                    : "Lihat File Saat Ini"}
                            </button>

                            {previewVisible && (
                                <div className="mt-4 border rounded-xl overflow-hidden shadow">
                                    {renderPreview()}
                                </div>
                            )}
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
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                {processing
                                    ? "Memperbarui..."
                                    : "Perbarui Dokumen"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
