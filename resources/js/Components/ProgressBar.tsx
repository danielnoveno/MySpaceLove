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
    );
}
