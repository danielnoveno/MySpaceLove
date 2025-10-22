import { Head } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Video, Link2, Copy } from "lucide-react";

interface Props {
    spaceId: number;
    user: string;
}

/**
 * Legacy Jitsi-based nobar implementation kept for reference.
 * Not wired into any route; import manually if you need to revive it.
 */
export default function LegacyJitsiRoom({ spaceId, user }: Props) {
    const jitsiRef = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);
    const [roomLink, setRoomLink] = useState("");

    useEffect(() => {
        return () => {
            const scriptEl = document.querySelector<HTMLScriptElement>(
                "#jitsi-script"
            );
            if (scriptEl && !document.querySelector("[data-keep-jitsi]")) {
                scriptEl.remove();
            }
        };
    }, []);

    const startNobar = () => {
        setStarted(true);

        if (!document.querySelector("#jitsi-script")) {
            const script = document.createElement("script");
            script.id = "jitsi-script";
            script.src = "https://meet.jit.si/external_api.js";
            script.async = true;
            script.onload = () => initJitsi();
            document.body.appendChild(script);
        } else {
            initJitsi();
        }
    };

    const initJitsi = () => {
        if (!jitsiRef.current) return;

        const domain = "meet.jit.si";
        const roomName = `MySpaceLove-${spaceId}-${Math.floor(
            Math.random() * 9999
        )}`;
        const fullLink = `https://meet.jit.si/${roomName}`;
        setRoomLink(fullLink);

        const options = {
            roomName,
            parentNode: jitsiRef.current,
            width: "100%",
            height: "100%",
            userInfo: { displayName: user },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    "microphone",
                    "camera",
                    "desktop",
                    "fullscreen",
                    "fodeviceselection",
                    "hangup",
                    "chat",
                    "raisehand",
                    "participants-pane",
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_BRAND_WATERMARK: false,
                SHOW_POWERED_BY: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_LOGO_URL: "",
            },
            configOverwrite: {
                prejoinPageEnabled: true,
                disableDeepLinking: true,
            },
        };

        // @ts-ignore: global provided by the injected script.
        const api = new window.JitsiMeetExternalAPI(domain, options);

        const removeJitsiLogos = () => {
            const iframe = api.getIFrame();
            if (!iframe) return;
            const innerDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (!innerDoc) return;

            innerDoc
                .querySelectorAll(
                    ".watermark, .leftwatermark, .rightwatermark, .branding, .branding-link, .poweredby"
                )
                .forEach((element: Element) => element.remove());
        };

        api.addEventListener("videoConferenceJoined", () => {
            const iframe = api.getIFrame();
            if (!iframe) return;
            const innerDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (!innerDoc) return;

            removeJitsiLogos();

            const observer = new MutationObserver(() => {
                removeJitsiLogos();
            });

            observer.observe(innerDoc.body, {
                childList: true,
                subtree: true,
            });
        });
    };

    const copyRoomLink = () => {
        navigator.clipboard.writeText(roomLink);
        alert("Link room telah disalin ke clipboard!");
    };

    return (
        <>
            <Head title={`Nobar Space #${spaceId}`} />
            <div className="relative flex h-screen bg-neutral-900 text-white overflow-hidden">
                <div
                    ref={jitsiRef}
                    className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                        started
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }`}
                />

                {!started && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                        <h1 className="text-2xl font-semibold mb-4">
                            Siap untuk Nobar?
                        </h1>
                        <p className="text-neutral-400 mb-6">
                            Klik tombol di bawah untuk memulai ruang nobar
                            bersama.
                        </p>
                        <button
                            onClick={startNobar}
                            className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl text-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                        >
                            <Video size={22} /> Mulai Nobar
                        </button>
                    </div>
                )}

                {started && roomLink && (
                    <div className="absolute top-4 right-8 flex gap-2 z-30">
                        <button
                            onClick={copyRoomLink}
                            className="bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                        >
                            <Copy size={14} /> Copy Link
                        </button>
                        <a
                            href={roomLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                        >
                            <Link2 size={14} /> Buka di Tab
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}
