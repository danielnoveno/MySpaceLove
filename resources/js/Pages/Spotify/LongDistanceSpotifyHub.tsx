import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    Calendar,
    Clock,
    Heart,
    Headphones,
    Loader2,
    Music,
    Play,
    Sparkles,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
};

type Props = {
    space: SpaceInfo;
};
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

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}
export default function LongDistanceSpotifyHub({ space }: Props) {
    const [dashboard, setDashboard] = useState<SpotifyDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

    const authorizeHref = route("spotify.authorize", {
        space: space.slug,
        redirect: route("spotify.companion", { space: space.slug }),
    });
    const handleAuthorize = useCallback(() => {
        window.location.href = authorizeHref;
    }, [authorizeHref]);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<SpotifyDashboardResponse>(
                route("spotify.dashboard", { space: space.slug }),
            );
            setDashboard(response.data);
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

                setError(responseMessage ?? err.message ?? "Gagal memuat data Spotify.");
            } else if (err instanceof Error) {
                setError(err.message);
                setDashboard(null);
            } else {
                setError("Gagal memuat data Spotify.");
                setDashboard(null);
            }
        } finally {
            setLoading(false);
        }
    }, [space.slug]);

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    const playlist = dashboard?.playlist ?? null;
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

    const listening = dashboard?.listening ?? null;
    const surpriseDrops = dashboard?.surpriseDrops ?? [];
    const memoryCapsules = dashboard?.memoryCapsules ?? [];

    const isConnected = dashboard?.connected ?? false;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-gray-800">Spotify Companion Kit</h2>
                    <p className="text-sm text-purple-600">
                        Ruang {space.title}: sinkronkan musik, mood, dan momen kalian biar tetap dekat walau terpisah jarak.
                    </p>
                </div>
            }
        >
            <Head title="Spotify Companion Kit" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
                {!isConnected && !loading && (
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
                            <span className="text-sm font-medium">Memuat data Spotify...</span>
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
                            Coba Muat Ulang
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
                            </div>

                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
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
                                            Belum ada riwayat pemutaran terbaru.
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
                                            Belum ada lagu kejutan terjadwal. Tambahkan satu untuk moment spesial berikutnya!
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
                                    onClick={handleAuthorize}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Re-authorize Spotify
                                </button>
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
                                            <button
                                                type="button"
                                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50"
                                            >
                                                <Play className="h-4 w-4" />
                                                Gabung playback
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
                                            Belum ada kapsul memori. Simpan satu untuk mengenang momen penting kalian.
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
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-amber-400">Integrasi berikutnya</p>
                                    <ul className="mt-2 space-y-2 text-sm text-amber-700">
                                        <li>- Tambah kapsul lewat `POST /spaces/{slug}/spotify/capsules`.</li>
                                        <li>- Jadwalkan kejutan via `POST /spaces/{slug}/spotify/surprises`.</li>
                                        <li>- Otomatiskan reminder tahunan dari data kapsul.</li>
                                    </ul>
                                </div>
                                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-xs text-amber-600">
                                    Token OAuth sudah tersimpan otomatis setelah kamu menghubungkan Spotify. Gunakan endpoint di atas atau job terjadwal untuk memicu pengalaman tambahan.
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
