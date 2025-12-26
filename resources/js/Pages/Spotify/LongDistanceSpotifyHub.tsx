import Modal from "@/Components/Modal";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    Calendar,
    Check,
    Clock,
    Heart,
    Headphones,
    Loader2,
    Music,
    Play,
    Plug,
    Sparkles,
    Users,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type PlaylistSampleTrack = {
    id: string;
    name: string;
    artists: string[];
    added_at?: string | null;
    preview_url?: string | null;
    external_url?: string | null;
};

type PlaylistSummary = {
    playlist_id: string | null;
    name: string | null;
    owner: string | null;
    external_url: string | null;
    total_tracks: number;
    new_this_week: number;
    average_energy: number;
    last_added: {
        title: string;
        artists: string[];
        added_at: string | null;
    } | null;
    sample_tracks?: PlaylistSampleTrack[];
    target_weekly: number;
};

type MoodSnapshot = {
    id: string;
    user_label: string;
    track: string;
    artists: string;
    mood_tone: string;
    energy: number;
    affection: string;
    played_at: string | null;
};

type SurpriseDrop = {
    id: number;
    track: string;
    artists: string;
    scheduled_for: string | null;
    note: string | null;
    curator: string | null;
};

type ListeningSnapshot = {
    is_live: boolean;
    track?: string;
    artists?: string;
    host?: string;
    started_at?: string;
    listeners?: number;
    joinable: boolean;
    track_id?: string | null;
    track_uri?: string | null;
    progress_ms?: number | null;
    external_url?: string | null;
};

type MemoryCapsule = {
    id: number;
    track: string;
    artists: string;
    moment: string | null;
    description: string | null;
    saved_at: string | null;
    preview_url: string | null;
};

type SpotifyDashboardResponse = {
    connected: boolean;
    message?: string;
    playlist?: PlaylistSummary | null;
    moods?: MoodSnapshot[];
    listening?: ListeningSnapshot | null;
    surpriseDrops?: SurpriseDrop[];
    memoryCapsules?: MemoryCapsule[];
    connections?: ConnectionStatus[];
};

type ConnectionStatus = {
    user_id: number | null;
    name: string | null;
    is_current_user: boolean;
    connected: boolean;
    connected_at?: string | null;
};

type Props = {
    space: SpaceInfo;
};

type ActionMessage = {
    type: "success" | "error";
    message: string;
};

type SurpriseFormState = {
    trackInput: string;
    scheduledFor: string;
    note: string;
};

type CapsuleFormState = {
    trackInput: string;
    moment: string;
    description: string;
    savedAt: string;
};

function extractSpotifyTrackId(input: string): string | null {
    const value = input.trim();
    if (!value) {
        return null;
    }

    if (value.startsWith("spotify:track:")) {
        return value.split(":").pop() ?? null;
    }

    try {
        const url = new URL(value);
        if (url.hostname.includes("spotify.com")) {
            const parts = url.pathname.split("/").filter(Boolean);
            const trackIndex = parts.findIndex((segment) => segment === "track");
            if (trackIndex !== -1 && parts[trackIndex + 1]) {
                return parts[trackIndex + 1];
            }
        }
    } catch (error) {
        // Not a valid URL, fall back to simple matching below.
    }

    if (/^[a-zA-Z0-9]{10,}$/.test(value)) {
        return value;
    }

    return null;
}
function formatEnergy(energy: number | undefined | null): string {
    if (typeof energy !== "number" || Number.isNaN(energy)) {
        return "0%";
    }

    return `${Math.round(energy * 100)}%`;
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    return date.toLocaleString("id-ID", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDate(value?: string | null, locale: string = "en"): string {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}
export default function LongDistanceSpotifyHub({ space }: Props) {
    const { props } = usePage();
    const locale = (props as any).locale ?? "en";
    const { translations: spotifyTrans } = useTranslation("spotify");
    
    // Extract translation groups
    const header: any = spotifyTrans.header ?? {};
    const connection: any = spotifyTrans.connection ?? {};
    const playlistTrans: any = spotifyTrans.playlist ?? {};
    const moodTrans: any = spotifyTrans.mood ?? {};
    const listeningTrans: any = spotifyTrans.listening ?? {};
    const surprise: any = spotifyTrans.surprise ?? {};
    const capsule: any = spotifyTrans.capsule ?? {};
    const loading: any = spotifyTrans.loading ?? {};
    const messages: any = spotifyTrans.messages ?? {};
    
    const [dashboard, setDashboard] = useState<SpotifyDashboardResponse | null>(null);
    const [loadingState, setLoadingState] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
    const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);
    const [capsuleModalOpen, setCapsuleModalOpen] = useState(false);
    const [surpriseForm, setSurpriseForm] = useState<SurpriseFormState>({
        trackInput: "",
        scheduledFor: "",
        note: "",
    });
    const [capsuleForm, setCapsuleForm] = useState<CapsuleFormState>({
        trackInput: "",
        moment: "",
        description: "",
        savedAt: "",
    });
    const [surpriseSubmitting, setSurpriseSubmitting] = useState(false);
    const [capsuleSubmitting, setCapsuleSubmitting] = useState(false);
    const [surpriseError, setSurpriseError] = useState<string | null>(null);
    const [capsuleError, setCapsuleError] = useState<string | null>(null);
    const [joiningPlayback, setJoiningPlayback] = useState(false);
    const loveHoverConnect = {
        "--love-hover-color": "#8b5cf6",
    } as CSSProperties;

    const authorizeHref = route("spotify.authorize", {
        space: space.slug,
        redirect: route("spotify.companion", { space: space.slug }),
    });
    const handleAuthorize = useCallback(() => {
        window.location.href = authorizeHref;
    }, [authorizeHref]);

    const fetchDashboard = useCallback(async () => {
        setLoadingState(true);
        setError(null);

        try {
            const response = await axios.get<SpotifyDashboardResponse>(
                route("spotify.dashboard", { space: space.slug }),
            );
            setDashboard(response.data);
            setError(response.data.message ?? null);
            const firstMood = response.data.moods?.[0];
            setSelectedMoodId(firstMood?.id ?? null);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data as SpotifyDashboardResponse | undefined;
                if (responseData) {
                    setDashboard(responseData);
                } else {
                    setDashboard(null);
                }

                const responseMessage =
                    typeof err.response?.data === "object" && err.response?.data !== null && "message" in err.response.data
                        ? (err.response?.data as { message?: string }).message
                        : undefined;

                setError(responseMessage ?? err.message ?? (messages.error?.load_failed ?? "Failed to load Spotify data."));
            } else if (err instanceof Error) {
                setDashboard(null);
                setError(messages.error?.load_failed ?? "Failed to load Spotify data.");
            } else {
                setDashboard(null);
                setError(messages.error?.load_failed ?? "Failed to load Spotify data.");
            }
        } finally {
            setLoadingState(false);
        }
    }, [space.slug]);

    const handleSurpriseSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (surpriseSubmitting) {
            return;
        }

        setSurpriseError(null);

        const trackId = extractSpotifyTrackId(surpriseForm.trackInput);
        if (!trackId) {
            setSurpriseError(messages.error?.invalid_track ?? "Enter a valid Spotify track link or ID.");
            return;
        }

        setSurpriseSubmitting(true);

        try {
            const response = await axios.post<SurpriseDrop>(
                route("spotify.surprises.store", { space: space.slug }),
                {
                    spotify_track_id: trackId,
                    scheduled_for: surpriseForm.scheduledFor,
                    note: surpriseForm.note || null,
                },
            );

            const drop = response.data;

            setDashboard((prev) => {
                if (!prev) {
                    return prev;
                }

                const drops = [...(prev.surpriseDrops ?? []), drop].sort((a, b) => {
                    const aTime = a.scheduled_for ? new Date(a.scheduled_for).getTime() : Number.MAX_SAFE_INTEGER;
                    const bTime = b.scheduled_for ? new Date(b.scheduled_for).getTime() : Number.MAX_SAFE_INTEGER;
                    return aTime - bTime;
                });

                return {
                    ...prev,
                    surpriseDrops: drops,
                };
            });

            setSurpriseForm({ trackInput: "", scheduledFor: "", note: "" });
            setSurpriseModalOpen(false);
            setActionMessage({
                type: "success",
                message: messages.success?.surprise_scheduled ?? "Surprise song successfully scheduled!",
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = (err.response?.data as { message?: string })?.message;
                setSurpriseError(message ?? (messages.error?.surprise_failed ?? "Failed to schedule surprise song. Try again."));
            } else if (err instanceof Error) {
                setSurpriseError(err.message);
            } else {
                setSurpriseError(messages.error?.surprise_failed ?? "Failed to schedule surprise song. Try again.");
            }
        } finally {
            setSurpriseSubmitting(false);
        }
    };

    const handleCapsuleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (capsuleSubmitting) {
            return;
        }

        setCapsuleError(null);

        const trackId = extractSpotifyTrackId(capsuleForm.trackInput);
        if (!trackId) {
            setCapsuleError(messages.error?.invalid_track ?? "Enter a valid Spotify track link or ID.");
            return;
        }

        setCapsuleSubmitting(true);

        try {
            const response = await axios.post<MemoryCapsule>(
                route("spotify.capsules.store", { space: space.slug }),
                {
                    spotify_track_id: trackId,
                    moment: capsuleForm.moment || null,
                    description: capsuleForm.description || null,
                    saved_at: capsuleForm.savedAt || null,
                },
            );

            const capsule = response.data;

            setDashboard((prev) => {
                if (!prev) {
                    return prev;
                }

                const capsules = [...(prev.memoryCapsules ?? []), capsule].sort((a, b) => {
                    const aTime = a.saved_at ? new Date(a.saved_at).getTime() : 0;
                    const bTime = b.saved_at ? new Date(b.saved_at).getTime() : 0;

                    return bTime - aTime;
                });

                return {
                    ...prev,
                    memoryCapsules: capsules,
                };
            });

            setCapsuleForm({ trackInput: "", moment: "", description: "", savedAt: "" });
            setCapsuleModalOpen(false);
            setActionMessage({
                type: "success",
                message: messages.success?.capsule_saved ?? "Memory capsule successfully saved!",
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = (err.response?.data as { message?: string })?.message;
                setCapsuleError(message ?? (messages.error?.capsule_failed ?? "Failed to save memory capsule. Try again."));
            } else if (err instanceof Error) {
                setCapsuleError(err.message);
            } else {
                setCapsuleError(messages.error?.capsule_failed ?? "Failed to save memory capsule. Try again.");
            }
        } finally {
            setCapsuleSubmitting(false);
        }
    };

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    const playlist = dashboard?.playlist ?? null;
    const listening = dashboard?.listening ?? null;

    const playlistEmbedUrl = useMemo(() => {
        if (!playlist?.playlist_id) {
            return null;
        }

        const params = new URLSearchParams({
            utm_source: "myspacelove",
            theme: "0",
        });

        return `https://open.spotify.com/embed/playlist/${encodeURIComponent(
            playlist.playlist_id,
        )}?${params.toString()}`;
    }, [playlist?.playlist_id]);

    const liveTrackEmbedUrl = useMemo(() => {
        if (!listening?.track_id) {
            return null;
        }

        const params = new URLSearchParams({
            utm_source: "myspacelove",
        });

        return `https://open.spotify.com/embed/track/${encodeURIComponent(
            listening.track_id,
        )}?${params.toString()}`;
    }, [listening?.track_id]);

    const highlightedTracks = useMemo<PlaylistSampleTrack[]>(() => {
        if (!playlist?.sample_tracks?.length) {
            return [];
        }

        return playlist.sample_tracks.slice(0, 3);
    }, [playlist?.sample_tracks]);

    const connections = dashboard?.connections ?? [];
    const moods = dashboard?.moods ?? [];
    const selectedMood = useMemo(() => {
        if (!moods.length) {
            return null;
        }

        if (!selectedMoodId) {
            return moods[0];
        }

        return moods.find((mood) => mood.id === selectedMoodId) ?? moods[0];
    }, [moods, selectedMoodId]);

    const surpriseDrops = dashboard?.surpriseDrops ?? [];
    const memoryCapsules = dashboard?.memoryCapsules ?? [];

    const isConnected = dashboard?.connected ?? false;

    const handleJoinPlayback = useCallback(async () => {
        if (!isConnected) {
            handleAuthorize();
            return;
        }

        if (!listening?.joinable || !listening.track_id) {
            setActionMessage({
                type: "error",
                message: messages.error?.no_playback ?? "No playback session available to join right now.",
            });
            return;
        }

        setJoiningPlayback(true);
        setActionMessage(null);

        try {
            await axios.post(
                route("spotify.playback.join", { space: space.slug }),
                {
                    track_id: listening.track_id,
                    position_ms: listening.progress_ms ?? 0,
                },
            );

            setActionMessage({
                type: "success",
                message: messages.success?.playback_synced ?? "Your playback is now synced with the live session.",
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = (err.response?.data as { message?: string })?.message;
                setActionMessage({
                    type: "error",
                    message: message ?? (messages.error?.join_failed ?? "Failed to join playback. Make sure your Spotify is active."),
                });
            } else if (err instanceof Error) {
                setActionMessage({
                    type: "error",
                    message: err.message,
                });
            } else {
                setActionMessage({
                    type: "error",
                    message: messages.error?.join_retry ?? "Failed to join playback. Try again in a moment.",
                });
            }
        } finally {
            setJoiningPlayback(false);
        }
    }, [handleAuthorize, isConnected, listening, space.slug]);

    const openSurpriseModal = useCallback(() => {
        if (!isConnected) {
            handleAuthorize();
            return;
        }

        setSurpriseError(null);
        setSurpriseModalOpen(true);
    }, [handleAuthorize, isConnected]);

    const openCapsuleModal = useCallback(() => {
        if (!isConnected) {
            handleAuthorize();
            return;
        }

        setCapsuleError(null);
        setCapsuleModalOpen(true);
    }, [handleAuthorize, isConnected]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-gray-800">{header.title ?? "Spotify Companion Kit"}</h2>
                    <p className="text-sm text-purple-600">
                        {(header.subtitle ?? "Space :space: sync music, moods, and moments to stay close despite the distance.").replace(":space", space.title)}
                    </p>
                </div>
            }
        >
            <Head title={header.page_title ?? "Spotify Companion Kit"} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
                {actionMessage && (
                    <div
                        className={`rounded-3xl border p-4 text-sm ${
                            actionMessage.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {actionMessage.message}
                    </div>
                )}

                {connections.length > 0 && (
                    <section className="rounded-3xl border border-purple-200 bg-white/90 p-6 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold text-purple-900">Status Koneksi Spotify</h3>
                            <p className="text-sm text-purple-600">
                                Setiap akun perlu tersambung supaya playlist sinkron, mood tracking, dan kejutan berjalan optimal.
                            </p>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {connections.map((connection, index) => {
                                const connected = connection.connected;
                                const cardClasses = connected
                                    ? "border-emerald-200 bg-emerald-50/80"
                                    : "border-rose-200 bg-rose-50/80";
                                const displayName = connection.is_current_user
                                    ? connection.name ?? "Kamu"
                                    : connection.name ?? "Pasangan";
                                const connectedAt = connection.connected_at
                                    ? `Terhubung ${formatDateTime(connection.connected_at)}`
                                    : connected
                                      ? "Terhubung"
                                      : "Belum tersambung";

                                return (
                                    <div
                                        key={`${connection.user_id ?? "guest"}-${index}`}
                                        className={`rounded-2xl border p-4 shadow-sm transition ${cardClasses}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-purple-900">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs text-purple-500">{connectedAt}</p>
                                            </div>
                                            {connected ? (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                                                    <Check className="h-4 w-4" />
                                                    Terhubung
                                                </span>
                                            ) : connection.is_current_user ? (
                                                <button
                                                    type="button"
                                                    onClick={handleAuthorize}
                                                    data-love-hover
                                                    style={loveHoverConnect}
                                                    className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                                >
                                                    <Plug className="h-4 w-4" />
                                                    Sambungkan
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600">
                                                    <Plug className="h-4 w-4" />
                                                    Belum terhubung
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {!isConnected && dashboard?.message && (
                            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                {dashboard.message}
                            </p>
                        )}
                    </section>
                )}

                {!isConnected && !loading && connections.length === 0 && (
                    <section className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-purple-900">Hubungkan Spotify</h3>
                                <p className="text-sm text-purple-600">
                                    Sambungkan akun Spotify kalian untuk menyalakan playlist sinkron, mood check-in, dan kejutan lagu.
                                </p>
                                {error && (
                                    <p className="text-sm text-rose-500">{error}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleAuthorize}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                                <Music className="h-4 w-4" />
                                Hubungkan Spotify
                            </button>
                        </div>
                    </section>
                )}

                {loading && (
                    <section className="flex items-center justify-center rounded-3xl border border-purple-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-3 text-purple-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-medium">{loading.dashboard ?? "Loading Spotify data..."}</span>
                        </div>
                    </section>
                )}

                {error && isConnected && !loading && (
                    <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
                        {error}
                        <button
                            type="button"
                            onClick={() => void fetchDashboard()}
                            className="mt-4 inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                        >
                            {loading.retry ?? "Try Reload"}
                        </button>
                    </section>
                )}

                {isConnected && !loading && (
                    <>
                        <section className="grid gap-5 rounded-3xl border border-purple-200 bg-purple-50 p-6 shadow-sm md:grid-cols-[1.2fr_1fr]">
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-white p-2 text-purple-500 shadow-sm">
                                        <Music className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-purple-800">Playlist Sinkron</h3>
                                        <p className="text-sm text-purple-600">
                                            Playlist otomatis update tiap kalian tambah lagu favorit minggu ini.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white p-5 shadow-sm">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Total lagu</p>
                                            <p className="text-2xl font-semibold text-purple-800">{playlist?.total_tracks ?? 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Tambahan minggu ini</p>
                                            <p className="text-xl font-semibold text-purple-700">+{playlist?.new_this_week ?? 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Energi rata-rata</p>
                                            <p className="text-xl font-semibold text-purple-700">{formatEnergy(playlist?.average_energy)}</p>
                                        </div>
                                    </div>

                                    {playlist?.last_added && (
                                        <div className="mt-5 rounded-2xl border border-purple-100 bg-purple-50 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-purple-400">Lagu terbaru</p>
                                            <div className="mt-2 flex flex-col gap-1 text-sm text-purple-800">
                                                <span className="font-semibold">{playlist.last_added.title}</span>
                                                <span className="text-purple-500">{playlist.last_added.artists.join(", ")}</span>
                                                {playlist.last_added.added_at && (
                                                    <span className="text-xs text-purple-400">
                                                        Ditambah {formatDateTime(playlist.last_added.added_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {playlist?.external_url && (
                                        <a
                                            href={playlist.external_url}
                                            target="_blank"
                                            rel="noopener"
                                            className="mt-5 inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                                        >
                                            Buka di Spotify
                                        </a>
                                    )}
                                </div>

                                {highlightedTracks.length > 0 && (
                                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.28em] text-purple-400">
                                            Dengarkan cuplikan favorit
                                        </p>
                                        <div className="mt-4 space-y-3">
                                            {highlightedTracks.map((track) => (
                                                <div
                                                    key={track.id}
                                                    className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 shadow-inner"
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-purple-800">{track.name}</p>
                                                            <p className="text-xs text-purple-500">
                                                                {track.artists.join(", ")}
                                                            </p>
                                                        </div>
                                                        {track.added_at && (
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-500 shadow-sm">
                                                                Ditambahkan {formatDate(track.added_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex flex-col gap-2">
                                                        {track.preview_url ? (
                                                            <audio
                                                                className="w-full"
                                                                controls
                                                                preload="none"
                                                                src={track.preview_url}
                                                            >
                                                                Browser kamu tidak mendukung audio HTML5.
                                                            </audio>
                                                        ) : (
                                                            <p className="text-xs text-purple-500">
                                                                Preview tidak tersedia, buka di Spotify untuk memutar penuh.
                                                            </p>
                                                        )}
                                                        {track.external_url && (
                                                            <a
                                                                href={track.external_url}
                                                                target="_blank"
                                                                rel="noopener"
                                                                className="inline-flex items-center justify-center rounded-full border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-600 transition hover:border-purple-300 hover:text-purple-700"
                                                            >
                                                                Buka di Spotify
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                {playlistEmbedUrl ? (
                                    <div className="overflow-hidden rounded-xl border border-purple-100 shadow-inner">
                                        <iframe
                                            key={playlistEmbedUrl}
                                            src={playlistEmbedUrl}
                                            width="100%"
                                            height="352"
                                            frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                            title="Spotify playlist embed"
                                        />
                                    </div>
                                ) : (
                                    <p className="rounded-xl border border-dashed border-purple-200 bg-purple-50/80 p-4 text-sm text-purple-500">
                                        Hubungkan Spotify untuk memutar playlist langsung tanpa meninggalkan halaman ini.
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Progress Weekly Mix</p>
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">
                                        Target {playlist?.target_weekly ?? 6} lagu/minggu
                                    </span>
                                </div>
                                <div>
                                    <div className="h-3 rounded-full bg-purple-100">
                                        <div
                                            className="h-3 rounded-full bg-purple-500 transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    ((playlist?.new_this_week ?? 0) / (playlist?.target_weekly ?? 6)) * 100,
                                                    100,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-purple-500">
                                        Tambah {Math.max((playlist?.target_weekly ?? 6) - (playlist?.new_this_week ?? 0), 0)} lagu lagi biar challenge minggu ini penuh.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void fetchDashboard()}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-600 hover:border-purple-300"
                                >
                                    Segarkan Data
                                </button>
                            </div>
                        </section>
                        <section className="grid gap-5 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm md:grid-cols-[1fr_1.25fr]">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-white p-2 text-blue-500 shadow-sm">
                                        <Heart className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-900">Mood Check-In</h3>
                                        <p className="text-sm text-blue-600">
                                            Tebak mood pasangan dari lagu terakhir yang mereka putar.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    {moods.length === 0 && (
                                        <p className="rounded-2xl border border-blue-100 bg-white p-4 text-sm text-blue-500">
                                            {moodTrans.empty ?? "No mood snapshots yet. Share your first vibe!"}
                                        </p>
                                    )}

                                    {moods.map((snapshot) => (
                                        <button
                                            key={snapshot.id}
                                            type="button"
                                            onClick={() => setSelectedMoodId(snapshot.id)}
                                            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                                                selectedMood?.id === snapshot.id
                                                    ? "border-blue-400 bg-white shadow-sm"
                                                    : "border-blue-100 bg-white/70 hover:border-blue-200"
                                            }`}
                                        >
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                                                    {snapshot.user_label}
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-blue-800">{snapshot.track}</p>
                                                <p className="text-xs text-blue-500">{snapshot.artists}</p>
                                            </div>
                                            <span className="text-xs font-semibold text-blue-600">
                                                {formatEnergy(snapshot.energy)} energi
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                {selectedMood ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                                                    {selectedMood.user_label}
                                                </p>
                                                <h4 className="text-lg font-semibold text-blue-900">
                                                    {selectedMood.mood_tone}
                                                </h4>
                                                <p className="text-sm text-blue-600">{selectedMood.affection}</p>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 text-blue-600">
                                                <Clock className="h-5 w-5" />
                                                <span className="text-xs">
                                                    Diputar {selectedMood.played_at ? formatDateTime(selectedMood.played_at) : "baru saja"}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.25em] text-blue-400">Rekomendasi aksi manis</p>
                                            <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                                                Kirim voice note 30 detik sambil putar lagu yang sama, lalu ajak tebak lirik via call.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => void fetchDashboard()}
                                            className="inline-flex items-center justify-center rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 hover:border-blue-300"
                                        >
                                            Segarkan Mood
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-blue-500">Pilih salah satu snapshot mood untuk lihat rekomendasi aksi.</p>
                                )}
                            </div>
                        </section>
                        <section className="grid gap-5 rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-white p-2 text-rose-500 shadow-sm">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-rose-900">Surprise Song Drops</h3>
                                        <p className="text-sm text-rose-600">
                                            Jadwalkan lagu kejutan yang otomatis muncul sesuai momen.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {surpriseDrops.length === 0 && (
                                        <p className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-rose-500">
                                            {(surprise as any).empty ?? "No surprise drops scheduled yet. Plan your first musical surprise!"}
                                        </p>
                                    )}

                                    {surpriseDrops.map((drop) => (
                                        <div
                                            key={drop.id}
                                            className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-rose-900">{drop.track}</p>
                                                    <p className="text-xs text-rose-500">{drop.artists}</p>
                                                </div>
                                                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                                                    Oleh {drop.curator ?? "Kamu"}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs text-rose-400">
                                                Tayang {formatDateTime(drop.scheduled_for)}
                                            </p>
                                            {drop.note && <p className="mt-2 text-sm text-rose-700">{drop.note}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-rose-600">
                                    <Calendar className="h-5 w-5" />
                                    <p className="text-xs uppercase tracking-[0.28em]">Jadwalkan lagu</p>
                                </div>
                                <p className="text-sm text-rose-600">
                                    Gunakan tombol berikut untuk menambahkan kejutan baru setelah kamu pilih lagu di Spotify.
                                </p>
                                <button
                                    type="button"
                                    onClick={openSurpriseModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Jadwalkan lagu kejutan
                                </button>
                                {!isConnected && (
                                    <p className="text-xs text-rose-400">
                                        Sambungkan Spotify dulu supaya bisa menjadwalkan lagu otomatis.
                                    </p>
                                )}
                            </div>
                        </section>
                        <section className="grid gap-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:grid-cols-[0.95fr_1.05fr]">
                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                                        <Headphones className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-emerald-900">Listening Party Mini</h3>
                                        <p className="text-sm text-emerald-600">
                                            Lihat kapan kalian lagi denger lagu yang sama dan gabung sesi bareng.
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                    {listening?.is_live ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-xl bg-white p-3 text-emerald-600 shadow-sm">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-900">{listening.track}</p>
                                                    <p className="text-xs text-emerald-600">{listening.artists}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-xs text-emerald-600">
                                                <span>Host: {listening.host ?? "Pasangan"}</span>
                                                <span>{listening.started_at ?? "Baru mulai"}</span>
                                                <span>{listening.listeners ?? 1} pendengar</span>
                                            </div>
                                            {liveTrackEmbedUrl ? (
                                                <div className="mt-4 overflow-hidden rounded-xl border border-emerald-100 shadow-inner">
                                                    <iframe
                                                        key={liveTrackEmbedUrl}
                                                        src={liveTrackEmbedUrl}
                                                        width="100%"
                                                        height="152"
                                                        frameBorder="0"
                                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                        loading="lazy"
                                                        title="Spotify track embed"
                                                    />
                                                </div>
                                            ) : (
                                                listening?.external_url && (
                                                    <a
                                                        href={listening.external_url}
                                                        target="_blank"
                                                        rel="noopener"
                                                        className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300"
                                                    >
                                                        Buka sesi di Spotify
                                                    </a>
                                                )
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => void handleJoinPlayback()}
                                                disabled={joiningPlayback}
                                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 disabled:cursor-not-allowed disabled:bg-emerald-400/70"
                                            >
                                                <Play className="h-4 w-4" />
                                                {joiningPlayback ? "Menyambungkan..." : "Gabung playback"}
                                            </button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-emerald-600">
                                            Tidak ada sesi live sekarang, tapi kamu bisa jadwalkan lewat Surprise Song Drops.
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void fetchDashboard()}
                                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 hover:border-emerald-300"
                                >
                                    Perbarui status playback
                                </button>
                            </div>

                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">Rencana listening bareng</p>
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                                        <p className="font-semibold text-emerald-900">Challenge akhir pekan</p>
                                        <p className="mt-1">Jumat malam pukul 20.00, pilih 5 lagu mellow versi kamu, pasangan tebak siapa penyanyinya.</p>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                                        <p className="font-semibold text-emerald-900">Mode fokus duo</p>
                                        <p className="mt-1">Sinkronkan playback untuk sesi belajar 45 menit, lanjut break call 15 menit.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="grid gap-5 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm md:grid-cols-[1.05fr_0.95fr]">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-white p-2 text-amber-500 shadow-sm">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-amber-900">Memory Capsule</h3>
                                        <p className="text-sm text-amber-600">
                                            Simpan highlight lagu penting dan putar preview 30 detik kapan pun.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {memoryCapsules.length === 0 && (
                                        <p className="rounded-2xl border border-amber-100 bg-white p-4 text-sm text-amber-600">
                                            {(capsule as any).empty ?? "No memory capsules yet. Start preserving your musical memories!"}
                                        </p>
                                    )}

                                    {memoryCapsules.map((capsule) => (
                                        <div
                                            key={capsule.id}
                                            className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-900">{capsule.track}</p>
                                                    <p className="text-xs text-amber-600">{capsule.artists}</p>
                                                </div>
                                                {capsule.moment && (
                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                                                        {capsule.moment}
                                                    </span>
                                                )}
                                            </div>
                                            {capsule.description && (
                                                <p className="mt-2 text-sm text-amber-700">{capsule.description}</p>
                                            )}
                                            <p className="mt-2 text-xs text-amber-500">Disimpan {formatDate(capsule.saved_at)}</p>
                                            {capsule.preview_url && (
                                                <audio className="mt-3 w-full" controls src={capsule.preview_url}>
                                                    Browser kamu tidak mendukung audio HTML5.
                                                </audio>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm">
                                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                                    <p className="text-base font-semibold text-amber-900">Simpan momen baru</p>
                                    <p className="mt-1">
                                        Tandai highlight lagu dan tuliskan kenangannya supaya mudah diputar lagi kapan pun.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openCapsuleModal}
                                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Simpan kapsul memori
                                    </button>
                                    {!isConnected && (
                                        <p className="mt-2 text-xs text-amber-500">
                                            Hubungkan Spotify terlebih dahulu untuk menyimpan kapsul langsung dari lagu pilihanmu.
                                        </p>
                                    )}
                                </div>
                                {/* <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-amber-400">Integrasi berikutnya</p>
                                    <ul className="mt-2 space-y-2 text-sm text-amber-700">
                                        <li>
                                            - Tambah kapsul lewat{' '}
                                            <code>{`POST /spaces/${space.slug}/spotify/capsules`}</code>.
                                        </li>
                                        <li>
                                            - Jadwalkan kejutan via{' '}
                                            <code>{`POST /spaces/${space.slug}/spotify/surprises`}</code>.
                                        </li>
                                        <li>- Otomatiskan reminder tahunan dari data kapsul.</li>
                                    </ul>
                                </div> */}
                                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-xs text-amber-600">
                                    Token OAuth sudah tersimpan otomatis setelah kamu menghubungkan Spotify. Gunakan endpoint di atas atau job terjadwal untuk memicu pengalaman tambahan.
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <Modal
                show={surpriseModalOpen}
                onClose={() => {
                    setSurpriseModalOpen(false);
                    setSurpriseError(null);
                }}
                maxWidth="lg"
            >
                <form onSubmit={handleSurpriseSubmit} className="space-y-5 p-6">
                    <div>
                        <h3 className="text-lg font-semibold text-rose-900">Tambah Surprise Song Drop</h3>
                        <p className="mt-1 text-sm text-rose-600">
                            Tempel tautan lagu Spotify, pilih jadwal pemutaran, dan tambahkan pesan manis untuk pasanganmu.
                        </p>
                    </div>
                    {surpriseError && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">{surpriseError}</p>}
                    <div className="space-y-2">
                        <label htmlFor="surprise-track" className="text-sm font-medium text-rose-900">
                            Lagu Spotify
                        </label>
                        <input
                            id="surprise-track"
                            type="text"
                            required
                            value={surpriseForm.trackInput}
                            onChange={(event) =>
                                setSurpriseForm((prev) => ({
                                    ...prev,
                                    trackInput: event.target.value,
                                }))
                            }
                            placeholder="https://open.spotify.com/track/..."
                            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="surprise-schedule" className="text-sm font-medium text-rose-900">
                            Jadwalkan untuk
                        </label>
                        <input
                            id="surprise-schedule"
                            type="datetime-local"
                            required
                            value={surpriseForm.scheduledFor}
                            onChange={(event) =>
                                setSurpriseForm((prev) => ({
                                    ...prev,
                                    scheduledFor: event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="surprise-note" className="text-sm font-medium text-rose-900">
                            Catatan kejutan (opsional)
                        </label>
                        <textarea
                            id="surprise-note"
                            rows={3}
                            value={surpriseForm.note}
                            onChange={(event) =>
                                setSurpriseForm((prev) => ({
                                    ...prev,
                                    note: event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setSurpriseModalOpen(false);
                                setSurpriseError(null);
                            }}
                            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:border-rose-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={surpriseSubmitting}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-rose-400/70"
                        >
                            {surpriseSubmitting ? "Menyimpan..." : "Jadwalkan"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                show={capsuleModalOpen}
                onClose={() => {
                    setCapsuleModalOpen(false);
                    setCapsuleError(null);
                }}
                maxWidth="lg"
            >
                <form onSubmit={handleCapsuleSubmit} className="space-y-5 p-6">
                    <div>
                        <h3 className="text-lg font-semibold text-amber-900">Buat Memory Capsule</h3>
                        <p className="mt-1 text-sm text-amber-600">
                            Simpan cerita singkat tentang lagu yang berarti untuk kalian. Kami ambil preview 30 detik otomatis jika tersedia.
                        </p>
                    </div>
                    {capsuleError && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">{capsuleError}</p>}
                    <div className="space-y-2">
                        <label htmlFor="capsule-track" className="text-sm font-medium text-amber-900">
                            Lagu Spotify
                        </label>
                        <input
                            id="capsule-track"
                            type="text"
                            required
                            value={capsuleForm.trackInput}
                            onChange={(event) =>
                                setCapsuleForm((prev) => ({
                                    ...prev,
                                    trackInput: event.target.value,
                                }))
                            }
                            placeholder="https://open.spotify.com/track/..."
                            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="capsule-moment" className="text-sm font-medium text-amber-900">
                            Judul momen (opsional)
                        </label>
                        <input
                            id="capsule-moment"
                            type="text"
                            value={capsuleForm.moment}
                            onChange={(event) =>
                                setCapsuleForm((prev) => ({
                                    ...prev,
                                    moment: event.target.value,
                                }))
                            }
                            placeholder="Contoh: Anniversary pertama"
                            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="capsule-description" className="text-sm font-medium text-amber-900">
                            Cerita singkat (opsional)
                        </label>
                        <textarea
                            id="capsule-description"
                            rows={4}
                            value={capsuleForm.description}
                            onChange={(event) =>
                                setCapsuleForm((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                            placeholder="Tulis kenapa lagu ini spesial..."
                            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="capsule-date" className="text-sm font-medium text-amber-900">
                            Tanggal momen (opsional)
                        </label>
                        <input
                            id="capsule-date"
                            type="date"
                            value={capsuleForm.savedAt}
                            onChange={(event) =>
                                setCapsuleForm((prev) => ({
                                    ...prev,
                                    savedAt: event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setCapsuleModalOpen(false);
                                setCapsuleError(null);
                            }}
                            className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600 hover:border-amber-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={capsuleSubmitting}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-amber-400/70"
                        >
                            {capsuleSubmitting ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
