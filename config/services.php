<?php

$appUrl = config('app.url');
$defaultGoogleRedirect = $appUrl ? rtrim($appUrl, '/') . '/auth/google/callback' : null;

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', $defaultGoogleRedirect),
        'allowed_domain' => env('GOOGLE_ALLOWED_DOMAIN'),
    ],

    'spotify' => [
        'client_id' => env('SPOTIFY_CLIENT_ID'),
        'client_secret' => env('SPOTIFY_CLIENT_SECRET'),
        'redirect_uri' => env('SPOTIFY_REDIRECT_URI'),
        'scopes' => env('SPOTIFY_SCOPES', ''),
        'refresh_margin' => (int) env('SPOTIFY_REFRESH_MARGIN', 300),
    ],

    'tencent' => [
        'tui_room_kit' => [
            'sdk_app_id' => env('TENCENT_SDK_APP_ID'),
            'secret_key' => env('TENCENT_SDK_SECRET_KEY'),
            'user_sig_ttl' => (int) env('TENCENT_USER_SIG_TTL', 86400),
        ],
    ],

];
