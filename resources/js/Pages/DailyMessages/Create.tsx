import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";

interface Props {
    spaceId: string;
}

// Helper untuk ambil cookie CSRF token
function getCookie(name: string) {
    const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
    );
    if (match) return match[2];
    return null;
}

export default function DailyMessageCreate({ spaceId }: Props) {
    // Ambil tanggal hari ini (format YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    const { data, setData, post, errors, processing } = useForm({
        date: today, // default hari ini
        message: "",
    });

    const [loadingAI, setLoadingAI] = useState(false);

    // Setup default CSRF token axios
    useEffect(() => {
        const token = getCookie("XSRF-TOKEN");
        if (token) {
            axios.defaults.headers.common["X-XSRF-TOKEN"] = token;
        }
    }, []);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!data.date) {
            alert("Tanggal harus dipilih!");
            return;
        }

        post(route("daily.store", { spaceId }));
    }

    async function generateAI() {
        if (!data.date) {
            alert("Pilih tanggal terlebih dahulu!");
            return;
        }

        setLoadingAI(true);
        try {
            const resp = await axios.post(
                `/daily-messages/${spaceId}/regenerate`,
                { date: data.date },
                { headers: { "Content-Type": "application/json" } }
            );

            const aiMessage = resp.data.message?.message;
            if (aiMessage) {
                setData("message", aiMessage);
            } else {
                alert("AI tidak mengembalikan pesan.");
            }
        } catch (error: any) {
            console.error("Generate AI error:", error.response ?? error);
            const errMsg =
                error.response?.data?.error ||
                "Gagal generate AI, silakan coba lagi.";
            alert(errMsg);
        } finally {
            setLoadingAI(false);
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Tambah Pesan Harian Manual
                </h2>
            }
        >
            <Head title="Tambah Pesan Harian" />

            <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-6 mt-8">
                <form onSubmit={submit}>
                    <div>
                        <label className="block text-gray-700 font-medium">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData("date", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 transition"
                        />
                        {errors.date && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.date}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium">
                            Pesan
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 transition"
                            rows={4}
                        />
                        {errors.message && (
                            <p className="mt-1 text-red-500 text-sm">
                                {errors.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            type="button"
                            onClick={generateAI}
                            disabled={loadingAI}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
                        >
                            {loadingAI ? "Menghasilkan AI..." : "Generate AI"}
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
                        >
                            Simpan Pesan
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
