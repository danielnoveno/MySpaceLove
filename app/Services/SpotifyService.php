<?php

namespace App\Services;

use App\Models\Space;
use App\Models\SpotifyToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SpotifyService
{
    protected ?SpotifyToken $token = null;
    protected string $apiBase = 'https://api.spotify.com/v1';

    public function storeToken(User $user, Space $space, array $payload): SpotifyToken
    {
        $expiresIn = Arr::get($payload, 'expires_in');
        $expiresAt = now()->addSeconds((int) $expiresIn);

        $existingToken = SpotifyToken::where('user_id', $user->id)
            ->where('space_id', $space->id)
            ->first();

        $refreshToken = Arr::get($payload, 'refresh_token');
        if (empty($refreshToken)) {
            $refreshToken = $existingToken?->refresh_token;
        }

        $token = SpotifyToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'space_id' => $space->id,
            ],
            [
                'access_token' => Arr::get($payload, 'access_token'),
                'refresh_token' => $refreshToken,
                'expires_in' => (int) $expiresIn,
                'expires_at' => $expiresAt,
                'scope' => Arr::get($payload, 'scope'),
                'token_type' => Arr::get($payload, 'token_type', 'Bearer'),
            ]
        );

        $this->token = $token;

        return $token;
    }

    public function forSpace(Space $space, User $user, bool $fallbackToAny = true): self
    {
        $token = SpotifyToken::where('space_id', $space->id)
            ->where('user_id', $user->id)
            ->latest('updated_at')
            ->first();

        if (!$token && $fallbackToAny) {
            $token = SpotifyToken::where('space_id', $space->id)
                ->latest('updated_at')
                ->first();
        }

        if (!$token) {
            throw new RuntimeException(__('spotify.music_space.errors.connection_required'));
        }

        $this->token = $token;
        $this->ensureValidToken();

        return $this;
    }

    public function forToken(SpotifyToken $token): self
    {
        $instance = clone $this;
        $instance->token = $token;
        $instance->ensureValidToken();

        return $instance;
    }

    public function ensureValidToken(): void
    {
        if (!$this->token) {
            throw new RuntimeException(__('spotify.auth.token_missing'));
        }

        $margin = config('services.spotify.refresh_margin', 300);
        if (Carbon::now()->addSeconds($margin)->lt($this->token->expires_at)) {
            return;
        }

        $this->refreshAccessToken();
    }

    public function refreshAccessToken(): void
    {
        if (!$this->token) {
            throw new RuntimeException(__('spotify.auth.token_missing'));
        }

        $clientId = config('services.spotify.client_id');
        $clientSecret = config('services.spotify.client_secret');

        $response = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $this->token->refresh_token,
            ])->throw()->json();

        $expiresIn = Arr::get($response, 'expires_in', $this->token->expires_in);
        $this->token->update([
            'access_token' => Arr::get($response, 'access_token', $this->token->access_token),
            'expires_in' => (int) $expiresIn,
            'expires_at' => now()->addSeconds((int) $expiresIn),
        ]);
    }

    protected function http(): PendingRequest
    {
        if (!$this->token) {
            throw new RuntimeException(__('spotify.auth.token_missing'));
        }

        return Http::withToken($this->token->access_token)
            ->baseUrl($this->apiBase)
            ->acceptJson();
    }

    public function token(): SpotifyToken
    {
        if (!$this->token) {
            throw new RuntimeException(__('spotify.auth.token_missing'));
        }

        return $this->token;
    }

    public function setSharedPlaylist(?string $playlistId): void
    {
        if (!$this->token) {
            throw new RuntimeException(__('spotify.auth.token_missing'));
        }

        $this->token->update(['shared_playlist_id' => $playlistId]);
    }

    public function getUserPlaylists(int $limit = 20): array
    {
        return $this->http()
            ->get('/me/playlists', ['limit' => $limit])
            ->throw()
            ->json('items', []);
    }

    public function getPlaylistTracks(string $playlistId, int $limit = 50): array
    {
        return $this->http()
            ->get("/playlists/{$playlistId}/tracks", [
                'limit' => $limit,
                'fields' => 'items(added_at,track(id,name,artists(name),preview_url,external_urls(spotify)))',
            ])
            ->throw()
            ->json('items', []);
    }

    public function getPlaylist(string $playlistId): array
    {
        return $this->http()
            ->get("/playlists/{$playlistId}", ['fields' => 'id,name,tracks.total,owner(display_name),external_urls(spotify)'])
            ->throw()
            ->json();
    }

    public function getAudioFeatures(array $trackIds): array
    {
        $trackIds = array_values(array_filter($trackIds));
        if (empty($trackIds)) {
            return [];
        }

        $chunks = array_chunk($trackIds, 100);
        $features = [];

        foreach ($chunks as $chunk) {
            $response = $this->http()
                ->get('/audio-features', ['ids' => implode(',', $chunk)])
                ->throw()
                ->json('audio_features', []);

            foreach ($response as $item) {
                if (isset($item['id'])) {
                    $features[$item['id']] = $item;
                }
            }
        }

        return $features;
    }

    public function getRecentlyPlayed(int $limit = 10): array
    {
        return $this->http()
            ->get('/me/player/recently-played', ['limit' => $limit])
            ->throw()
            ->json('items', []);
    }

    public function getPlaybackState(): array
    {
        $response = $this->http()->get('/me/player');

        if ($response->status() === 204 || $response->body() === '') {
            return [];
        }

        return $response->throw()->json();
    }

    public function getCurrentlyPlaying(): array
    {
        $response = $this->http()->get('/me/player/currently-playing');

        if ($response->status() === 204 || $response->body() === '') {
            return [];
        }

        return $response->throw()->json();
    }

    public function getTrack(string $trackId): array
    {
        return $this->http()
            ->get("/tracks/{$trackId}")
            ->throw()
            ->json();
    }

    public function getTracks(array $trackIds): array
    {
        if (empty($trackIds)) {
            return [];
        }

        return $this->http()
            ->get('/tracks', ['ids' => implode(',', $trackIds)])
            ->throw()
            ->json('tracks', []);
    }

    public function searchTracks(string $query, int $limit = 10): array
    {
        return $this->http()
            ->get('/search', [
                'q' => $query,
                'type' => 'track',
                'limit' => $limit,
            ])
            ->throw()
            ->json('tracks.items', []);
    }

    public function getCurrentUser(): array
    {
        return $this->http()
            ->get('/me')
            ->throw()
            ->json();
    }

    public function startPlayback(string $trackId, ?string $deviceId = null, ?int $positionMs = null): void
    {
        $payload = [
            'uris' => ["spotify:track:{$trackId}"],
        ];

        if ($positionMs !== null && $positionMs >= 0) {
            $payload['position_ms'] = $positionMs;
        }

        $request = $this->http();

        if ($deviceId) {
            $request = $request->withOptions([
                'query' => ['device_id' => $deviceId],
            ]);
        }

        $request->put('/me/player/play', $payload)->throw();
    }

    public function resumePlayback(?string $deviceId = null): void
    {
        $request = $this->http();

        if ($deviceId) {
            $request = $request->withOptions([
                'query' => ['device_id' => $deviceId],
            ]);
        }

        $request->put('/me/player/play')->throw();
    }

    public function pausePlayback(?string $deviceId = null): void
    {
        $request = $this->http();

        if ($deviceId) {
            $request = $request->withOptions([
                'query' => ['device_id' => $deviceId],
            ]);
        }

        $request->put('/me/player/pause')->throw();
    }

    public function nextTrack(?string $deviceId = null): void
    {
        $request = $this->http();

        if ($deviceId) {
            $request = $request->withOptions([
                'query' => ['device_id' => $deviceId],
            ]);
        }

        $request->post('/me/player/next')->throw();
    }

    public function previousTrack(?string $deviceId = null): void
    {
        $request = $this->http();

        if ($deviceId) {
            $request = $request->withOptions([
                'query' => ['device_id' => $deviceId],
            ]);
        }

        $request->post('/me/player/previous')->throw();
    }

    public function transferPlayback(string $deviceId, bool $play = true): void
    {
        $this->http()
            ->put('/me/player', [
                'device_ids' => [$deviceId],
                'play' => $play,
            ])
            ->throw();
    }

    public function createPlaylist(string $userId, string $name, string $description = '', bool $isPublic = false): array
    {
        return $this->http()
            ->post("/users/{$userId}/playlists", [
                'name' => $name,
                'description' => $description,
                'public' => $isPublic,
            ])
            ->throw()
            ->json();
    }

    public function addTracksToPlaylist(string $playlistId, array $trackUris): void
    {
        if (empty($trackUris)) {
            return;
        }

        $this->http()
            ->post("/playlists/{$playlistId}/tracks", [
                'uris' => array_values($trackUris),
            ])
            ->throw();
    }

    public function removeTracksFromPlaylist(string $playlistId, array $trackUris): void
    {
        if (empty($trackUris)) {
            return;
        }

        $tracks = array_map(static fn ($uri) => ['uri' => $uri], array_values($trackUris));

        $this->http()
            ->delete("/playlists/{$playlistId}/tracks", [
                'tracks' => $tracks,
            ])
            ->throw();
    }

    public function getPlaylistWithTracks(string $playlistId, int $limit = 50): array
    {
        $playlist = $this->getPlaylist($playlistId);
        $tracks = $this->getPlaylistTracks($playlistId, $limit);

        return [
            'info' => $playlist,
            'tracks' => $tracks,
        ];
    }

    public function getTopItems(string $type, int $limit = 10, string $timeRange = 'medium_term'): array
    {
        $type = $type === 'artists' ? 'artists' : 'tracks';

        return $this->http()
            ->get("/me/top/{$type}", [
                'limit' => $limit,
                'time_range' => $timeRange,
            ])
            ->throw()
            ->json('items', []);
    }
}
