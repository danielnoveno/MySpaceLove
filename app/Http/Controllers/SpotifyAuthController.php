<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Services\SpotifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class SpotifyAuthController extends Controller
{
    public function redirect(Request $request, Space $space)
    {
        $user = $request->user();

        $redirectUri = config('services.spotify.redirect_uri');
        if (empty($redirectUri)) {
            $redirectUri = route('spotify.callback');
        }

        $statePayload = [
            'space_id' => $space->id,
            'space_slug' => $space->slug,
            'user_id' => $user?->id,
            'redirect' => $request->query('redirect', route('spotify.companion', ['space' => $space->slug])),
        ];

        $state = base64_encode(json_encode($statePayload));

        $query = http_build_query([
            'response_type' => 'code',
            'client_id' => config('services.spotify.client_id'),
            'redirect_uri' => $redirectUri,
            'scope' => config('services.spotify.scopes'),
            'state' => $state,
            'show_dialog' => $request->boolean('force', false) ? 'true' : 'false',
        ], '', '&', PHP_QUERY_RFC3986);

        return Redirect::away('https://accounts.spotify.com/authorize?' . $query);
    }

    public function callback(Request $request, SpotifyService $spotifyService)
    {
        $state = $request->input('state');
        if (!$state) {
            abort(400, 'State tidak ditemukan.');
        }

        $payload = json_decode(base64_decode($state), true);
        if (!is_array($payload)) {
            abort(400, 'State tidak valid.');
        }

        $space = Space::findOrFail(Arr::get($payload, 'space_id'));
        $redirectUrl = Arr::get($payload, 'redirect', route('spotify.companion', ['space' => $space->slug]));

        $user = $request->user();
        if (!$user || $user->id !== Arr::get($payload, 'user_id')) {
            Auth::logout();

            return redirect()->to($redirectUrl)->with('error', 'Sesi tidak valid. Silakan login ulang.');
        }

        if ($request->filled('error')) {
            return redirect()->to($redirectUrl)->with('error', 'Spotify: ' . $request->input('error'));
        }

        $code = $request->input('code');
        if (!$code) {
            return redirect()->to($redirectUrl)->with('error', 'Kode otorisasi Spotify tidak ditemukan.');
        }

        $redirectUri = config('services.spotify.redirect_uri');
        if (empty($redirectUri)) {
            $redirectUri = route('spotify.callback');
        }

        $response = Http::asForm()
            ->withBasicAuth(config('services.spotify.client_id'), config('services.spotify.client_secret'))
            ->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $redirectUri,
            ]);

        if ($response->failed()) {
            return redirect()->to($redirectUrl)->with('error', 'Gagal menukar kode Spotify: ' . $response->body());
        }

        $spotifyService->storeToken($user, $space, $response->json());

        return redirect()->to($redirectUrl)->with('success', 'Spotify berhasil terhubung!');
    }
}
