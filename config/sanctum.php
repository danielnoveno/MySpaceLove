<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;
use Laravel\Sanctum\Sanctum;

$normalizeStatefulDomains = static function (array $domains): array {
    $normalized = [];

    foreach ($domains as $domain) {
        foreach (explode(',', (string) $domain) as $part) {
            $part = trim($part);

            if ($part !== '') {
                $normalized[] = $part;
            }
        }
    }

    return array_values(array_unique($normalized));
};

$statefulDomains = $normalizeStatefulDomains([
    env('SANCTUM_STATEFUL_DOMAINS', ''),
]);

$defaultStatefulDomains = [
    'localhost',
    'localhost:3000',
    'localhost:5173',
    '127.0.0.1',
    '127.0.0.1:8000',
    '127.0.0.1:5173',
    '::1',
    Sanctum::currentApplicationUrlWithPort(),
    Sanctum::currentRequestHost(),
];

return [
    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | First-party SPA requests from these hosts may authenticate using the
    | Laravel session cookie. Include the current Vercel host dynamically so
    | custom aliases such as myspacelove.vercel.app keep working even when
    | APP_URL or Vercel preview domains differ.
    |
    */

    'stateful' => $normalizeStatefulDomains(array_merge(
        $statefulDomains,
        $defaultStatefulDomains,
    )),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    */

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    */

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],
];
