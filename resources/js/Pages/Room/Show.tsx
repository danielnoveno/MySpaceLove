import { Head, usePage } from "@inertiajs/react";
import { useMemo } from "react";

interface Props {
    spaceId: number;
}

interface InertiaPageProps {
    auth?: {
        user?: {
            id?: number | string;
            name?: string | null;
            email?: string | null;
            profile_photo_url?: string | null;
        };
    };
}

const TUIROOMKIT_ENTRY_PATH = "/tuiroomkit/index.html";

// Tencent RTC TUIRoomKit is bundled under `public/tuiroomkit`.
// Update and rebuild `TUIRoomKit/Web/example/vite-vue3-ts` if you need custom branding.
export default function Room({ spaceId }: Props) {
    const { props } = usePage<InertiaPageProps>();
    const currentUser = props.auth?.user;

    const resolvedUserId = currentUser?.id
        ? `user-${String(currentUser.id)}`
        : `guest-${spaceId}`;
    const resolvedUserName = (() => {
        const baseName = currentUser?.name ?? currentUser?.email ?? "Guest";
        const trimmed = String(baseName).trim();

        if (trimmed.length > 0) {
            return trimmed;
        }

        return `Guest ${spaceId}`;
    })();

    const avatarUrl = currentUser?.profile_photo_url
        ? String(currentUser.profile_photo_url)
        : undefined;

    const iframeSrc = useMemo(() => {
        const params = new URLSearchParams({
            roomId: `space-${spaceId}`,
            userId: resolvedUserId,
            userName: resolvedUserName,
        });

        if (avatarUrl) {
            params.set("avatarUrl", avatarUrl);
        }

        return `${TUIROOMKIT_ENTRY_PATH}?${params.toString()}`;
    }, [avatarUrl, resolvedUserId, resolvedUserName, spaceId]);

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
