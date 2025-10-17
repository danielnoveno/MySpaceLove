// import { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import DailyIframe, { DailyCall } from "@daily-co/daily-js";
// import { Head } from "@inertiajs/react";
// import {
//     Loader2,
//     Mic,
//     MicOff,
//     Video,
//     VideoOff,
//     Monitor,
//     X,
// } from "lucide-react";

// interface Props {
//     spaceId: number;
// }

// export default function Room({ spaceId }: Props) {
//     const callRef = useRef<DailyCall | null>(null);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const [roomUrl, setRoomUrl] = useState<string | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [joined, setJoined] = useState(false);
//     const [micOn, setMicOn] = useState(true);
//     const [camOn, setCamOn] = useState(true);

//     // 🔹 Buat room di backend Laravel
//     useEffect(() => {
//         const createRoom = async () => {
//             try {
//                 console.log("🟢 Membuat room Daily...");
//                 const res = await axios.post("/api/daily/create-room");
//                 console.log("✅ Respon Daily:", res.data);
//                 setRoomUrl(res.data.url);
//             } catch (err: any) {
//                 console.error(
//                     "❌ Gagal membuat room:",
//                     err.response?.data || err.message
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };
//         createRoom();
//     }, [spaceId]);

//     // 🔹 Join ke room
//     const joinRoom = async () => {
//         console.log("➡️ Join Room dipanggil. roomUrl:", roomUrl);
//         if (!roomUrl) {
//             alert("URL room belum tersedia, coba lagi nanti!");
//             return;
//         }
//         if (!containerRef.current) {
//             alert("Container video belum siap!");
//             return;
//         }

//         try {
//             const call = DailyIframe.createFrame(containerRef.current, {
//                 iframeStyle: {
//                     position: "absolute",
//                     width: "100%",
//                     height: "100%",
//                     border: "0",
//                 },
//                 showLeaveButton: false,
//             });

//             await call.join({ url: roomUrl });
//             callRef.current = call;
//             setJoined(true);
//             console.log("✅ Berhasil join room!");

//             call.on("left-meeting", () => {
//                 call.destroy();
//                 setJoined(false);
//             });
//         } catch (error) {
//             console.error("❌ Gagal join room:", error);
//             alert("Gagal join room. Cek console log untuk detail.");
//         }
//     };

//     // 🔹 Leave Room
//     const leaveRoom = () => {
//         console.log("🚪 Keluar dari room");
//         callRef.current?.leave();
//     };

//     // 🔹 Toggle mic
//     const toggleMic = () => {
//         const newMic = !micOn;
//         setMicOn(newMic);
//         callRef.current?.setLocalAudio(newMic);
//     };

//     // 🔹 Toggle camera
//     const toggleCam = () => {
//         const newCam = !camOn;
//         setCamOn(newCam);
//         callRef.current?.setLocalVideo(newCam);
//     };

//     // 🔹 Toggle screenshare
//     const toggleScreenShare = async () => {
//         if (!callRef.current) return;
//         const local = callRef.current.participants().local;
//         if (local?.screen) {
//             await callRef.current.stopScreenShare();
//         } else {
//             await callRef.current.startScreenShare();
//         }
//     };

//     return (
//         <>
//             <Head title="Nobar Space" />
//             <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white relative">
//                 {loading ? (
//                     <div className="flex flex-col items-center gap-3">
//                         <Loader2 className="w-8 h-8 animate-spin text-white" />
//                         <p>Mempersiapkan ruangan nobar...</p>
//                     </div>
//                 ) : (
//                     <>
//                         {!joined && (
//                             <div className="text-center space-y-4">
//                                 <h1 className="text-2xl font-semibold">
//                                     🎬 Ruangan Nobar
//                                 </h1>
//                                 <p className="text-neutral-400">
//                                     Klik tombol di bawah untuk mulai nobar
//                                     bersama!
//                                 </p>
//                                 <button
//                                     onClick={joinRoom}
//                                     disabled={!roomUrl}
//                                     className={`px-6 py-3 rounded-full font-medium transition ${
//                                         roomUrl
//                                             ? "bg-emerald-500 hover:bg-emerald-600"
//                                             : "bg-gray-500 cursor-not-allowed"
//                                     }`}
//                                 >
//                                     Mulai Nobar
//                                 </button>
//                             </div>
//                         )}

//                         {joined && (
//                             <div className="relative w-full h-screen flex flex-col">
//                                 <div
//                                     ref={containerRef}
//                                     className="flex-grow"
//                                 ></div>

//                                 {/* Control bar */}
//                                 <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 flex justify-center gap-4 backdrop-blur-md">
//                                     <button
//                                         onClick={toggleMic}
//                                         className={`p-3 rounded-full ${
//                                             micOn
//                                                 ? "bg-emerald-600"
//                                                 : "bg-red-600"
//                                         }`}
//                                     >
//                                         {micOn ? (
//                                             <Mic className="w-5 h-5" />
//                                         ) : (
//                                             <MicOff className="w-5 h-5" />
//                                         )}
//                                     </button>

//                                     <button
//                                         onClick={toggleCam}
//                                         className={`p-3 rounded-full ${
//                                             camOn
//                                                 ? "bg-emerald-600"
//                                                 : "bg-red-600"
//                                         }`}
//                                     >
//                                         {camOn ? (
//                                             <Video className="w-5 h-5" />
//                                         ) : (
//                                             <VideoOff className="w-5 h-5" />
//                                         )}
//                                     </button>

//                                     <button
//                                         onClick={toggleScreenShare}
//                                         className="p-3 rounded-full bg-blue-600"
//                                     >
//                                         <Monitor className="w-5 h-5" />
//                                     </button>

//                                     <button
//                                         onClick={leaveRoom}
//                                         className="p-3 rounded-full bg-red-700"
//                                     >
//                                         <X className="w-5 h-5" />
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>
//         </>
//     );
// }

// import { useEffect, useRef, useState } from "react";
// import { Head } from "@inertiajs/react";
// import { Loader2 } from "lucide-react";

// interface Props {
//     spaceId: number;
//     spaceName?: string;
// }

// export default function Room({ spaceId, spaceName }: Props) {
//     const containerRef = useRef<HTMLDivElement>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // Load Jitsi script
//         const script = document.createElement("script");
//         script.src = "https://meet.jit.si/external_api.js";
//         script.async = true;
//         script.onload = () => {
//             initJitsi();
//         };
//         document.body.appendChild(script);

//         return () => {
//             if (containerRef.current) containerRef.current.innerHTML = "";
//         };
//     }, []);

//     const initJitsi = () => {
//         if (!containerRef.current) return;

//         // Inisialisasi room unik berdasarkan ID space
//         const domain = "meet.jit.si";
//         const options = {
//             roomName: `MySpaceLove-${spaceId}`,
//             width: "100%",
//             height: "100%",
//             parentNode: containerRef.current,
//             interfaceConfigOverwrite: {
//                 filmStripOnly: false,
//                 SHOW_CHROME_EXTENSION_BANNER: false,
//             },
//             configOverwrite: {
//                 disableSimulcast: false,
//             },
//             userInfo: {
//                 displayName: localStorage.getItem("userName") || "Guest",
//             },
//         };

//         // @ts-ignore
//         const api = new window.JitsiMeetExternalAPI(domain, options);

//         api.addEventListener("videoConferenceJoined", () => {
//             setLoading(false);
//         });
//     };

//     return (
//         <>
//             <Head title={`Nobar Space #${spaceId}`} />
//             <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
//                 {loading && (
//                     <div className="flex flex-col items-center justify-center gap-2">
//                         <Loader2 className="animate-spin" />
//                         <p>Menghubungkan ke ruang nobar...</p>
//                     </div>
//                 )}

//                 <div
//                     ref={containerRef}
//                     className="w-full h-full transition-all duration-300"
//                 />
//             </div>
//         </>
//     );
// }

import { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import { Video, Link2, Copy } from "lucide-react";

interface Props {
    spaceId: number;
    user: string;
}

export default function Room({ spaceId, user }: Props) {
    const jitsiRef = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);
    const [roomLink, setRoomLink] = useState("");

    // 🔹 Fungsi Mulai Nobar
    const startNobar = () => {
        setStarted(true);

        // Muat script Jitsi jika belum ada
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

    // 🔹 Inisialisasi Jitsi
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

        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI(domain, options);

        // ✅ Fungsi penghapus logo + observer otomatis
        const removeJitsiLogos = () => {
            const iframe = api.getIFrame();
            if (!iframe) return;
            const innerDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (!innerDoc) return;

            // hapus logo & watermark
            innerDoc
                .querySelectorAll(
                    ".watermark, .leftwatermark, .rightwatermark, .branding, .branding-link, .poweredby"
                )
                .forEach((el: Element) => el.remove());
        };

        api.addEventListener("videoConferenceJoined", () => {
            console.log("✅ Masuk ke ruang nobar, memulai hapus watermark...");

            const iframe = api.getIFrame();
            if (!iframe) return;
            const innerDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (!innerDoc) return;

            // 🔹 Jalankan pertama kali
            removeJitsiLogos();

            // 🔹 Pantau perubahan DOM dalam iframe
            const observer = new MutationObserver(() => {
                removeJitsiLogos();
            });

            observer.observe(innerDoc.body, {
                childList: true,
                subtree: true,
            });

            console.log("🧹 Watermark cleaner aktif ✅");
        });
    };


    // 🔹 Salin link room
    const copyRoomLink = () => {
        navigator.clipboard.writeText(roomLink);
        alert("🔗 Link room telah disalin ke clipboard!");
    };

    return (
        <>
            <Head title={`Nobar Space #${spaceId}`} />
            <div className="relative flex h-screen bg-neutral-900 text-white overflow-hidden">
                {/* 🎥 Area Video Call */}
                <div
                    ref={jitsiRef}
                    className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                        started
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }`}
                />

                {/* 🟢 Tombol Mulai di Tengah */}
                {!started && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                        <h1 className="text-2xl font-semibold mb-4">
                            🎬 Siap untuk Nobar?
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

                {/* 🔗 Tombol Copy & Buka Link */}
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
