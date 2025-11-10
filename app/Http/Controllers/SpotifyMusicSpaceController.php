<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpotifyToken;
use App\Services\SpotifyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class SpotifyMusicSpaceController extends Controller
{
    public function summary(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $user = $request->user();

        $tokens = SpotifyToken::with('user')
            ->where('space_id', $space->id)
            ->get();

        $connections = $tokens->map(function (SpotifyToken $token) use ($user) {
            $owner = $token->user;

            return [
                'user_id' => $token->user_id,
                'name' => $owner?->name ?? $owner?->email ?? __('spotify.music_space.anonymous_user'),
                'connected_at' => optional($token->updated_at)->toIso8601String(),
                'is_current_user' => $token->user_id === $user?->id,
            ];
        })->values();

        $connected = false;
        $message = null;
        $primaryService = null;

        try {
            $primaryService = $spotifyService->forSpace($space, $user, false);
            $connected = true;
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();
        }

        $viewerService = $primaryService;

        if (!$viewerService && $tokens->isNotEmpty()) {
            try {
                $viewerService = $spotifyService->forToken($tokens->first());
            } catch (RuntimeException $exception) {
                $viewerService = null;
            }
        }

        $playlist = null;
        $playlistTracks = [];

        if ($viewerService) {
            $playlistId = $request->query('playlist_id');

            if (empty($playlistId)) {
                try {
                    $playlistId = $viewerService->token()->shared_playlist_id;
                } catch (RuntimeException $exception) {
                    $playlistId = null;
                }
            }

            if ($playlistId) {
                try {
                    $playlistPayload = $viewerService->getPlaylistWithTracks($playlistId);
                    $playlistInfo = Arr::get($playlistPayload, 'info', []);
                    $playlistTracks = collect(Arr::get($playlistPayload, 'tracks', []))
                        ->map(function (array $item) {
                            $track = Arr::get($item, 'track');

                            if (!$track) {
                                return null;
                            }

                            $album = Arr::get($track, 'album');

                            return [
                                'id' => Arr::get($track, 'id'),
                                'uri' => Arr::get($track, 'uri'),
                                'name' => Arr::get($track, 'name'),
                                'artists' => collect(Arr::get($track, 'artists', []))->pluck('name')->implode(', '),
                                'album_image' => Arr::get($album, 'images.0.url'),
                                'duration_ms' => Arr::get($track, 'duration_ms'),
                            ];
                        })
                        ->filter()
                        ->values()
                        ->all();

                    $playlist = [
                        'id' => Arr::get($playlistInfo, 'id', $playlistId),
                        'name' => Arr::get($playlistInfo, 'name'),
                        'owner' => Arr::get($playlistInfo, 'owner.display_name'),
                        'external_url' => Arr::get($playlistInfo, 'external_urls.spotify'),
                        'track_total' => Arr::get($playlistInfo, 'tracks.total', count($playlistTracks)),
                    ];
                } catch (Throwable $throwable) {
                    $message ??= __('spotify.music_space.errors.playlist_unavailable');
                }
            }
        }

        $playback = [];
        $topTracks = [];
        $topArtists = [];

        if ($viewerService) {
            try {
                $playback = $viewerService->getPlaybackState();
            } catch (Throwable $throwable) {
                $playback = [];
            }

            try {
                $topTracks = $viewerService->getTopItems('tracks', 6);
            } catch (Throwable $throwable) {
                $topTracks = [];
            }

            try {
                $topArtists = $viewerService->getTopItems('artists', 6);
            } catch (Throwable $throwable) {
                $topArtists = [];
            }
        }

        $compatibility = $this->calculateCompatibility($space, $spotifyService);

        $playerToken = null;
        $tokenExpiresAt = null;

        if ($primaryService) {
            try {
                $tokenModel = $primaryService->token();
                $playerToken = $tokenModel->access_token;
                $tokenExpiresAt = optional($tokenModel->expires_at)->toIso8601String();
            } catch (RuntimeException $exception) {
                $playerToken = null;
            }
        }

        return response()->json([
            'connected' => $connected,
            'connections' => $connections,
            'message' => $connected ? null : $message,
            'playlist' => $playlist,
            'playlist_tracks' => $playlistTracks,
            'playback' => $this->formatPlaybackState($playback),
            'top_tracks' => $this->mapTopTracks($topTracks),
            'top_artists' => $this->mapTopArtists($topArtists),
            'compatibility' => $compatibility,
            'player_token' => $playerToken,
            'player_token_expires_at' => $tokenExpiresAt,
            'authorize_url' => route('spotify.authorize', [
                'space' => $space->slug,
                'redirect' => route('spotify.music-space', ['space' => $space->slug]),
            ]),
        ]);
    }

    public function search(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'max:80'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:20'],
        ]);

        try {
            $service = $spotifyService->forSpace($space, $request->user(), false);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => __('spotify.music_space.errors.connection_required'),
            ], 409);
        }

        $limit = (int) ($validated['limit'] ?? 10);

        $results = collect($service->searchTracks($validated['q'], $limit))
            ->map(function (array $item) {
                $album = Arr::get($item, 'album');

                return [
                    'id' => Arr::get($item, 'id'),
                    'uri' => Arr::get($item, 'uri'),
                    'name' => Arr::get($item, 'name'),
                    'artists' => collect(Arr::get($item, 'artists', []))->pluck('name')->implode(', '),
                    'album' => Arr::get($album, 'name'),
                    'album_image' => Arr::get($album, 'images.0.url'),
                ];
            })
            ->values()
            ->all();

        return response()->json(['results' => $results]);
    }

    public function createPlaylist(Request $request, Space $space, SpotifyService $spotifyService): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:300'],
        ]);

        try {
            $service = $spotifyService->forSpace($space, $request->user(), false);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => __('spotify.music_space.errors.connection_required'),
            ], 409);
        }

        $me = $service->getCurrentUser();
        $playlist = $service->createPlaylist(
            Arr::get($me, 'id'),
            $validated['name'],
            $validated['description'] ?? '',
            false
        );

        $service->setSharedPlaylist(Arr::get($playlist, 'id'));

        return response()->json([
            'id' => Arr::get($playlist, 'id'),
            'name' => Arr::get($playlist, 'name'),
            'external_url' => Arr::get($playlist, 'external_urls.spotify'),
        ], 201);
    }

    public function addTracks(Request $request, Space $space, string $playlistId, SpotifyService $spotifyService): JsonResponse
    {
        $validated = $request->validate([
            'uris' => ['required', 'array', 'min:1', 'max:50'],
            'uris.*' => ['string'],
        ]);

        try {
            $service = $spotifyService->forSpace($space, $request->user(), false);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => __('spotify.music_space.errors.connection_required'),
            ], 409);
        }

        $service->addTracksToPlaylist($playlistId, $validated['uris']);

        return response()->json(['status' => 'ok']);
    }

    public function removeTracks(Request $request, Space $space, string $playlistId, SpotifyService $spotifyService): JsonResponse
    {
        $validated = $request->validate([
            'uris' => ['required', 'array', 'min:1', 'max:50'],
            'uris.*' => ['string'],
        ]);

        try {
            $service = $spotifyService->forSpace($space, $request->user(), false);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => __('spotify.music_space.errors.connection_required'),
            ], 409);
        }

        $service->removeTracksFromPlaylist($playlistId, $validated['uris']);

        return response()->json(['status' => 'ok']);
    }

    public function controlPlayback(Request $request, Space $space, SpotifyService $spotifyService, string $action): JsonResponse
    {
        $validated = $request->validate([
            'track_id' => ['nullable', 'string'],
            'device_id' => ['nullable', 'string'],
            'position_ms' => ['nullable', 'integer', 'min:0'],
        ]);

        try {
            $service = $spotifyService->forSpace($space, $request->user(), false);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => __('spotify.music_space.errors.connection_required'),
            ], 409);
        }

        $deviceId = $validated['device_id'] ?? null;

        try {
            switch (Str::of($action)->lower()->toString()) {
                case 'play':
                    $trackId = $validated['track_id'] ?? null;

                    if ($trackId) {
                        $service->startPlayback($trackId, $deviceId, $validated['position_ms'] ?? null);
                    } else {
                        $service->resumePlayback($deviceId);
                    }

                    break;
                case 'pause':
                    $service->pausePlayback($deviceId);
                    break;
                case 'next':
                    $service->nextTrack($deviceId);
                    break;
                case 'previous':
                    $service->previousTrack($deviceId);
                    break;
                default:
                    return response()->json([
                        'message' => __('spotify.music_space.errors.invalid_action'),
                    ], 422);
            }
        } catch (Throwable $throwable) {
            return response()->json([
                'message' => __('spotify.music_space.errors.playback_failed'),
            ], 500);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function formatPlaybackState(array $payload): array
    {
        $item = Arr::get($payload, 'item');

        if (!$item) {
            return [
                'is_playing' => false,
            ];
        }

        $album = Arr::get($item, 'album');

        return [
            'is_playing' => (bool) Arr::get($payload, 'is_playing', false),
            'progress_ms' => Arr::get($payload, 'progress_ms'),
            'duration_ms' => Arr::get($item, 'duration_ms'),
            'name' => Arr::get($item, 'name'),
            'artists' => collect(Arr::get($item, 'artists', []))->pluck('name')->implode(', '),
            'album_image' => Arr::get($album, 'images.0.url'),
        ];
    }

    protected function mapTopTracks(array $tracks): array
    {
        return collect($tracks)
            ->map(function (array $track) {
                $album = Arr::get($track, 'album');

                return [
                    'id' => Arr::get($track, 'id'),
                    'name' => Arr::get($track, 'name'),
                    'artists' => collect(Arr::get($track, 'artists', []))->pluck('name')->implode(', '),
                    'album_image' => Arr::get($album, 'images.0.url'),
                ];
            })
            ->values()
            ->all();
    }

    protected function mapTopArtists(array $artists): array
    {
        return collect($artists)
            ->map(function (array $artist) {
                return [
                    'id' => Arr::get($artist, 'id'),
                    'name' => Arr::get($artist, 'name'),
                    'image' => Arr::get($artist, 'images.0.url'),
                    'genres' => collect(Arr::get($artist, 'genres', []))->take(3)->all(),
                ];
            })
            ->values()
            ->all();
    }

    protected function calculateCompatibility(Space $space, SpotifyService $spotifyService): ?array
    {
        $tokens = SpotifyToken::where('space_id', $space->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        if ($tokens->count() < 2) {
            return null;
        }

        $first = $tokens->get(0);
        $second = $tokens->get(1);

        try {
            $firstService = $spotifyService->forToken($first);
            $secondService = $spotifyService->forToken($second);
        } catch (RuntimeException $exception) {
            return null;
        }

        try {
            $firstTracks = collect($firstService->getTopItems('tracks', 20))->pluck('id')->filter();
            $secondTracks = collect($secondService->getTopItems('tracks', 20))->pluck('id')->filter();

            $firstArtists = collect($firstService->getTopItems('artists', 20))->pluck('id')->filter();
            $secondArtists = collect($secondService->getTopItems('artists', 20))->pluck('id')->filter();
        } catch (Throwable $throwable) {
            return null;
        }

        $trackMatches = $firstTracks->intersect($secondTracks)->count();
        $artistMatches = $firstArtists->intersect($secondArtists)->count();

        $trackScore = $firstTracks->isEmpty() || $secondTracks->isEmpty()
            ? 0
            : ($trackMatches / min($firstTracks->count(), $secondTracks->count())) * 100;

        $artistScore = $firstArtists->isEmpty() || $secondArtists->isEmpty()
            ? 0
            : ($artistMatches / min($firstArtists->count(), $secondArtists->count())) * 100;

        $score = round(($trackScore + $artistScore) / 2);

        return [
            'score' => $score,
            'details' => [
                'track_overlap' => $trackMatches,
                'artist_overlap' => $artistMatches,
            ],
        ];
    }
}
