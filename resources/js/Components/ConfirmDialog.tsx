import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "danger" | "primary" | "neutral";
    icon?: ReactNode;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const toneClasses: Record<
    NonNullable<ConfirmDialogProps["tone"]>,
    {
        badge: string;
        confirm: string;
        confirmRing: string;
        iconWrap: string;
    }
> = {
    danger: {
        badge: "bg-rose-100 text-rose-600",
        confirm:
            "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 focus-visible:ring-rose-400",
        confirmRing: "ring-rose-200",
        iconWrap: "bg-rose-50 text-rose-500",
    },
    primary: {
        badge: "bg-indigo-100 text-indigo-600",
        confirm:
            "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus-visible:ring-indigo-400",
        confirmRing: "ring-indigo-200",
        iconWrap: "bg-indigo-50 text-indigo-500",
    },
    neutral: {
        badge: "bg-slate-100 text-slate-600",
        confirm:
            "bg-slate-800 hover:bg-slate-900 focus-visible:ring-slate-400",
        confirmRing: "ring-slate-200",
        iconWrap: "bg-slate-50 text-slate-500",
    },
};

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Ya, lanjutkan",
    cancelLabel = "Batal",
    tone = "danger",
    icon,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const colors = toneClasses[tone];

    return (
        <Modal show={open} maxWidth="sm" onClose={onCancel}>
            <div className="relative overflow-hidden bg-white">
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-white via-transparent to-transparent opacity-90 pointer-events-none" />
                <div className="space-y-6 p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-inner ${colors.iconWrap}`}
                        >
                            {icon ?? (
                                <span className="text-lg font-semibold">!</span>
                            )}
                        </div>
                        <div>
                            <p
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
                            >
                                Konfirmasi tindakan
                            </p>
                            <h3 className="mt-3 text-lg font-semibold text-slate-900">
                                {title}
                            </h3>
                            {description && (
                                <p className="mt-2 text-sm text-slate-600">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition focus-visible:outline-none focus-visible:ring-2 ${colors.confirm} ${colors.confirmRing} disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
