<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SocialLoginController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['google'];

    public function redirect(Request $request, string $provider): RedirectResponse
    {
        $this->ensureProviderSupported($provider);

        $clientId = config("services.{$provider}.client_id");
        $redirectUri = config("services.{$provider}.redirect_uri");

        if (!$clientId || !$redirectUri) {
            return $this->oauthErrorResponse(__('Authentication provider is not configured yet. Please contact support.'));
        }

        $state = Str::random(40);
        $request->session()->put('oauth_state', $state);

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        $this->ensureProviderSupported($provider);

        $expectedState = $request->session()->pull('oauth_state');
        $providedState = $request->string('state')->toString();

        if (!$expectedState || !hash_equals($expectedState, $providedState)) {
            return $this->oauthErrorResponse(__('The authentication session expired. Please try again.'));
        }

        if ($request->has('error')) {
            return $this->oauthErrorResponse(__('Login with Google was cancelled.'));
        }

        $code = $request->string('code')->toString();

        if ($code === '') {
            return $this->oauthErrorResponse(__('We could not complete Google login. Please try again.'));
        }

        $tokens = $this->exchangeCodeForTokens($code);

        if (!$tokens) {
            return $this->oauthErrorResponse(__('Failed to connect to Google. Please try again later.'));
        }

        $googleUser = $this->fetchGoogleUser($tokens['access_token'] ?? null);

        if (!$googleUser) {
            return $this->oauthErrorResponse(__('Could not retrieve your Google profile.'));
        }

        $allowedDomain = config('services.google.allowed_domain');
        $emailDomain = Str::after($googleUser['email'] ?? '', '@');

        if ($allowedDomain && !hash_equals(Str::lower($allowedDomain), Str::lower($emailDomain ?? ''))) {
            return $this->oauthErrorResponse(__('This Google account is not allowed to log in.'));
        }

        $user = $this->findOrCreateUser($googleUser);

        Auth::login($user, true);

        return redirect()->intended(route('spaces.index'));
    }

    private function exchangeCodeForTokens(string $code): ?array
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'grant_type' => 'authorization_code',
        ]);

        if (!$response->successful()) {
            return null;
        }

        return $response->json();
    }

    private function fetchGoogleUser(?string $accessToken): ?array
    {
        if (!$accessToken) {
            return null;
        }

        $response = Http::withToken($accessToken)->get('https://openidconnect.googleapis.com/v1/userinfo');

        if (!$response->successful()) {
            return null;
        }

        return $response->json();
    }

    private function findOrCreateUser(array $googleUser): Authenticatable
    {
        $googleId = $googleUser['sub'] ?? null;
        $email = $googleUser['email'] ?? null;

        if (!$email) {
            throw ValidationException::withMessages([
                'oauth' => __('Google did not return an email address. Please use a different login method.'),
            ]);
        }

        $existing = null;

        if ($googleId) {
            $existing = User::query()
                ->where('provider', 'google')
                ->where('provider_id', $googleId)
                ->first();
        }

        if (!$existing) {
            $existing = User::query()->where('email', $email)->first();
        }

        if ($existing) {
            $existing->forceFill([
                'name' => $googleUser['name'] ?? $existing->name,
                'provider' => 'google',
                'provider_id' => $googleId,
                'avatar' => $googleUser['picture'] ?? $existing->avatar,
                'email_verified_at' => $existing->email_verified_at ?? now(),
            ])->save();

            return $existing;
        }

        $name = $googleUser['name'] ?? ($googleUser['given_name'] ?? 'Google User');

        return User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt(Str::random(40)),
            'username' => User::generateUniqueUsername($name ?: $email),
            'partner_code' => User::generatePartnerCode(),
            'provider' => 'google',
            'provider_id' => $googleId,
            'avatar' => $googleUser['picture'] ?? null,
            'email_verified_at' => now(),
        ]);
    }

    private function ensureProviderSupported(string $provider): void
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS, true)) {
            abort(404);
        }
    }

    private function oauthErrorResponse(string $message): RedirectResponse
    {
        return redirect()
            ->route('login')
            ->withErrors([
                'oauth' => $message,
            ]);
    }
}
