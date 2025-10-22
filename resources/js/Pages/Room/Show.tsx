import { Head } from "@inertiajs/react";
import { useMemo } from "react";

interface Props {
    spaceId: number;
    user?: string;
}

const TUIROOMKIT_ENTRY_PATH = "/tuiroomkit/index.html";

// Tencent RTC TUIRoomKit is bundled under `public/tuiroomkit`.
// Update and rebuild `TUIRoomKit/Web/example/vite-vue3-ts` if you need custom branding.
export default function Room({ spaceId }: Props) {
    const iframeSrc = useMemo(() => {
        const params = new URLSearchParams({
            roomId: `space-${spaceId}`,
        });

        return `${TUIROOMKIT_ENTRY_PATH}?${params.toString()}`;
    }, [spaceId]);

    return (
        <>
            <Head title={`Nobar Space #${spaceId}`} />
            <div className="h-screen bg-neutral-900">
                <iframe
                    title="Tencent Nobar Room"
                    src={iframeSrc}
                    className="h-full w-full border-0 bg-neutral-900"
                    allowFullScreen
                    allow="microphone; camera; fullscreen; display-capture; clipboard-read; clipboard-write; speaker"
                />
            </div>
        </>
    );
}

// Legacy Jitsi implementation is available in `resources/js/Pages/Room/LegacyJitsiRoom.tsx`.
