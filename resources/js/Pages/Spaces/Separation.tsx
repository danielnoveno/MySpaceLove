import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, HeartCrack, XCircle } from "lucide-react";

type SpaceSummary = {
    id: number;
    slug: string;
    title: string;
    has_partner: boolean;
    partner: {
        id: number;
        name: string;
        email: string;
        profile_photo_url?: string | null;
    } | null;
};

type PendingSeparation = {
    id: number;
    status: "pending" | "approved" | "rejected" | "cancelled";
    initiated_by_you: boolean;
    requires_your_confirmation: boolean;
    created_at: string | null;
    initiator: { id: number; name: string } | null;
    partner: { id: number; name: string } | null;
    reason: {
        initiator: string | null;
        partner: string | null;
    };
};

interface Props {
    space: SpaceSummary;
    pendingSeparation: PendingSeparation | null;
    separationConfirmationPhrase: string;
}

export default function SpaceSeparation({
    space,
    pendingSeparation,
    separationConfirmationPhrase,
}: Props) {
    const [phrase, setPhrase] = useState("");
    const [reason, setReason] = useState("");
    const [respondPhrase, setRespondPhrase] = useState("");
    const [respondReason, setRespondReason] = useState("");
    const [busy, setBusy] = useState<string | null>(null);
    const [alert, setAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const canStartRequest = space.has_partner && !pendingSeparation;
    const canCancel = pendingSeparation?.initiated_by_you && pendingSeparation.status === "pending";
    const canRespond = pendingSeparation?.requires_your_confirmation;

    const normalizedPhrase = useMemo(
        () => separationConfirmationPhrase.trim().toUpperCase(),
        [separationConfirmationPhrase]
    );

    const validatePhrase = (value: string) =>
        value.trim().toUpperCase() === normalizedPhrase;

    const submitRequest = async (event: FormEvent) => {
        event.preventDefault();
        setAlert(null);

        if (!validatePhrase(phrase)) {
            setAlert({
                type: "error",
                message: `Ketik frasa konfirmasi persis: ${separationConfirmationPhrase}`,
            });
            return;
        }

        setBusy("request");
        try {
            await axios.post(route("api.spaces.separation.request", { space: space.slug }), {
                confirmation_phrase: phrase,
                reason,
            });
            setAlert({ type: "success", message: "Permintaan separation dikirim." });
            router.reload({ only: ["pendingSeparation"] });
        } catch (error: any) {
            setAlert({
                type: "error",
                message: error?.response?.data?.message ?? "Gagal mengirim permintaan separation.",
            });
        } finally {
            setBusy(null);
        }
    };

    const respond = async (decision: "approve" | "reject") => {
        setAlert(null);

        if (!validatePhrase(respondPhrase)) {
            setAlert({
                type: "error",
                message: `Ketik frasa konfirmasi persis: ${separationConfirmationPhrase}`,
            });
            return;
        }

        setBusy(decision);
        try {
            await axios.post(route("api.spaces.separation.respond", { space: space.slug }), {
                decision,
                confirmation_phrase: respondPhrase,
                reason: respondReason,
            });
            setAlert({
                type: "success",
                message: decision === "approve" ? "Separation disetujui." : "Separation ditolak.",
            });
            router.reload({ only: ["pendingSeparation", "space"] });
        } catch (error: any) {
            setAlert({
                type: "error",
                message: error?.response?.data?.message ?? "Gagal memproses separation.",
            });
        } finally {
            setBusy(null);
        }
    };

    const cancel = async () => {
        setAlert(null);
        setBusy("cancel");
        try {
            await axios.post(route("api.spaces.separation.cancel", { space: space.slug }));
            setAlert({ type: "success", message: "Permintaan separation dibatalkan." });
            router.reload({ only: ["pendingSeparation"] });
        } catch (error: any) {
            setAlert({
                type: "error",
                message: error?.response?.data?.message ?? "Gagal membatalkan separation.",
            });
        } finally {
            setBusy(null);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Separation - ${space.title}`} />

            <div className="w-full max-w-none px-0 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route("spaces.index")}
                            className="text-sm font-semibold text-pink-500 hover:text-pink-600"
                        >
                            ← Back to Spaces
                        </Link>
                        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
                            Separation Center
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Kelola status hubungan untuk space <strong>{space.title}</strong> dengan hati-hati.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 text-sm text-gray-600 shadow-sm">
                        Confirmation phrase: <span className="font-bold text-rose-600">{separationConfirmationPhrase}</span>
                    </div>
                </div>

                {alert && (
                    <div
                        className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                            alert.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {alert.message}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
                    <section className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                                <HeartCrack className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Current status</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {space.partner
                                        ? `Partner: ${space.partner.name}`
                                        : "Space ini belum memiliki partner."}
                                </p>
                            </div>
                        </div>

                        {pendingSeparation ? (
                            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                <div className="font-semibold">Ada permintaan separation aktif.</div>
                                <div className="mt-2 space-y-1">
                                    <p>Status: {pendingSeparation.status}</p>
                                    <p>Diajukan oleh: {pendingSeparation.initiator?.name ?? "-"}</p>
                                    {pendingSeparation.reason.initiator && (
                                        <p>Alasan: {pendingSeparation.reason.initiator}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                Tidak ada permintaan separation aktif.
                            </div>
                        )}
                    </section>

                    <section className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm">
                        {!space.has_partner && (
                            <div className="flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                Separation hanya tersedia setelah space memiliki partner.
                            </div>
                        )}

                        {canStartRequest && (
                            <form onSubmit={submitRequest} className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900">Request separation</h2>
                                <p className="text-sm text-gray-600">
                                    Aksi ini akan meminta konfirmasi partner. Ketik frasa konfirmasi untuk melanjutkan.
                                </p>
                                <textarea
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    placeholder="Alasan opsional..."
                                    className="min-h-28 w-full rounded-2xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                                />
                                <input
                                    value={phrase}
                                    onChange={(event) => setPhrase(event.target.value)}
                                    placeholder={separationConfirmationPhrase}
                                    className="w-full rounded-2xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                                />
                                <button
                                    type="submit"
                                    disabled={busy === "request"}
                                    className="inline-flex items-center rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 disabled:opacity-60"
                                >
                                    {busy === "request" ? "Mengirim..." : "Request separation"}
                                </button>
                            </form>
                        )}

                        {canRespond && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900">Partner requested separation</h2>
                                <p className="text-sm text-gray-600">
                                    Kamu bisa menyetujui atau menolak permintaan ini.
                                </p>
                                <textarea
                                    value={respondReason}
                                    onChange={(event) => setRespondReason(event.target.value)}
                                    placeholder="Catatan opsional..."
                                    className="min-h-28 w-full rounded-2xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                                />
                                <input
                                    value={respondPhrase}
                                    onChange={(event) => setRespondPhrase(event.target.value)}
                                    placeholder={separationConfirmationPhrase}
                                    className="w-full rounded-2xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => respond("approve")}
                                        disabled={busy === "approve"}
                                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-60"
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => respond("reject")}
                                        disabled={busy === "reject"}
                                        className="inline-flex items-center gap-2 rounded-full bg-gray-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
                                    >
                                        <XCircle className="h-4 w-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        )}

                        {canCancel && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900">Waiting for partner</h2>
                                <p className="text-sm text-gray-600">
                                    Permintaan separation kamu masih menunggu respons partner.
                                </p>
                                <button
                                    type="button"
                                    onClick={cancel}
                                    disabled={busy === "cancel"}
                                    className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                                >
                                    {busy === "cancel" ? "Membatalkan..." : "Cancel request"}
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
