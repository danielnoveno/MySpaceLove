import { Head, usePage } from "@inertiajs/react";
import { useMemo } from "react";
import { PageProps } from "@/types";

interface Props {
    spaceId: number;
}

const TUIROOMKIT_ENTRY_PATH = "/tuiroomkit/index.html";

// Tencent RTC TUIRoomKit is bundled under `public/tuiroomkit`.
// Update and rebuild `TUIRoomKit/Web/example/vite-vue3-ts` if you need custom branding.
export default function Room({ spaceId }: Props) {
    const { props } = usePage<PageProps>();
    const currentUser = props.auth?.user;
    const currentSpace = props.currentSpace;

    const spaceSlug = currentSpace?.slug ?? `space-${spaceId}`;
    const spaceTitle = currentSpace?.title ?? `Space #${spaceId}`;

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

    const schedulingEnabled = false;

    const iframeSrc = useMemo(() => {
        const params = new URLSearchParams({
            roomId: `space-${spaceId}`,
            userId: resolvedUserId,
            userName: resolvedUserName,
            lang: "id-ID",
            spaceSlug,
            spaceTitle,
            dashboardUrl: `/spaces/${spaceSlug}/dashboard`,
        });

        if (avatarUrl) {
            params.set("avatarUrl", avatarUrl);
        }

        params.set("enableScheduling", schedulingEnabled ? "1" : "0");

        return `${TUIROOMKIT_ENTRY_PATH}?${params.toString()}`;
    }, [
        avatarUrl,
        resolvedUserId,
        resolvedUserName,
        schedulingEnabled,
        spaceId,
        spaceSlug,
        spaceTitle,
    ]);

    return (
        <>
            <Head title={`Nobar ${spaceTitle}`} />
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
