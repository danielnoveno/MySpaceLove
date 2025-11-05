import { ReactNode, useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
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
    anchor?: {
        top: number;
        left: number;
        width: number;
        height: number;
    } | null;
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

const anchorToneClasses: Record<
    NonNullable<ConfirmDialogProps["tone"]>,
    {
        border: string;
        badge: string;
    }
> = {
    danger: {
        border: "border-rose-200 shadow-rose-200/40",
        badge: "text-rose-500",
    },
    primary: {
        border: "border-indigo-200 shadow-indigo-200/40",
        badge: "text-indigo-500",
    },
    neutral: {
        border: "border-slate-200 shadow-slate-200/40",
        badge: "text-slate-500",
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
    anchor = null,
}: ConfirmDialogProps) {
    const colors = toneClasses[tone];
    const anchorColors = anchorToneClasses[tone];
    const anchorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open || !anchor) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onCancel();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open, anchor, onCancel]);

    const anchorPosition = useMemo(() => {
        if (!anchor) {
            return null;
        }

        const scrollX = window.scrollX ?? 0;
        const scrollY = window.scrollY ?? 0;

        return {
            top: anchor.top + scrollY,
            left: anchor.left + scrollX + anchor.width / 2,
        };
    }, [anchor]);

    if (!open) {
        return null;
    }

    if (anchor && anchorPosition) {
        return createPortal(
            <div className="pointer-events-none fixed inset-0 z-[80]">
                <div
                    ref={anchorRef}
                    className="pointer-events-auto absolute z-[95] max-w-xs"
                    style={{
                        top: anchorPosition.top,
                        left: anchorPosition.left,
                        transform: "translate(-50%, calc(-100% - 16px))",
                    }}
                >
                    <div
                        className={`overflow-hidden rounded-2xl border bg-white p-4 shadow-xl ${anchorColors.border}`}
                    >
                        <p
                            className={`text-[0.65rem] font-semibold uppercase tracking-[0.38em] ${anchorColors.badge}`}
                        >
                            Konfirmasi
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">
                            {title}
                        </h3>
                        {description && (
                            <p className="mt-1 text-sm text-slate-600">
                                {description}
                            </p>
                        )}
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow transition focus-visible:outline-none focus-visible:ring-2 ${colors.confirm} ${colors.confirmRing} disabled:cursor-not-allowed disabled:opacity-70`}
                            >
                                {loading && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body,
        );
    }

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
