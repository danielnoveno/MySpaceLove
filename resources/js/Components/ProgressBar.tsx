import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function ProgressBar() {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const handleStart = () => {
            setVisible(true);
            setProgress(0);

            // Simulate incremental progress
            let current = 0;
            interval = setInterval(() => {
                current += Math.random() * 12;
                if (current >= 90) current = 90;
                setProgress(current);
            }, 180);
        };

        const handleFinish = () => {
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 250);
            if (interval) clearInterval(interval);
        };

        const handleCancel = () => {
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 200);
            if (interval) clearInterval(interval);
        };

        router.on("start", handleStart);
        router.on("finish", handleFinish);
        router.on("cancel", handleCancel);
        router.on("error", handleCancel);

        return () => {
            if (interval) clearInterval(interval);
            router.off("start", handleStart);
            router.off("finish", handleFinish);
            router.off("cancel", handleCancel);
            router.off("error", handleCancel);
        };
    }, []);

    if (!visible) return null;

    return (
        <>
            {/* Top progress bar */}
            <div className="fixed top-0 left-0 right-0 z-[200]">
                <div className="h-[3px] bg-pink-100/60">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {progress < 100 && (
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                )}
            </div>

            {/* Centered spinning loader overlay */}
            <div className="fixed inset-0 z-[199] flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg pointer-events-none">
                    {/* Spinning circle */}
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping opacity-40" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-400 animate-spin" />
                        {/* Heart icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-pink-500 animate-pulse"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Loading...</p>
                </div>
            </div>
        </>
    );
}
