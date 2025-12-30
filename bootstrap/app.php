<?php

use App\Http\Middleware\EnsureSpaceAccess;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SanitizeInput;
use App\Http\Middleware\DetectSuspiciousActivity;
use App\Http\Middleware\RateLimitMiddleware;
use App\Http\Middleware\LogAllRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

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

        // Global middleware - applied to all requests
        $middleware->use([
            \App\Http\Middleware\LogAllRequests::class, // Log all requests & errors
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
        // Enhanced exception handling untuk production debugging
        
        // Log semua exceptions dengan detail lengkap
        $exceptions->report(function (Throwable $e) {
            $context = [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'ip' => request()->ip(),
                'user_id' => auth()->id() ?? 'guest',
            ];

            // Tambahkan stack trace untuk production debugging
            if (app()->environment('production')) {
                $context['trace'] = $e->getTraceAsString();
            }

            Log::error('Exception occurred', $context);
        });

        // Custom rendering untuk specific exceptions
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found'
                ], 404);
            }
        });

        // Log CSRF token mismatch dengan detail
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, Request $request) {
            Log::warning('CSRF Token Mismatch', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referer' => $request->header('referer'),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'CSRF token mismatch. Please refresh and try again.'
                ], 419);
            }
        });
    })->create();
