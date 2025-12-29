import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { useEffect, useRef, useState } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { useTranslation } from "@/hooks/useTranslation";
import axios from "axios";
import { Loader2, Sparkles, X } from "lucide-react";

const ExpandableText = ({
    text,
    wordLimit,
    expandMoreLabel,
    expandLessLabel,
}: {
    text: string;
    wordLimit: number;
    expandMoreLabel: string;
    expandLessLabel: string;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const words = text.split(" ");
    const isTruncated = words.length > wordLimit;

    const displayText = isExpanded
        ? text
        : words.slice(0, wordLimit).join(" ") + (isTruncated ? "..." : "");

    return (
        <div>
            <p
                className={`mt-2 text-gray-700 text-justify ${
                    isExpanded ? "" : "max-h-24 overflow-hidden"
                }`}
                dangerouslySetInnerHTML={{ __html: displayText }}
            ></p>
            {isTruncated && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-pink-600 hover:text-pink-800 text-sm mt-2"
                >
                    {isExpanded ? expandLessLabel : expandMoreLabel}
                </button>
            )}
        </div>
    );
};

export default function DailyMessageIndex({
    messages,
    filters,
}: {
    messages: any[];
    filters: {
        search?: string;
        date?: string;
    };
}) {
    const currentSpace = useCurrentSpace();
    const { translations: dailyStrings } =
        useTranslation<{
            meta?: { title?: string };
            header?: string;
            title?: string;
            actions?: {
                search?: string;
                add_manual?: string;
                send_email?: string;
            };
            empty?: string;
            modal?: {
                title?: string;
                keyword?: string;
                date?: string;
            };
            expand?: {
                more?: string;
                less?: string;
            };
            feedback?: {
                email_sent?: string;
                email_failed?: string;
                email_partner_missing?: string;
                email_sending?: string;
            };
        }>("daily_messages");
    const { t: tCommon } = useTranslation("common");

    if (!currentSpace) {
        return null;
    }

    const spaceSlug = currentSpace.slug;
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState(
        filters.search || ""
    );
    const [searchDate, setSearchDate] = useState(
        filters.date || ""
    );
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    const [loadingOverlay, setLoadingOverlay] = useState<{
        title: string;
        description?: string;
    } | null>(null);
    const [feedbackBanner, setFeedbackBanner] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const feedbackTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current) {
                window.clearTimeout(feedbackTimeoutRef.current);
                feedbackTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!feedbackBanner) {
            return;
        }

        if (feedbackTimeoutRef.current) {
            window.clearTimeout(feedbackTimeoutRef.current);
        }

        feedbackTimeoutRef.current = window.setTimeout(() => {
            setFeedbackBanner(null);
            feedbackTimeoutRef.current = null;
        }, 6000);
    }, [feedbackBanner]);

    const handleSendEmail = async (message: DailyMessage) => {
        if (sendingEmailId !== null) {
            return;
        }

        const messageId = String(message.id);
        setSendingEmailId(messageId);
        setLoadingOverlay({
            title:
                dailyStrings.feedback?.email_sending ??
                "Mengirim daily message ke email pasangan...",
            description:
                "Tunggu sebentar, kami sedang mengirim pesan manisnya kepada pasanganmu.",
        });

        try {
            const response = await axios.post(
                route("daily.email", { space: spaceSlug, id: message.id }),
            );

            const successMessage =
                response.data?.message ??
                dailyStrings.feedback?.email_sent ??
                "Daily message berhasil dikirim ke email pasangan!";

            setFeedbackBanner({
                type: "success",
                message: successMessage,
            });
        } catch (error) {
            let fallbackMessage =
                dailyStrings.feedback?.email_failed ??
                "Gagal mengirim email. Coba lagi nanti, ya.";

            if (axios.isAxiosError(error)) {
                const partnerMissingMessage =
                    dailyStrings.feedback?.email_partner_missing ??
                    "Hubungkan pasanganmu dan pastikan alamat email tersedia sebelum mengirim.";

                if (error.response?.status === 422) {
                    fallbackMessage =
                        (error.response.data?.error as string | undefined) ??
                        partnerMissingMessage;
                } else if (typeof error.response?.data?.error === "string") {
                    fallbackMessage = error.response.data.error;
                }
            }

            setFeedbackBanner({
                type: "error",
                message: fallbackMessage,
            });
        } finally {
            setLoadingOverlay(null);
            setSendingEmailId(null);
        }
    };

    const handleRegenerate = async (message: DailyMessage) => {
        if (sendingEmailId !== null) {
            return;
        }

        const messageId = String(message.id);
        setSendingEmailId(messageId);
        setLoadingOverlay({
            title: "Regenerating message with AI...",
            description:
                "Tunggu sebentar, kami sedang membuat pesan baru untukmu ✨",
        });

        try {
            const response = await axios.post(
                route("daily.regenerate", { space: spaceSlug, id: message.id }),
            );

            const successMessage =
                response.data?.success ??
                "Pesan berhasil di-regenerate! 🎉";

            setFeedbackBanner({
                type: "success",
                message: successMessage,
            });

            // Reload the page to show the new message
            router.reload({ only: ['messages'] });
        } catch (error) {
            let fallbackMessage = "Gagal regenerate pesan. Coba lagi nanti, ya.";

            if (axios.isAxiosError(error)) {
                if (typeof error.response?.data?.error === "string") {
                    fallbackMessage = error.response.data.error;
                }
            }

            setFeedbackBanner({
                type: "error",
                message: fallbackMessage,
            });
        } finally {
            setLoadingOverlay(null);
            setSendingEmailId(null);
        }
    };

    const sanitize = (text: string) => {
        let sanitizedText = text
            .replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, '"');
        return sanitizedText.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    };

    const containerRef = useRef<HTMLDivElement>(null);

    const position = useRef(
        messages.map(() => ({
            x: 0,
            y: 0,
        }))
    ).current;

    const [springs, api] = useSprings(messages.length, (i) => ({
        x: position[i].x,
        y: position[i].y,
        zIndex: 1,
        config: { mass: 1, tension: 280, friction: 60 },
    }));

    const bind = useDrag(({ args: [index], down, movement: [mx, my] }) => {
        position[index] = { x: mx, y: my };
        api.start((i) => {
            if (index !== i) return;
            const x = down ? mx : position[i].x;
            const y = down ? my : position[i].y;
            const zIndex = down ? 1000 : 1;
            return { x, y, zIndex, immediate: down };
        });
    });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    {dailyStrings.header ?? "Daily Message"}
                </h2>
            }
        >
            <Head title={dailyStrings.meta?.title ?? "Daily Messages"} />

            <div className="p-6 space-y-6 max-w-8xl mx-auto">
                <div className="p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-pink-700">
                        {dailyStrings.title ?? "Pesan Harian Kita 💌"}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                        >
                            {dailyStrings.actions?.search ?? "Cari Pesan"}
                        </button>
                        <Link
                            href={route("daily.create", { space: spaceSlug })}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                        >
                            {dailyStrings.actions?.add_manual ?? "+ Tambah Manual"}
                        </Link>
                    </div>
                </div>

                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {dailyStrings.empty ??
                            "Belum ada pesan harian. AI akan generate otomatis! ✨"}
                    </p>
                ) : (
                    <div
                        ref={containerRef}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
                    >
                        {springs.map((spring, i) => {
                            const { x, y, zIndex } = spring;
                            const message = messages[i];
                            return (
                                <animated.div
                                    {...bind(i)}
                                    key={message.id}
                                    style={{
                                        x,
                                        y,
                                        zIndex: zIndex.to((value) => Math.round(value)),
                                        touchAction: "none",
                                    }}
                                    className="p-4 bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition duration-200 cursor-grab active:cursor-grabbing"
                                >
                                    <h4 className="font-semibold text-gray-800">
                                        {message.date}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {message.user ? `From: ${message.user.name}` : ''}
                                    </p>
                                    <ExpandableText
                                        text={sanitize(`"${message.message}"`)}
                                        wordLimit={50}
                                        expandMoreLabel={
                                            dailyStrings.expand?.more ??
                                            "Baca selengkapnya"
                                        }
                                        expandLessLabel={
                                            dailyStrings.expand?.less ??
                                            "Baca lebih sedikit"
                                        }
                                    />
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => void handleRegenerate(message)}
                                            className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-lg bg-purple-500 text-white transition hover:bg-purple-600 ${
                                                sendingEmailId === String(message.id)
                                                    ? "opacity-70 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            disabled={sendingEmailId === String(message.id)}
                                            title="Regenerate message with AI"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Regenerate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleSendEmail(message)}
                                            className={`px-3 py-1 text-sm rounded-lg bg-blue-500 text-white transition hover:bg-blue-600 ${
                                                sendingEmailId === String(message.id)
                                                    ? "opacity-70 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            disabled={sendingEmailId === String(message.id)}
                                        >
                                            {dailyStrings.actions?.send_email ??
                                                tCommon(
                                                    "actions.send_email",
                                                    "Send to Email",
                                                )}
                                        </button>
                                    </div>
                                </animated.div>
                            );
                        })}
                    </div>
                )}

                <Modal show={showSearchModal} onClose={() => setShowSearchModal(false)}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get(
                                route("daily.index", { space: spaceSlug }),
                                { search: searchKeyword, date: searchDate },
                                {
                                    preserveState: true,
                                    replace: true,
                                    onSuccess: () => setShowSearchModal(false),
                                },
                            );
                        }}
                        className="p-6"
                    >
                        <h2 className="text-lg font-medium text-gray-900">
                            {dailyStrings.modal?.title ?? "Cari Pesan Harian"}
                        </h2>

                        <div className="mt-6">
                            <InputLabel
                                htmlFor="searchKeyword"
                                value={dailyStrings.modal?.keyword ?? "Kata Kunci"}
                            />
                            <TextInput
                                id="searchKeyword"
                                type="text"
                                className="mt-1 block w-full"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="searchDate"
                                value={dailyStrings.modal?.date ?? "Tanggal (YYYY-MM-DD)"}
                            />
                            <TextInput
                                id="searchDate"
                                type="date"
                                className="mt-1 block w-full"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                            />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => {
                                setSearchKeyword("");
                                setSearchDate("");
                                router.get(
                                    route("daily.index", { space: spaceSlug }),
                                    {},
                                    {
                                        preserveState: true,
                                        replace: true,
                                        onSuccess: () =>
                                            setShowSearchModal(false),
                                    },
                                );
                            }}>
                                {tCommon("actions.clear", "Clear")}
                            </SecondaryButton>
                            <PrimaryButton className="ms-3" type="submit">
                                {dailyStrings.actions?.search ?? "Cari"}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {feedbackBanner && (
                    <div className="fixed inset-x-0 top-6 z-40 flex justify-center px-4">
                        <div
                            className={`flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg ${
                                feedbackBanner.type === "success"
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                            }`}
                        >
                            <span>{feedbackBanner.message}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (feedbackTimeoutRef.current) {
                                        window.clearTimeout(
                                            feedbackTimeoutRef.current,
                                        );
                                        feedbackTimeoutRef.current = null;
                                    }
                                    setFeedbackBanner(null);
                                }}
                                className="rounded-full bg-white/20 p-1 text-white transition hover:bg-white/30"
                                aria-label="Tutup notifikasi"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {loadingOverlay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl bg-white px-6 py-6 text-center shadow-2xl">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                            <h3 className="text-base font-semibold text-slate-900">
                                {loadingOverlay.title}
                            </h3>
                            {loadingOverlay.description && (
                                <p className="text-sm text-slate-500">
                                    {loadingOverlay.description}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

interface DailyMessage {
    id: string | number;
    date: string;
    message: string;
    searchKeyword?: string;
    searchDate?: string;
    user?: {
        id: number;
        name: string;
    };
}
