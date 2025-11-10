import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    AlertTriangle,
    Disc3,
    Heart,
    Loader2,
    Music4,
    Pause,
    Play,
    RefreshCcw,
    Search,
    SkipBack,
    SkipForward,
    UserPlus,
} from "lucide-react";
import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "@/hooks/useTranslation";

type SpaceSummary = {
    id: number;
    slug: string;
    title: string;
};

type Props = {
    space: SpaceSummary;
};

type SpotifyConnection = {
    user_id: number | null;
    name: string;
    is_current_user: boolean;
    connected_at?: string | null;
};

type SpotifyPlaylistSummary = {
    id: string;
    name: string;
    owner?: string | null;
    external_url?: string | null;
    track_total?: number | null;
};

type SpotifyTrack = {
    id: string;
    uri: string;
    name: string;
    artists: string;
    album_image?: string | null;
    duration_ms?: number | null;
};

type SpotifyPlayback = {
    is_playing: boolean;
    progress_ms?: number | null;
    duration_ms?: number | null;
    name?: string | null;
    artists?: string | null;
    album_image?: string | null;
};

type SpotifyArtist = {
    id: string;
    name: string;
    image?: string | null;
    genres: string[];
};

type Compatibility = {
    score: number;
    details?: {
        track_overlap?: number;
        artist_overlap?: number;
    };
};

type SpotifySummaryResponse = {
    connected: boolean;
    connections: SpotifyConnection[];
    message?: string | null;
    playlist?: SpotifyPlaylistSummary | null;
    playlist_tracks: SpotifyTrack[];
    playback: SpotifyPlayback;
    top_tracks: SpotifyTrack[];
    top_artists: SpotifyArtist[];
    compatibility?: Compatibility | null;
    player_token?: string | null;
    player_token_expires_at?: string | null;
    authorize_url: string;
};

type SpotifySearchResponse = {
    results: SpotifyTrack[];
};

type TabKey = "home" | "search" | "playlist" | "stats";

declare global {
    interface Window {
        Spotify?: any;
        onSpotifyWebPlaybackSDKReady?: () => void;
    }
}

const formatDuration = (durationMs?: number | null): string => {
    if (!durationMs || durationMs <= 0) {
        return "--:--";
    }

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
};

const formatString = (template: string, replacements: Record<string, string | number>): string =>
    Object.entries(replacements).reduce(
        (carry, [key, value]) => carry.replace(new RegExp(`:${key}`, "g"), String(value)),
        template,
    );

export default function CoupleMusicSpace({ space }: Props) {
    const { t } = useTranslation("app");
    const translate = (key: string, fallback?: string) =>
        t(`spotify.music_space.${key}`, fallback ?? key);
    const translateTabs = (key: string, fallback?: string) =>
        t(`spotify.music_space.tabs.${key}`, fallback ?? key);
    const translateConnect = (key: string, fallback?: string) =>
        t(`spotify.music_space.connect.${key}`, fallback ?? key);
    const translatePlayer = (key: string, fallback?: string) =>
        t(`spotify.music_space.player.${key}`, fallback ?? key);
    const translateSearch = (key: string, fallback?: string) =>
        t(`spotify.music_space.search.${key}`, fallback ?? key);
    const translatePlaylist = (key: string, fallback?: string) =>
        t(`spotify.music_space.playlist.${key}`, fallback ?? key);
    const translateStats = (key: string, fallback?: string) =>
        t(`spotify.music_space.stats.${key}`, fallback ?? key);
    const translateErrors = (key: string, fallback?: string) =>
        t(`spotify.music_space.errors.${key}`, fallback ?? key);
    const translateCompatibility = (key: string, fallback?: string) =>
        t(`spotify.music_space.compatibility.${key}`, fallback ?? key);

    const defaultPlaylistName = translatePlaylist("default_name", "Our Love Playlist");
    const defaultPlaylistDescription = translatePlaylist(
        "default_description",
        "Songs that remind us of each other.",
    );

    const [activeTab, setActiveTab] = useState<TabKey>("home");
    const [summary, setSummary] = useState<SpotifySummaryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
    const [creatingPlaylist, setCreatingPlaylist] = useState<boolean>(false);
    const [playlistName, setPlaylistName] = useState<string>(defaultPlaylistName);
    const [playlistDescription, setPlaylistDescription] = useState<string>(defaultPlaylistDescription);
    const [playerDeviceId, setPlayerDeviceId] = useState<string | null>(null);
    const [playerReady, setPlayerReady] = useState<boolean>(false);
    const [isProcessingPlayback, setIsProcessingPlayback] = useState<boolean>(false);

    const playlistDefaultsRef = useRef({
        name: defaultPlaylistName,
        description: defaultPlaylistDescription,
    });

    useEffect(() => {
        setPlaylistName((current) =>
            current === playlistDefaultsRef.current.name ? defaultPlaylistName : current,
        );
        setPlaylistDescription((current) =>
            current === playlistDefaultsRef.current.description
                ? defaultPlaylistDescription
                : current,
        );

        playlistDefaultsRef.current = {
            name: defaultPlaylistName,
            description: defaultPlaylistDescription,
        };
    }, [defaultPlaylistName, defaultPlaylistDescription]);

    const tabs: { key: TabKey; label: string }[] = useMemo(
        () => [
            { key: "home", label: translateTabs("home") },
            { key: "search", label: translateTabs("search") },
            { key: "playlist", label: translateTabs("playlist") },
            { key: "stats", label: translateTabs("stats") },
        ],
        [translateTabs],
    );

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<SpotifySummaryResponse>(
                route("spotify.music.summary", { space: space.slug }),
            );
            setSummary(response.data);
        } catch (err) {
            console.error("Failed to load Spotify summary", err);
            setError(translateErrors("summary_failed"));
        } finally {
            setLoading(false);
        }
    }, [space.slug, translateErrors]);

    useEffect(() => {
        void fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        if (!summary?.player_token || typeof window === "undefined") {
            return;
        }

        const initializePlayer = () => {
            if (!window.Spotify || playerReady) {
                return;
            }

            const player = new window.Spotify.Player({
                name: "MySpaceLove Couple Player",
                getOAuthToken: (cb: (token: string) => void) => cb(summary.player_token as string),
                volume: 0.7,
            });

            player.addListener("ready", ({ device_id }: { device_id: string }) => {
                setPlayerDeviceId(device_id);
                setPlayerReady(true);
            });

            player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
                if (playerDeviceId === device_id) {
                    setPlayerDeviceId(null);
                }
            });

            player.addListener("initialization_error", ({ message }: { message: string }) => {
                console.error("Spotify player initialization error", message);
            });

            player.addListener("authentication_error", ({ message }: { message: string }) => {
                console.error("Spotify player authentication error", message);
            });

            player.connect();
        };

        if (window.Spotify) {
            initializePlayer();
            return;
        }

        const existing = document.getElementById("spotify-player");

        if (!existing) {
            const script = document.createElement("script");
            script.id = "spotify-player";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
        }

        window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }, [summary?.player_token, playerDeviceId, playerReady]);
    const controlPlayback = useCallback(
        async (actionKey: "play" | "pause" | "next" | "previous", trackId?: string) => {
            if (!summary?.connected) {
                setError(translateErrors("connection_required"));
                return;
            }

            setIsProcessingPlayback(true);

            try {
                await axios.post(
                    route("spotify.music.player.control", {
                        space: space.slug,
                        action: actionKey,
                    }),
                    {
                        track_id: trackId,
                        device_id: playerDeviceId,
                    },
                );

                void fetchSummary();
            } catch (err) {
                console.error("Playback control failed", err);
                setError(translateErrors("playback_failed"));
            } finally {
                setIsProcessingPlayback(false);
            }
        },
        [fetchSummary, playerDeviceId, space.slug, summary?.connected, translateErrors],
    );

    const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!summary?.connected) {
            setSearchError(translateErrors("connection_required"));
            return;
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const response = await axios.get<SpotifySearchResponse>(
                route("spotify.music.search", { space: space.slug }),
                {
                    params: {
                        q: searchQuery,
                        limit: 12,
                    },
                },
            );
            setSearchResults(response.data.results);
        } catch (err) {
            console.error("Spotify search failed", err);
            setSearchError(translateErrors("summary_failed"));
        } finally {
            setSearchLoading(false);
        }
    };

    const addTrackToPlaylist = async (track: SpotifyTrack) => {
        if (!summary?.playlist?.id) {
            setError(translateErrors("playlist_missing", translatePlaylist("empty")));
            return;
        }

        try {
            await axios.post(
                route("spotify.music.playlists.tracks.add", {
                    space: space.slug,
                    playlist: summary.playlist.id,
                }),
                {
                    uris: [track.uri],
                },
            );

            setSummary((current) =>
                current
                    ? {
                          ...current,
                          playlist_tracks: [track, ...current.playlist_tracks],
                      }
                    : current,
            );
        } catch (err) {
            console.error("Failed to add track", err);
            setError(translateErrors("add_failed"));
        }
    };

    const removeTrackFromPlaylist = async (track: SpotifyTrack) => {
        if (!summary?.playlist?.id) {
            return;
        }

        try {
            await axios.delete(
                route("spotify.music.playlists.tracks.remove", {
                    space: space.slug,
                    playlist: summary.playlist.id,
                }),
                {
                    data: {
                        uris: [track.uri],
                    },
                },
            );

            setSummary((current) =>
                current
                    ? {
                          ...current,
                          playlist_tracks: current.playlist_tracks.filter((item) => item.uri !== track.uri),
                      }
                    : current,
            );
        } catch (err) {
            console.error("Failed to remove track", err);
            setError(translateErrors("remove_failed"));
        }
    };

    const createPlaylist = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setCreatingPlaylist(true);

        try {
            await axios.post(
                route("spotify.music.playlists.create", { space: space.slug }),
                {
                    name: playlistName,
                    description: playlistDescription,
                },
            );

            await fetchSummary();
        } catch (err) {
            console.error("Failed to create playlist", err);
            setError(translateErrors("create_playlist_failed"));
        } finally {
            setCreatingPlaylist(false);
        }
    };

    const heroSubtitle = translate("header.subtitle");
    const openInSpotifyLabel = translatePlaylist("open_in_spotify", "Open in Spotify");
    const coverAlt = translatePlayer("cover_alt", "Spotify track cover art");
    const compatibilityScore = summary?.compatibility?.score ?? null;
    const compatibilityDetails = summary?.compatibility?.details;

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-slate-900">
                        {translate("header.title")}
                    </h2>
                    <p className="text-sm text-slate-500">{heroSubtitle}</p>
                </div>
            }
        >
            <Head title={`${translate("meta_title")} · ${space.title}`} />

            <div className="bg-gradient-to-br from-[#f3f1ed] via-white to-[#e6f0ed]">
                <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                    <section className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow-xl">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#498386]/10 px-4 py-2 text-sm font-semibold text-[#498386]">
                                    <Music4 className="h-4 w-4" />
                                    {space.title}
                                </span>
                                <h3 className="text-2xl font-semibold text-slate-900">
                                    {translate("header.title")}
                                </h3>
                                <p className="text-sm text-slate-600">{heroSubtitle}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => void fetchSummary()}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-medium text-[#498386] transition hover:bg-[#498386]/10"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    {t("common.actions.refresh", "Refresh")}
                                </button>
                                <a
                                    href={summary?.authorize_url}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#498386] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d]"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {translateConnect("connect_button")}
                                </a>
                            </div>
                        </div>
                    </section>
                    <nav className="flex gap-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#498386]/50 ${
                                    activeTab === tab.key
                                        ? "border-[#498386] bg-[#498386] text-white shadow"
                                        : "border-[#498386]/30 bg-white/70 text-[#498386] hover:bg-[#498386]/10"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#498386]/20 bg-white/80 p-10 text-center text-slate-600 shadow">
                            <Loader2 className="h-6 w-6 animate-spin text-[#498386]" />
                            <p>{t("common.states.loading", "Loading...")}</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    ) : summary ? (
                        <div className="space-y-10">
                            {activeTab === "home" && (
                                <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                                    <div className="space-y-6">
                                        <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                            <div className="flex items-center gap-3">
                                                <Heart className="h-6 w-6 text-[#498386]" />
                                                <div>
                                                    <h4 className="text-lg font-semibold text-slate-900">
                                                        {translateConnect("headline")}
                                                    </h4>
                                                    <p className="text-sm text-slate-600">
                                                        {translateConnect("description")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                <div className="rounded-2xl border border-[#498386]/15 bg-white/70 p-4">
                                                    {summary.connected ? (
                                                        <p className="text-sm font-medium text-[#498386]">
                                                            {formatString(translateConnect("connected"), {
                                                                name:
                                                                    summary.connections.find((connection) => connection.is_current_user)?.name ??
                                                                    "—",
                                                            })}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-amber-700">
                                                            {summary.message ?? translateErrors("connection_required")}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="rounded-2xl border border-[#498386]/15 bg-white/70 p-4">
                                                    <p className="text-xs uppercase tracking-[0.3em] text-[#498386]/70">
                                                        {translateConnect("partner_status")}
                                                    </p>
                                                    <ul className="mt-3 space-y-2 text-sm">
                                                        {summary.connections.map((connection) => (
                                                            <li
                                                                key={`connection-${connection.user_id ?? connection.name}`}
                                                                className="flex items-center justify-between rounded-xl border border-[#498386]/10 bg-white/70 px-3 py-2"
                                                            >
                                                                <span className="font-medium text-slate-800">
                                                                    {connection.name}
                                                                    {connection.is_current_user && (
                                                                        <span className="ml-2 rounded-full bg-[#498386]/10 px-2 py-0.5 text-xs font-semibold text-[#498386]">
                                                                            {t("common.actions.connect")}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    {connection.connected_at
                                                                        ? new Date(connection.connected_at).toLocaleDateString()
                                                                        : translateConnect("partner_missing")}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                            <div className="flex items-center gap-3">
                                                <Disc3 className="h-6 w-6 text-[#498386]" />
                                                <h4 className="text-lg font-semibold text-slate-900">
                                                    {translatePlayer("title")}
                                                </h4>
                                            </div>
                                            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
                                                <div className="flex-shrink-0">
                                                    {summary.playback.album_image ? (
                                                        <img
                                                            src={summary.playback.album_image}
                                                            alt={summary.playback.name ?? coverAlt}
                                                            className="h-32 w-32 rounded-2xl object-cover shadow"
                                                        />
                                                    ) : (
                                                        <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-[#498386]/30 bg-white/70 text-[#498386]">
                                                            <Music4 className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h5 className="text-xl font-semibold text-slate-900">
                                                        {summary.playback.name ?? translatePlayer("empty")}
                                                    </h5>
                                                    {summary.playback.artists && (
                                                        <p className="text-sm text-slate-600">{summary.playback.artists}</p>
                                                    )}
                                                    {summary.playback.duration_ms && (
                                                        <p className="text-xs text-slate-500">
                                                            {formatDuration(summary.playback.progress_ms)} / {formatDuration(summary.playback.duration_ms)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => controlPlayback("previous")}
                                                    disabled={isProcessingPlayback}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-semibold text-[#498386] transition hover:bg-[#498386]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <SkipBack className="h-4 w-4" />
                                                    {translatePlayer("previous")}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        summary.playback.is_playing
                                                            ? controlPlayback("pause")
                                                            : controlPlayback("play")
                                                    }
                                                    disabled={isProcessingPlayback}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#498386] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d] disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {summary.playback.is_playing ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                    {summary.playback.is_playing
                                                        ? translatePlayer("pause")
                                                        : translatePlayer("play")}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => controlPlayback("next")}
                                                    disabled={isProcessingPlayback}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-semibold text-[#498386] transition hover:bg-[#498386]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {translatePlayer("next")}
                                                    <SkipForward className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-[0.3em] text-[#498386]/70">
                                                        {translateStats("compatibility")}
                                                    </p>
                                                    <h4 className="text-2xl font-semibold text-slate-900">
                                                        {compatibilityScore !== null
                                                            ? formatString(translateCompatibility("badge"), {
                                                                  score: compatibilityScore,
                                                              })
                                                            : translateStats("compatibility_empty")}
                                                    </h4>
                                                </div>
                                            </div>
                                            {compatibilityScore !== null && (
                                                <div className="mt-4 space-y-2 text-sm text-slate-600">
                                                    <p>
                                                        {formatString(translateStats("compatibility_description"), {
                                                            score: compatibilityScore,
                                                        })}
                                                    </p>
                                                    {compatibilityDetails && (
                                                        <p className="text-xs text-[#498386]">
                                                            {formatString(translateCompatibility("details"), {
                                                                tracks: compatibilityDetails.track_overlap ?? 0,
                                                                artists: compatibilityDetails.artist_overlap ?? 0,
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                            <h4 className="text-lg font-semibold text-slate-900">
                                                {translateStats("top_tracks")}
                                            </h4>
                                            <ul className="mt-4 space-y-3">
                                                {summary.top_tracks.length === 0 ? (
                                                    <li className="text-sm text-slate-500">
                                                        {translateStats("top_tracks_empty")}
                                                    </li>
                                                ) : (
                                                    summary.top_tracks.slice(0, 5).map((track) => (
                                                        <li key={track.id} className="flex items-center gap-3">
                                                            {track.album_image ? (
                                                                <img
                                                                    src={track.album_image}
                                                                    alt={track.name}
                                                                    className="h-12 w-12 rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-[#498386]/30 text-[#498386]">
                                                                    <Music4 className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{track.name}</p>
                                                                <p className="text-xs text-slate-500">{track.artists}</p>
                                                            </div>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            )}
                            {activeTab === "search" && (
                                <section className="space-y-6">
                                    <form
                                        onSubmit={handleSearch}
                                        className="flex flex-col gap-3 rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow md:flex-row md:items-center"
                                    >
                                        <div className="flex flex-1 items-center gap-3 rounded-full border border-[#498386]/30 bg-white/80 px-4 py-2">
                                            <Search className="h-4 w-4 text-[#498386]" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(event) => setSearchQuery(event.target.value)}
                                                placeholder={translateSearch("placeholder")}
                                                className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#498386] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d]"
                                        >
                                            {searchLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                            {translateSearch("button")}
                                        </button>
                                    </form>
                                    {searchError && (
                                        <div className="flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{searchError}</span>
                                        </div>
                                    )}
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {searchResults.length === 0 && !searchLoading ? (
                                            <div className="col-span-full rounded-3xl border border-dashed border-[#498386]/30 bg-white/70 p-8 text-center text-slate-600">
                                                {translateSearch("empty")}
                                            </div>
                                        ) : (
                                            searchResults.map((track) => (
                                                <div
                                                    key={track.id}
                                                    className="flex flex-col gap-3 rounded-3xl border border-[#498386]/20 bg-white/80 p-4 shadow"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {track.album_image ? (
                                                            <img
                                                                src={track.album_image}
                                                                alt={track.name}
                                                                className="h-16 w-16 rounded-2xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-[#498386]/30 text-[#498386]">
                                                                <Music4 className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{track.name}</p>
                                                            <p className="text-xs text-slate-500">{track.artists}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => addTrackToPlaylist(track)}
                                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#498386]/30 px-3 py-2 text-xs font-semibold text-[#498386] transition hover:bg-[#498386]/10"
                                                        >
                                                            {translateSearch("add")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => controlPlayback("play", track.id)}
                                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#498386] px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#3c6b6d]"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            {translateSearch("play")}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            )}

                            {activeTab === "playlist" && (
                                <section className="space-y-6">
                                    {summary.playlist ? (
                                        <div className="space-y-6">
                                            <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.3em] text-[#498386]/70">
                                                            {translatePlaylist("title")}
                                                        </p>
                                                        <h4 className="text-2xl font-semibold text-slate-900">
                                                            {summary.playlist.name}
                                                        </h4>
                                                        {summary.playlist.owner && (
                                                            <p className="text-sm text-slate-500">{summary.playlist.owner}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {summary.playlist.external_url && (
                                                            <a
                                                                href={summary.playlist.external_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#498386]/30 px-4 py-2 text-sm font-semibold text-[#498386] transition hover:bg-[#498386]/10"
                                                            >
                                                                <Music4 className="h-4 w-4" />
                                                                {openInSpotifyLabel}
                                                            </a>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveTab("search")}
                                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#498386] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d]"
                                                        >
                                                            <Search className="h-4 w-4" />
                                                            {translatePlaylist("create_cta")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {summary.playlist_tracks.length === 0 ? (
                                                    <div className="rounded-3xl border border-dashed border-[#498386]/30 bg-white/70 p-8 text-center text-slate-600">
                                                        {translatePlaylist("tracks_empty")}
                                                    </div>
                                                ) : (
                                                    summary.playlist_tracks.map((track) => (
                                                        <div
                                                            key={`${track.id}-${track.uri}`}
                                                            className="flex flex-col gap-3 rounded-3xl border border-[#498386]/15 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {track.album_image ? (
                                                                    <img
                                                                        src={track.album_image}
                                                                        alt={track.name}
                                                                        className="h-14 w-14 rounded-2xl object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-[#498386]/30 text-[#498386]">
                                                                        <Music4 className="h-4 w-4" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-900">{track.name}</p>
                                                                    <p className="text-xs text-slate-500">{track.artists}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-slate-500">
                                                                    {formatDuration(track.duration_ms)}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTrackFromPlaylist(track)}
                                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
                                                                >
                                                                    {translatePlaylist("remove")}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <form
                                            onSubmit={createPlaylist}
                                            className="space-y-4 rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow"
                                        >
                                            <h4 className="text-lg font-semibold text-slate-900">
                                                {translatePlaylist("create_cta")}
                                            </h4>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {translatePlaylist("create_modal.name_label")}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={playlistName}
                                                    onChange={(event) => setPlaylistName(event.target.value)}
                                                    placeholder={translatePlaylist(
                                                        "create_modal.name_placeholder",
                                                        defaultPlaylistName,
                                                    )}
                                                    className="w-full rounded-xl border border-[#498386]/20 px-4 py-2 text-sm text-slate-800 focus:border-[#498386] focus:outline-none focus:ring-2 focus:ring-[#498386]/30"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {translatePlaylist("create_modal.description_label")}
                                                </label>
                                                <textarea
                                                    value={playlistDescription}
                                                    onChange={(event) => setPlaylistDescription(event.target.value)}
                                                    placeholder={translatePlaylist(
                                                        "create_modal.description_placeholder",
                                                        defaultPlaylistDescription,
                                                    )}
                                                    className="min-h-[80px] w-full rounded-xl border border-[#498386]/20 px-4 py-2 text-sm text-slate-800 focus:border-[#498386] focus:outline-none focus:ring-2 focus:ring-[#498386]/30"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={creatingPlaylist}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#498386] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#3c6b6d] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {creatingPlaylist && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {translatePlaylist("create_modal.submit")}
                                            </button>
                                        </form>
                                    )}
                                </section>
                            )}

                            {activeTab === "stats" && (
                                <section className="grid gap-6 lg:grid-cols-2">
                                    <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                        <h4 className="text-lg font-semibold text-slate-900">
                                            {translateStats("top_tracks")}
                                        </h4>
                                        <ul className="mt-4 space-y-3">
                                            {summary.top_tracks.length === 0 ? (
                                                <li className="text-sm text-slate-500">
                                                    {translateStats("top_tracks_empty")}
                                                </li>
                                            ) : (
                                                summary.top_tracks.map((track) => (
                                                    <li key={track.id} className="flex items-center gap-3">
                                                        {track.album_image ? (
                                                            <img
                                                                src={track.album_image}
                                                                alt={track.name}
                                                                className="h-12 w-12 rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-[#498386]/30 text-[#498386]">
                                                                <Music4 className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{track.name}</p>
                                                            <p className="text-xs text-slate-500">{track.artists}</p>
                                                        </div>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                    <div className="rounded-3xl border border-[#498386]/20 bg-white/80 p-6 shadow">
                                        <h4 className="text-lg font-semibold text-slate-900">
                                            {translateStats("top_artists")}
                                        </h4>
                                        <ul className="mt-4 space-y-3">
                                            {summary.top_artists.length === 0 ? (
                                                <li className="text-sm text-slate-500">
                                                    {translateStats("top_artists_empty")}
                                                </li>
                                            ) : (
                                                summary.top_artists.map((artist) => (
                                                    <li key={artist.id} className="flex items-center gap-3">
                                                        {artist.image ? (
                                                            <img
                                                                src={artist.image}
                                                                alt={artist.name}
                                                                className="h-12 w-12 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[#498386]/30 text-[#498386]">
                                                                <Heart className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{artist.name}</p>
                                                            {artist.genres.length > 0 && (
                                                                <p className="text-xs text-slate-500">
                                                                    {artist.genres.slice(0, 3).join(", ")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
