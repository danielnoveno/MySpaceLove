import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { useRef, useState } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useCurrentSpace } from "@/hooks/useCurrentSpace";
import { useTranslation } from "@/hooks/useTranslation";
import axios from "axios";

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
                regenerate_ai?: string;
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

    const handleSendEmail = async (message: DailyMessage) => {
        if (sendingEmailId !== null) {
            return;
        }

        const messageId = String(message.id);
        setSendingEmailId(messageId);

        try {
            const response = await axios.post(
                route("daily.email", { space: spaceSlug, id: message.id }),
            );

            const successMessage =
                response.data?.message ??
                dailyStrings.feedback?.email_sent ??
                "Daily message sent to your partner's email!";

            window.alert(successMessage);
        } catch (error) {
            let fallbackMessage =
                dailyStrings.feedback?.email_failed ??
                "Could not send email. Please try again later.";

            if (axios.isAxiosError(error)) {
                const partnerMissingMessage =
                    dailyStrings.feedback?.email_partner_missing ??
                    "Connect your partner and make sure their email is available before sending.";

                if (error.response?.status === 422) {
                    fallbackMessage =
                        (error.response.data?.error as string | undefined) ??
                        partnerMissingMessage;
                } else if (typeof error.response?.data?.error === "string") {
                    fallbackMessage = error.response.data.error;
                }
            }

            window.alert(fallbackMessage);
        } finally {
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
                        {springs.map(({ x, y }, i) => (
                            <animated.div
                                {...bind(i)}
                                key={messages[i].id}
                                style={{ x, y, zIndex: springs[i].zIndex, touchAction: "none" }}
                                className="p-4 bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition duration-200 cursor-grab active:cursor-grabbing"
                            >
                                <h4 className="font-semibold text-gray-800">
                                    {messages[i].date}
                                </h4>
                                <ExpandableText
                                    text={sanitize(`"${messages[i].message}"`)}
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
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={route("daily.edit", {
                                            space: spaceSlug,
                                            id: messages[i].id,
                                        })}
                                        className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                    >
                                        {tCommon("actions.edit", "Edit")}
                                    </Link>
                                    <button
                                        onClick={() =>
                                            router.post(
                                            route("daily.regenerate", {
                                                space: spaceSlug,
                                            }),
                                            { date: messages[i].date },
                                        )
                                    }

                                        className="px-3 py-1 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
                                    >
                                        {dailyStrings.actions?.regenerate_ai ??
                                            tCommon("actions.regenerate", "Regenerate AI")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleSendEmail(messages[i])}
                                        className={`px-3 py-1 text-sm rounded-lg bg-blue-500 text-white transition hover:bg-blue-600 ${
                                            sendingEmailId ===
                                            String(messages[i].id)
                                                ? "opacity-70 cursor-not-allowed"
                                                : ""
                                        }`}
                                        disabled={
                                            sendingEmailId ===
                                            String(messages[i].id)
                                        }
                                    >
                                        {dailyStrings.actions?.send_email ??
                                            tCommon(
                                                "actions.send_email",
                                                "Send to Email",
                                            )}
                                    </button>
                                </div>
                            </animated.div>
                        ))}
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
}
