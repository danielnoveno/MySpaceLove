import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, Send, SmilePlus } from "lucide-react";

type User = {
    id: number;
    name: string;
    profile_image?: string | null;
    profile_photo_url?: string | null;
};

type ChatMessage = {
    id: number;
    space_id: number;
    sender_user_id: number;
    type: "text" | "gif" | string;
    body: string | null;
    meta_json?: Record<string, any> | null;
    created_at: string | null;
    sender?: User | null;
};

type GifItem = {
    id: string;
    title: string;
    url: string;
    preview_url?: string | null;
    source: string;
};

interface Props {
    space: {
        id: number;
        slug: string;
        title: string;
    };
    messagesRoute: string;
    sendRoute: string;
    markReadRoute: string;
    gifSearchRoute: string;
}

export default function MessagesIndex({
    space,
    messagesRoute,
    sendRoute,
    markReadRoute,
    gifSearchRoute,
}: Props) {
    const { props } = usePage<any>();
    const currentUserId = props.auth?.user?.id;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [body, setBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [gifOpen, setGifOpen] = useState(false);
    const [gifQuery, setGifQuery] = useState("");
    const [gifs, setGifs] = useState<GifItem[]>([]);
    const [gifLoading, setGifLoading] = useState(false);
    const [gifMessage, setGifMessage] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const sortedMessages = useMemo(
        () => [...messages].sort((a, b) => a.id - b.id),
        [messages]
    );

    const scrollToBottom = useCallback(() => {
        window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }, []);

    const markRead = useCallback(
        async (items: ChatMessage[]) => {
            const ids = items
                .filter((message) => message.sender_user_id !== currentUserId)
                .map((message) => message.id);

            if (!ids.length) return;

            try {
                await axios.post(markReadRoute, { message_ids: ids });
            } catch {
                // Non-blocking read receipts.
            }
        },
        [currentUserId, markReadRoute]
    );

    const loadMessages = useCallback(
        async (page = 1, append = false) => {
            append ? setLoadingMore(true) : setLoading(true);
            setError(null);

            try {
                const response = await axios.get(messagesRoute, {
                    params: { page, per_page: 25 },
                });

                const items = (response.data.data ?? []) as ChatMessage[];
                setMessages((current) => {
                    const merged = append ? [...items, ...current] : items;
                    const unique = new Map<number, ChatMessage>();
                    merged.forEach((message) => unique.set(message.id, message));
                    return Array.from(unique.values());
                });
                setNextPage(response.data.pagination?.next_page ?? null);
                markRead(items);
                if (!append) scrollToBottom();
            } catch {
                setError("Gagal memuat pesan. Coba refresh halaman.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [markRead, messagesRoute, scrollToBottom]
    );

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const sendMessage = async (event: FormEvent) => {
        event.preventDefault();
        const text = body.trim();
        if (!text || sending) return;

        setSending(true);
        setError(null);
        try {
            const response = await axios.post(sendRoute, {
                type: "text",
                body: text,
            });
            setMessages((current) => [...current, response.data.message]);
            setBody("");
            scrollToBottom();
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Gagal mengirim pesan.");
        } finally {
            setSending(false);
        }
    };

    const searchGifs = async (query = gifQuery) => {
        setGifLoading(true);
        setGifMessage(null);
        try {
            const response = await axios.get(gifSearchRoute, {
                params: { q: query, limit: 24 },
            });
            setGifs(response.data.gifs ?? []);
            if (response.data.configured === false) {
                setGifMessage(response.data.message ?? "Klipy belum dikonfigurasi.");
            } else if ((response.data.gifs ?? []).length === 0) {
                setGifMessage("Tidak ada GIF ditemukan.");
            }
        } catch (err: any) {
            setGifMessage(err?.response?.data?.message ?? "Gagal memuat GIF Klipy.");
            setGifs([]);
        } finally {
            setGifLoading(false);
        }
    };

    const toggleGifPicker = () => {
        const next = !gifOpen;
        setGifOpen(next);
        if (next && gifs.length === 0) {
            searchGifs("");
        }
    };

    const sendGif = async (gif: GifItem) => {
        if (sending) return;
        setSending(true);
        setError(null);
        try {
            const response = await axios.post(sendRoute, {
                type: "gif",
                body: gif.title,
                meta: {
                    gif_id: gif.id,
                    title: gif.title,
                    url: gif.url,
                    preview_url: gif.preview_url,
                    source: gif.source,
                },
            });
            setMessages((current) => [...current, response.data.message]);
            setGifOpen(false);
            scrollToBottom();
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Gagal mengirim GIF.");
        } finally {
            setSending(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Messages - ${space.title}`} />

            <div className="w-full max-w-none px-0 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route("spaces.show", { space: space.slug })}
                            className="text-sm font-semibold text-pink-500 hover:text-pink-600"
                        >
                            ← Back to Space
                        </Link>
                        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Messages</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Chat privat di space <strong>{space.title}</strong>. Bisa kirim text dan GIF dari Klipy.
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white/90 shadow-sm">
                    <div className="flex min-h-[62vh] flex-col">
                        <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 px-5 py-4">
                            <div className="font-semibold text-gray-900">{space.title}</div>
                            <div className="text-xs text-gray-500">Self-hosted messages + Klipy GIF picker</div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                            {nextPage && (
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => loadMessages(nextPage, true)}
                                        disabled={loadingMore}
                                        className="rounded-full border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 disabled:opacity-60"
                                    >
                                        {loadingMore ? "Loading..." : "Load older messages"}
                                    </button>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center py-16 text-pink-500">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : sortedMessages.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/70 p-8 text-center text-sm text-gray-600">
                                    Belum ada pesan. Mulai dengan sapaan manis atau GIF lucu 💌
                                </div>
                            ) : (
                                sortedMessages.map((message) => {
                                    const mine = message.sender_user_id === currentUserId;
                                    const gifUrl = message.meta_json?.url ?? message.meta_json?.gif_url;
                                    const preview = message.meta_json?.preview_url ?? gifUrl;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                                                    mine
                                                        ? "bg-pink-500 text-white"
                                                        : "border border-purple-100 bg-white text-gray-800"
                                                }`}
                                            >
                                                <div className={`mb-1 text-xs ${mine ? "text-pink-100" : "text-gray-400"}`}>
                                                    {mine ? "You" : message.sender?.name ?? "Partner"}
                                                </div>
                                                {message.type === "gif" && gifUrl ? (
                                                    <div className="space-y-2">
                                                        <img
                                                            src={preview}
                                                            alt={message.body ?? "GIF"}
                                                            className="max-h-64 rounded-2xl object-cover"
                                                            loading="lazy"
                                                        />
                                                        {message.body && (
                                                            <div className={`text-xs ${mine ? "text-pink-100" : "text-gray-500"}`}>
                                                                {message.body}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</div>
                                                )}
                                                <div className={`mt-2 text-[11px] ${mine ? "text-pink-100" : "text-gray-400"}`}>
                                                    {message.created_at ? new Date(message.created_at).toLocaleString() : "just now"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {error && (
                            <div className="mx-4 mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
                                {error}
                            </div>
                        )}

                        {gifOpen && (
                            <div className="border-t border-pink-100 bg-pink-50/70 p-4">
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        searchGifs();
                                    }}
                                    className="mb-3 flex gap-2"
                                >
                                    <input
                                        value={gifQuery}
                                        onChange={(event) => setGifQuery(event.target.value)}
                                        placeholder="Search Klipy GIF..."
                                        className="flex-1 rounded-full border-pink-200 bg-white px-4 py-2 text-sm focus:border-pink-400 focus:ring-pink-400"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                                    >
                                        Search
                                    </button>
                                </form>
                                {gifLoading ? (
                                    <div className="flex justify-center py-8 text-purple-500">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : gifMessage ? (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                                        {gifMessage}
                                    </div>
                                ) : (
                                    <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
                                        {gifs.map((gif) => (
                                            <button
                                                key={gif.id}
                                                type="button"
                                                onClick={() => sendGif(gif)}
                                                className="group overflow-hidden rounded-2xl border border-white bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <img
                                                    src={gif.preview_url ?? gif.url}
                                                    alt={gif.title}
                                                    className="aspect-square w-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="truncate px-2 py-1 text-left text-[11px] text-gray-500 group-hover:text-pink-600">
                                                    {gif.title}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={sendMessage} className="border-t border-pink-100 bg-white p-4">
                            <div className="flex items-end gap-2">
                                <button
                                    type="button"
                                    onClick={toggleGifPicker}
                                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                                        gifOpen
                                            ? "border-purple-300 bg-purple-50 text-purple-600"
                                            : "border-pink-200 text-pink-500 hover:bg-pink-50"
                                    }`}
                                    title="Send GIF"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                </button>
                                <textarea
                                    value={body}
                                    onChange={(event) => setBody(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event.preventDefault();
                                            sendMessage(event as any);
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border-pink-200 px-4 py-3 text-sm focus:border-pink-400 focus:ring-pink-400"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || body.trim() === ""}
                                    className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pink-600 disabled:opacity-60"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                <SmilePlus className="h-3.5 w-3.5" /> Press Enter to send, Shift+Enter for newline.
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
