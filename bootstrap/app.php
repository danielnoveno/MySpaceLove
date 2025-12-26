<?php

use App\Http\Middleware\EnsureSpaceAccess;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SanitizeInput;
use App\Http\Middleware\DetectSuspiciousActivity;
use App\Http\Middleware\RateLimitMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withEvents(discover: [
        app_path('Listeners'),
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        // Keep the XSRF-TOKEN cookie unencrypted so it can be read by the browser
        // and sent back via the X-XSRF-TOKEN header for CSRF validation.
        $middleware->encryptCookies(except: [
            'XSRF-TOKEN',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\SanitizeInput::class,
            \App\Http\Middleware\DetectSuspiciousActivity::class,
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\SanitizeInput::class,
            \App\Http\Middleware\DetectSuspiciousActivity::class,
        ]);

        $middleware->alias([
            'space.access' => EnsureSpaceAccess::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'rate.limit' => \App\Http\Middleware\RateLimitMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
