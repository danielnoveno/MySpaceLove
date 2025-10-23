import { Head, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef } from "react";
import { PageProps } from "@/types";
import axios from "axios";

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

    const processedSchedulesRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const lastSeenSignatures = processedSchedulesRef.current;

        const handleScheduleEvent = async (event: MessageEvent) => {
            if (event.origin && event.origin !== window.location.origin) {
                return;
            }

            const { data } = event;

            if (!data || typeof data !== "object") {
                return;
            }

            if (data.type !== "tuiroom:schedule-created") {
                return;
            }

            const payload = data.payload ?? {};
            const conferenceInfo = payload.conferenceInfo ?? payload;

            if (!conferenceInfo || typeof conferenceInfo !== "object") {
                return;
            }

            const basicRoomInfo = conferenceInfo.basicRoomInfo ?? {};
            const rawRoomId =
                basicRoomInfo.roomId ??
                basicRoomInfo.roomID ??
                conferenceInfo.roomId ??
                conferenceInfo.roomID;

            if (typeof rawRoomId !== "string" || rawRoomId.trim() === "") {
                return;
            }

            const roomId = rawRoomId.trim();

            const normalizeTimestamp = (value: unknown): number | null => {
                if (typeof value === "number" && Number.isFinite(value)) {
                    return Math.round(value);
                }

                if (typeof value === "string" && value.trim() !== "") {
                    const parsed = Number(value);
                    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
                        return Math.round(parsed);
                    }
                }

                return null;
            };

            const scheduleStart = normalizeTimestamp(
                conferenceInfo.scheduleStartTime,
            );
            const scheduleEnd = normalizeTimestamp(
                conferenceInfo.scheduleEndTime,
            );

            if (scheduleStart === null) {
                return;
            }

            const signature = JSON.stringify({
                start: scheduleStart,
                end: scheduleEnd,
            });

            if (lastSeenSignatures.get(roomId) === signature) {
                return;
            }

            lastSeenSignatures.set(roomId, signature);

            const hostUserId =
                basicRoomInfo.ownerId ??
                basicRoomInfo.ownerID ??
                basicRoomInfo.userId ??
                basicRoomInfo.userID ??
                null;

            const attendees = Array.isArray(conferenceInfo.scheduleAttendees)
                ? conferenceInfo.scheduleAttendees
                : [];

            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const requestPayload = {
                room_id: roomId,
                room_name:
                    typeof basicRoomInfo.roomName === "string"
                        ? basicRoomInfo.roomName
                        : null,
                schedule_start_time: scheduleStart,
                schedule_end_time: scheduleEnd,
                host_user_id:
                    typeof hostUserId === "string" ? hostUserId : null,
                attendees,
                timezone,
                raw_payload: conferenceInfo,
            };

            try {
                await axios.post(
                    `/spaces/${spaceSlug}/nobar/schedules`,
                    requestPayload,
                );
            } catch (error) {
                console.error("Failed to persist nobar schedule", error);
            }
        };

        window.addEventListener("message", handleScheduleEvent);

        return () => {
            window.removeEventListener("message", handleScheduleEvent);
        };
    }, [spaceSlug]);

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

        return `${TUIROOMKIT_ENTRY_PATH}?${params.toString()}`;
    }, [
        avatarUrl,
        resolvedUserId,
        resolvedUserName,
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
