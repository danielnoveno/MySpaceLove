<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SpaceInvitation;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use App\Support\GoogleOAuth;
use Throwable;

class SocialLoginController extends Controller
{
    /**
     * Redirect the user to Google's OAuth consent screen.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        $scopes = ['openid', 'profile', 'email'];
        $driver = Socialite::driver('google')->scopes($scopes);
        $redirectUri = GoogleOAuth::redirectUri();

        if ($redirectUri) {
            $driver->redirectUrl($redirectUri);
        }
        $allowedDomain = $this->allowedGoogleDomain();

        if ($allowedDomain) {
            $driver->with(['hd' => $allowedDomain]);
        }

        return $driver->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $driver = Socialite::driver('google');
            $redirectUri = GoogleOAuth::redirectUri();

            if ($redirectUri) {
                $driver->redirectUrl($redirectUri);
            }

            $googleUser = $driver->user();
        } catch (Throwable $exception) {
            report($exception);

            return redirect()
                ->route('login')
                ->withErrors([
                    'google' => 'Autentikasi Google gagal. Silakan coba lagi.',
                ]);
        }

        $email = $googleUser->getEmail();

        if (! $email) {
            return redirect()
                ->route('login')
                ->withErrors([
                    'google' => 'Google tidak mengembalikan email yang valid.',
                ]);
        }

        $allowedDomain = $this->allowedGoogleDomain();
        if ($allowedDomain && ! $this->emailMatchesDomain($email, $allowedDomain, $googleUser->user['hd'] ?? null)) {
            return redirect()
                ->route('login')
                ->withErrors([
                    'google' => 'Email Google kamu tidak sesuai domain yang diizinkan.',
                ]);
        }

        $isNewUser = false;

        DB::beginTransaction();

        try {
            $user = User::where('email', $email)->lockForUpdate()->first();

            if (! $user) {
                $user = $this->createUserFromGoogle($googleUser);
                $isNewUser = true;
                event(new Registered($user));
            } else {
                $this->updateExistingUserFromGoogle($user, $googleUser);
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);

            return redirect()
                ->route('login')
                ->withErrors([
                    'google' => 'Gagal menyelesaikan proses login Google.',
                ]);
        }

        Auth::login($user, remember: true);
        request()->session()->regenerate();

        if ($redirect = $this->consumePendingInvitation($user)) {
            return $redirect;
        }

        $intended = session()->pull('url.intended');

        if ($intended) {
            $intendedPath = parse_url($intended, PHP_URL_PATH) ?? '';

            if (Str::startsWith($intendedPath, '/api/')) {
                return redirect()->route('dashboard', absolute: false)
                    ->with('status', __('app.auth.flash.google_login_success'));
            }

            session()->put('url.intended', $intended);
        }

        return redirect()
            ->intended(route('dashboard', absolute: false))
            ->with('status', __('app.auth.flash.google_login_success'));
    }

    private function createUserFromGoogle(object $googleUser): User
    {
        $name = $googleUser->getName() ?: Str::before($googleUser->getEmail(), '@');
        $usernameSeed = $googleUser->getNickname() ?: $name;

        return User::create([
            'name' => $name,
            'email' => $googleUser->getEmail(),
            'email_verified_at' => now(),
            'password' => Str::random(32),
            'username' => User::generateUniqueUsername($usernameSeed ?: $googleUser->getEmail()),
            'partner_code' => User::generatePartnerCode(),
            'auth_provider' => 'google',
            'provider_id' => $googleUser->getId(),
            'provider_avatar' => $googleUser->getAvatar(),
        ]);
    }

    private function updateExistingUserFromGoogle(User $user, object $googleUser): void
    {
        $payload = [
            'auth_provider' => 'google',
            'provider_id' => $googleUser->getId(),
            'provider_avatar' => $googleUser->getAvatar(),
        ];

        if (! $user->email_verified_at) {
            $payload['email_verified_at'] = now();
        }

        if (! $user->name && $googleUser->getName()) {
            $payload['name'] = $googleUser->getName();
        }

        $user->forceFill($payload)->save();
    }

    private function consumePendingInvitation(User $user): ?RedirectResponse
    {
        if (! Schema::hasTable('space_invitations')) {
            return null;
        }

        $invitation = SpaceInvitation::query()
            ->pending()
            ->where(function ($query) use ($user): void {
                $query->where('invitee_email', $user->email)
                    ->orWhere('invitee_id', $user->id);
            })
            ->with(['space.userOne'])
            ->first();

        if (! $invitation || ! $invitation->space || $invitation->space->user_two_id) {
            return null;
        }

        $space = $invitation->space;
        $space->user_two_id = $user->id;

        if ($space->userOne) {
            $space->title = "{$space->userOne->name} & {$user->name}";
        }

        $space->save();

        $invitation->update([
            'status' => 'accepted',
            'invitee_id' => $user->id,
            'accepted_at' => now(),
        ]);

        return redirect()
            ->route('spaces.dashboard', ['space' => $space->slug])
            ->with('status', __('app.auth.flash.space_joined'));
    }

    private function allowedGoogleDomain(): ?string
    {
        $domain = config('services.google.allowed_domain');

        if (! $domain) {
            return null;
        }

        $domain = trim($domain);

        return $domain === '' ? null : $domain;
    }

    private function emailMatchesDomain(string $email, string $allowedDomain, ?string $hostedDomainClaim = null): bool
    {
        $allowed = Str::lower($allowedDomain);

        if ($hostedDomainClaim) {
            return Str::lower($hostedDomainClaim) === $allowed;
        }

        $emailDomain = Str::lower(Str::after($email, '@'));

        return $emailDomain === $allowed;
    }
}
