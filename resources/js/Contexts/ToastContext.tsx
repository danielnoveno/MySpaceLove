import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import ToastNotification, { Toast, ToastVariant } from "@/Components/ToastNotification";

interface ToastContextType {
    showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, variant: ToastVariant = "info", duration?: number) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
            id,
            message,
            variant,
            duration,
        };
        setToasts((prev) => [...prev, newToast]);
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showToast(message, "success", duration);
    }, [showToast]);

    const showError = useCallback((message: string, duration?: number) => {
        showToast(message, "error", duration);
    }, [showToast]);

    const showInfo = useCallback((message: string, duration?: number) => {
        showToast(message, "info", duration);
    }, [showToast]);

    const showWarning = useCallback((message: string, duration?: number) => {
        showToast(message, "warning", duration);
    }, [showToast]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <ToastNotification toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}
