import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { useRef, useState, FormEventHandler } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

const ExpandableText = ({
    text,
    wordLimit,
}: {
    text: string;
    wordLimit: number;
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
                    {isExpanded ? "Baca lebih sedikit" : "Baca selengkapnya"}
                </button>
            )}
        </div>
    );
};

export default function DailyMessageIndex({
    messages,
    spaceId,
    filters,
}: {
    messages: any[];
    spaceId: string;
    filters: {
        search?: string;
        date?: string;
    };
}) {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState(
        filters.search || ""
    );
    const [searchDate, setSearchDate] = useState(
        filters.date || ""
    );

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
                    Daily Message
                </h2>
            }
        >
            <Head title="Daily Message" />

            <div className="p-6 space-y-6 max-w-8xl mx-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-pink-700">
                        Pesan Harian Kita 💌
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                        >
                            Cari Pesan
                        </button>
                        <Link
                            href={route("daily.create", { spaceId: spaceId })}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                        >
                            + Tambah Manual
                        </Link>
                    </div>
                </div>

                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Belum ada pesan harian. AI akan generate otomatis! ✨
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
                                />
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={route("daily.edit", {
                                            spaceId: spaceId,
                                            id: messages[i].id,
                                        })}
                                        className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            router.post(
                                                route("daily.regenerate", {
                                                    spaceId: spaceId,
                                                }),
                                                { date: messages[i].date }
                                            )
                                        }

                                        className="px-3 py-1 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
                                    >
                                        Regenerate AI
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
                                route("daily.index", { spaceId: spaceId }),
                                { search: searchKeyword, date: searchDate },
                                {
                                    preserveState: true,
                                    replace: true,
                                    onSuccess: () => setShowSearchModal(false),
                                }
                            );
                        }}
                        className="p-6"
                    >
                        <h2 className="text-lg font-medium text-gray-900">Cari Pesan Harian</h2>

                        <div className="mt-6">
                            <InputLabel htmlFor="searchKeyword" value="Kata Kunci" />
                            <TextInput
                                id="searchKeyword"
                                type="text"
                                className="mt-1 block w-full"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="searchDate" value="Tanggal (YYYY-MM-DD)" />
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
                                router.get(route("daily.index", { spaceId: spaceId }), {}, {
                                    preserveState: true,
                                    replace: true,
                                    onSuccess: () => setShowSearchModal(false),
                                });
                            }}>
                                Clear
                            </SecondaryButton>
                            <PrimaryButton className="ms-3" type="submit">
                                Cari
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

interface DailyMessage {
    id: string;
    date: string;
    message: string;
    searchKeyword?: string;
    searchDate?: string;
}
