<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpotifyCapsule;
use App\Models\SpotifySurpriseDrop;
use App\Services\SpotifyService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use RuntimeException;
use Throwable;

class SpotifyController extends Controller
{
    public function dashboard(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $user = $request->user();

        try {
            $spotifyService->forSpace($space, $user);
        } catch (RuntimeException $exception) {
            return response()->json([
                'connected' => false,
                'message' => $exception->getMessage(),
            ], 409);
        }

        $playlistId = $request->query('playlist_id') ?: $spotifyService->token()->shared_playlist_id;

        $playlist = $this->buildPlaylistSummary($spotifyService, $playlistId);
        if (!empty($playlist['playlist_id']) && $playlist['playlist_id'] !== $spotifyService->token()->shared_playlist_id) {
            $spotifyService->setSharedPlaylist($playlist['playlist_id']);
        }

        $moods = $this->buildMoodSnapshots($spotifyService);
        $listening = $this->buildListeningSnapshot($spotifyService);

        $surpriseDrops = SpotifySurpriseDrop::where('space_id', $space->id)
            ->orderBy('scheduled_for')
            ->get()
            ->map(fn (SpotifySurpriseDrop $drop) => [
                'id' => $drop->id,
                'track' => $drop->track_name,
                'artists' => $drop->artists,
                'scheduled_for' => $drop->scheduled_for?->toIso8601String(),
                'note' => $drop->note,
                'curator' => $drop->curator_name ?? $drop->user?->name,
            ])->values()->all();

        $capsules = SpotifyCapsule::where('space_id', $space->id)
            ->orderByDesc('saved_at')
            ->get()
            ->map(fn (SpotifyCapsule $capsule) => [
                'id' => $capsule->id,
                'track' => $capsule->track_name,
                'artists' => $capsule->artists,
                'moment' => $capsule->moment,
                'description' => $capsule->description,
                'saved_at' => optional($capsule->saved_at)->toDateString(),
                'preview_url' => $capsule->preview_url,
            ])->values()->all();

        return response()->json([
            'connected' => true,
            'playlist' => $playlist,
            'moods' => $moods,
            'listening' => $listening,
            'surpriseDrops' => $surpriseDrops,
            'memoryCapsules' => $capsules,
        ]);
    }

    public function storeSurprise(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $user = $request->user();

        try {
            $spotifyService->forSpace($space, $user);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 409);
        }

        $data = $request->validate([
            'spotify_track_id' => ['required', 'string'],
            'scheduled_for' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $track = $spotifyService->getTrack($data['spotify_track_id']);
        $drop = SpotifySurpriseDrop::create([
            'space_id' => $space->id,
            'user_id' => $user->id,
            'spotify_track_id' => Arr::get($track, 'id', $data['spotify_track_id']),
            'track_name' => Arr::get($track, 'name', 'Unknown Track'),
            'artists' => implode(', ', Arr::pluck(Arr::get($track, 'artists', []), 'name')),
            'scheduled_for' => Carbon::parse($data['scheduled_for']),
            'note' => $data['note'] ?? null,
            'curator_name' => $user->name,
        ]);

        return response()->json([
            'id' => $drop->id,
            'track' => $drop->track_name,
            'artists' => $drop->artists,
            'scheduled_for' => $drop->scheduled_for?->toIso8601String(),
            'note' => $drop->note,
            'curator' => $drop->curator_name,
        ], 201);
    }

    public function storeCapsule(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $user = $request->user();

        try {
            $spotifyService->forSpace($space, $user);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 409);
        }

        $data = $request->validate([
            'spotify_track_id' => ['required', 'string'],
            'moment' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'saved_at' => ['nullable', 'date'],
        ]);

        $track = $spotifyService->getTrack($data['spotify_track_id']);

        $capsule = SpotifyCapsule::create([
            'space_id' => $space->id,
            'user_id' => $user->id,
            'spotify_track_id' => Arr::get($track, 'id', $data['spotify_track_id']),
            'track_name' => Arr::get($track, 'name', 'Unknown Track'),
            'artists' => implode(', ', Arr::pluck(Arr::get($track, 'artists', []), 'name')),
            'moment' => $data['moment'] ?? null,
            'description' => $data['description'] ?? null,
            'saved_at' => isset($data['saved_at']) ? Carbon::parse($data['saved_at']) : null,
            'preview_url' => Arr::get($track, 'preview_url'),
        ]);

        return response()->json([
            'id' => $capsule->id,
            'track' => $capsule->track_name,
            'artists' => $capsule->artists,
            'moment' => $capsule->moment,
            'description' => $capsule->description,
            'saved_at' => optional($capsule->saved_at)->toDateString(),
            'preview_url' => $capsule->preview_url,
        ], 201);
    }

    public function joinPlayback(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $user = $request->user();

        try {
            $spotifyService->forSpace($space, $user);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 409);
        }

        $data = $request->validate([
            'track_id' => ['required', 'string'],
            'position_ms' => ['nullable', 'integer', 'min:0'],
        ]);

        try {
            $spotifyService->startPlayback($data['track_id'], $data['position_ms'] ?? null);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Gagal menghubungkan playback: ' . $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => 'playing',
        ], 202);
    }

    protected function buildPlaylistSummary(SpotifyService $spotifyService, ?string $preferredPlaylistId): array
    {
        $playlistInfo = null;

        if ($preferredPlaylistId) {
            try {
                $playlistInfo = $spotifyService->getPlaylist($preferredPlaylistId);
            } catch (\Throwable $exception) {
                $playlistInfo = null;
            }
        }

        if (!$playlistInfo) {
            try {
                $playlists = $spotifyService->getUserPlaylists(10);
            } catch (\Throwable $exception) {
                return [
                    'playlist_id' => null,
                    'name' => 'Belum ada playlist',
                    'owner' => null,
                    'external_url' => null,
                    'total_tracks' => 0,
                    'new_this_week' => 0,
                    'average_energy' => 0,
                    'last_added' => null,
                    'target_weekly' => 6,
                ];
            }

            $firstPlaylist = $playlists[0] ?? null;
            if (!$firstPlaylist) {
                return [
                    'playlist_id' => null,
                    'name' => 'Belum ada playlist',
                    'owner' => null,
                    'external_url' => null,
                    'total_tracks' => 0,
                    'new_this_week' => 0,
                    'average_energy' => 0,
                    'last_added' => null,
                    'target_weekly' => 6,
                ];
            }

            try {
                $playlistInfo = $spotifyService->getPlaylist($firstPlaylist['id']);
            } catch (\Throwable $exception) {
                return [
                    'playlist_id' => null,
                    'name' => 'Belum ada playlist',
                    'owner' => null,
                    'external_url' => null,
                    'total_tracks' => 0,
                    'new_this_week' => 0,
                    'average_energy' => 0,
                    'last_added' => null,
                    'target_weekly' => 6,
                ];
            }
        }

        try {
            $playlistTracks = $spotifyService->getPlaylistTracks($playlistInfo['id'], 50);
        } catch (\Throwable $exception) {
            $playlistTracks = [];
        }

        $tracks = collect($playlistTracks)
            ->map(function (array $item) {
                $track = Arr::get($item, 'track');

                return [
                    'id' => Arr::get($track, 'id'),
                    'name' => Arr::get($track, 'name'),
                    'artists' => Arr::pluck(Arr::get($track, 'artists', []), 'name'),
                    'preview_url' => Arr::get($track, 'preview_url'),
                    'added_at' => Arr::get($item, 'added_at'),
                    'external_url' => Arr::get($track, 'external_urls.spotify'),
                ];
            })
            ->filter(fn (array $track) => !empty($track['id']))
            ->values();

        try {
            $features = $spotifyService->getAudioFeatures($tracks->pluck('id')->all());
        } catch (Throwable $exception) {
            $features = [];
        }

        $averageEnergy = $tracks->count() > 0
            ? round($tracks->map(fn ($track) => Arr::get($features, $track['id'] . '.energy', 0))->average() ?? 0, 2)
            : 0;

        $newThisWeek = $tracks->filter(function (array $track) {
            if (empty($track['added_at'])) {
                return false;
            }

            return Carbon::parse($track['added_at'])->greaterThanOrEqualTo(Carbon::now()->subDays(7));
        })->count();

        $lastAdded = $tracks->filter(fn (array $track) => !empty($track['added_at']))
            ->sortByDesc('added_at')
            ->first();

        return [
            'playlist_id' => Arr::get($playlistInfo, 'id'),
            'name' => Arr::get($playlistInfo, 'name'),
            'owner' => Arr::get($playlistInfo, 'owner.display_name'),
            'external_url' => Arr::get($playlistInfo, 'external_urls.spotify'),
            'total_tracks' => Arr::get($playlistInfo, 'tracks.total', $tracks->count()),
            'new_this_week' => $newThisWeek,
            'average_energy' => $averageEnergy,
            'last_added' => $lastAdded ? [
                'title' => $lastAdded['name'],
                'artists' => $lastAdded['artists'],
                'added_at' => $lastAdded['added_at'],
            ] : null,
            'sample_tracks' => $tracks->take(5)->values()->all(),
            'target_weekly' => 6,
        ];
    }

    protected function buildMoodSnapshots(SpotifyService $spotifyService): array
    {
        try {
            $recentlyPlayed = $spotifyService->getRecentlyPlayed(6);
        } catch (\Throwable $exception) {
            return [];
        }

        $items = collect($recentlyPlayed);
        if ($items->isEmpty()) {
            return [];
        }

        $trackIds = $items->pluck('track.id')->filter()->unique()->values()->all();

        try {
            $features = $spotifyService->getAudioFeatures($trackIds);
        } catch (\Throwable $exception) {
            $features = [];
        }

        $labels = ['Mood Kamu', 'Mood Pasangan'];

        return $items->take(2)->values()->map(function (array $item, int $index) use ($features, $labels) {
            $track = Arr::get($item, 'track', []);
            $trackId = Arr::get($track, 'id');
            $audio = $trackId ? ($features[$trackId] ?? []) : [];
            $energy = Arr::get($audio, 'energy', 0);
            $valence = Arr::get($audio, 'valence', 0);

            return [
                'id' => $trackId ? $trackId . '-' . $index : (string) $index,
                'user_label' => $labels[$index] ?? 'Mood',
                'track' => Arr::get($track, 'name', 'Unknown'),
                'artists' => implode(', ', Arr::pluck(Arr::get($track, 'artists', []), 'name')),
                'mood_tone' => $this->describeMood($energy, $valence),
                'energy' => round($energy, 2),
                'affection' => $this->suggestAffection($energy, $valence),
                'played_at' => Arr::get($item, 'played_at'),
            ];
        })->all();
    }

    protected function buildListeningSnapshot(SpotifyService $spotifyService): array
    {
        try {
            $state = $spotifyService->getPlaybackState();
        } catch (\Throwable $exception) {
            $state = [];
        }
        if (empty($state)) {
            return [
                'is_live' => false,
                'joinable' => false,
            ];
        }

        $track = Arr::get($state, 'item', []);
        $progressMs = Arr::get($state, 'progress_ms', 0);
        $elapsedMinutes = $progressMs > 0 ? max(1, (int) floor($progressMs / 60000)) : 0;

        return [
            'is_live' => (bool) Arr::get($state, 'is_playing', false),
            'track' => Arr::get($track, 'name', 'Unknown'),
            'artists' => implode(', ', Arr::pluck(Arr::get($track, 'artists', []), 'name')),
            'host' => Arr::get($state, 'device.name', 'Device'),
            'started_at' => $elapsedMinutes > 0 ? $elapsedMinutes . ' menit lalu' : 'Baru saja',
            'listeners' => 1,
            'joinable' => (bool) Arr::get($state, 'is_playing', false),
            'track_id' => Arr::get($track, 'id'),
            'track_uri' => Arr::get($track, 'uri'),
            'progress_ms' => Arr::get($state, 'progress_ms', 0),
            'external_url' => Arr::get($track, 'external_urls.spotify'),
        ];
    }

    protected function describeMood(float $energy, float $valence): string
    {
        if ($energy >= 0.7 && $valence >= 0.5) {
            return 'Optimis + Semangat';
        }

        if ($energy < 0.4 && $valence < 0.4) {
            return 'Tenteram + Kangen';
        }

        if ($energy >= 0.5 && $valence < 0.4) {
            return 'Intens + Baper';
        }

        if ($energy < 0.3 && $valence >= 0.6) {
            return 'Tenang + Hangat';
        }

        return 'Mood campuran manis';
    }

    protected function suggestAffection(float $energy, float $valence): string
    {
        if ($energy >= 0.7) {
            return 'Ajak challenge tebak lirik sambil teleponan.';
        }

        if ($valence >= 0.6) {
            return 'Kirim pesan manis dan emoji peluk.';
        }

        if ($energy < 0.4) {
            return 'Waktunya video call tenang sambil muter playlist favorit.';
        }

        return 'Kirim voice note singkat biar makin dekat.';
    }
}
