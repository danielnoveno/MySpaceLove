<?php

namespace App\Support;

use Illuminate\Support\Str;

class GoogleOAuth
{
    /**
     * Determine whether Google OAuth credentials are configured.
     */
    public static function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(self::redirectUri());
    }

    /**
     * Resolve the redirect URI for Google OAuth, falling back to APP_URL when unset.
     */
    public static function redirectUri(): ?string
    {
        $configured = config('services.google.redirect');

        if (filled($configured)) {
            return $configured;
        }

        $appUrl = config('app.url');

        if (blank($appUrl)) {
            return null;
        }

        $base = rtrim($appUrl, '/');
        $callbackPath = route('login.google.callback', absolute: false);

        return Str::finish($base, '/') . ltrim($callbackPath, '/');
    }
}
