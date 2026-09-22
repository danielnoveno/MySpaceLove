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
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

if (! function_exists('safe_auth_id')) {
    function safe_auth_id(): mixed
    {
        try {
            return app()->bound('auth') ? (auth()->id() ?? 'guest') : 'guest';
        } catch (Throwable $e) {
            return 'guest';
        }
    }
}

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

        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO
                | Request::HEADER_X_FORWARDED_PREFIX
        );

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
        // In serverless cold starts, exceptions can happen before every Laravel
        // service (including `view`) is fully bound. Rendering Laravel's default
        // error pages then causes a second exception: "Target class [view] does
        // not exist", hiding the original error. Return a plain response in
        // that case and write the real exception to stderr for Vercel logs.
        //
        // IMPORTANT: We must NOT intercept ValidationException, TokenMismatchException,
        // or Inertia exceptions — Laravel/Inertia needs to handle those normally so
        // form errors, CSRF issues, and redirects work correctly.
        $exceptions->render(function (Throwable $e, Request $request) {
            // Let Laravel handle these natively — they have special rendering logic
            if (
                $e instanceof \Illuminate\Validation\ValidationException
                || $e instanceof \Illuminate\Session\TokenMismatchException
                || $e instanceof \Illuminate\Auth\AuthenticationException
                || $e instanceof \Inertia\Exception\InvalidInertiaComponent
            ) {
                return null; // Fall through to Laravel default handler
            }

            if (getenv('VERCEL') || getenv('NOW_REGION') || ! app()->bound('view') || ! app()->bound('translator')) {
                file_put_contents('php://stderr', sprintf(
                    "Laravel rendered exception summary: %s | %s:%d\n",
                    $e->getMessage(),
                    $e->getFile(),
                    $e->getLine()
                ));

                $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

                if ($request->expectsJson() || $request->is('api/*')) {
                    return new \Symfony\Component\HttpFoundation\JsonResponse([
                        'message' => match ($status) {
                            404 => 'Not Found',
                            default => 'Internal Server Error',
                        },
                    ], $status);
                }

                return new \Symfony\Component\HttpFoundation\Response(
                    $status === 404 ? 'Not Found' : 'Internal Server Error',
                    $status
                );
            }
        });

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
                'user_id' => safe_auth_id(),
            ];

            file_put_contents('php://stderr', sprintf(
                "Laravel reported exception summary: %s | %s:%d\n",
                $e->getMessage(),
                $e->getFile(),
                $e->getLine()
            ));

            try {
                Log::error('Exception occurred', $context);
            } catch (Throwable $logException) {
                file_put_contents('php://stderr', sprintf(
                    "Laravel exception: %s in %s:%d\n%s\n",
                    $e->getMessage(),
                    $e->getFile(),
                    $e->getLine(),
                    $e->getTraceAsString()
                ));
            }
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
