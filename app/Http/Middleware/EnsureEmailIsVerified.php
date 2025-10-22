<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * This overrides Laravel's default behaviour so XHR / Inertia requests
     * are redirected instead of returning a plain JSON response that breaks
     * the client-side navigation flow.
     */
    public function handle($request, Closure $next, $redirectToRoute = null)
    {
        $user = $request->user();

        if (
            !$user ||
            ($user instanceof MustVerifyEmail && !$user->hasVerifiedEmail())
        ) {
            $redirectUrl = URL::route($redirectToRoute ?: 'verification.notice');

            if ($request->header('X-Inertia')) {
                return Inertia::location($redirectUrl);
            }

            return $request->expectsJson()
                ? abort(403, 'Your email address is not verified.')
                : Redirect::guest($redirectUrl);
        }

        return $next($request);
    }
}
