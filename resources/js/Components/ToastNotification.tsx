import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
}

interface ToastNotificationProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const variantStyles = {
    success: {
        bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
        border: "border-emerald-200",
        text: "text-emerald-800",
        icon: CheckCircle2,
        iconColor: "text-emerald-500",
    },
    error: {
        bg: "bg-gradient-to-r from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: XCircle,
        iconColor: "text-red-500",
    },
    info: {
        bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: Info,
        iconColor: "text-blue-500",
    },
    warning: {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: AlertTriangle,
        iconColor: "text-amber-500",
    },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const styles = variantStyles[toast.variant];
    const Icon = styles.icon;

    useEffect(() => {
        const duration = toast.duration || 5000;
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`flex items-start gap-3 rounded-2xl border ${styles.border} ${styles.bg} px-4 py-3 shadow-lg backdrop-blur-sm min-w-[320px] max-w-md`}
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${styles.iconColor} mt-0.5`} />
            <p className={`flex-1 text-sm font-medium ${styles.text}`}>{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className={`flex-shrink-0 rounded-lg p-1 transition hover:bg-white/50 ${styles.text}`}
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
    return (
        <div className="pointer-events-none fixed right-4 top-20 z-[200] flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={onDismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
