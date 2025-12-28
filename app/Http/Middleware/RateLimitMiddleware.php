<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $limit = '60'): Response
    {
        $key = $this->resolveRequestSignature($request);
        
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            
            // Log suspicious activity
            \Log::warning('Rate limit exceeded', [
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'user_agent' => $request->userAgent(),
                'user_id' => $request->user()?->id,
            ]);
            
            return response()->json([
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key);

        $response = $next($request);

        return $this->addRateLimitHeaders($response, $limit, $key);
    }

    /**
     * Resolve request signature.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        if ($user = $request->user()) {
            return sha1('user:' . $user->id . '|' . $request->route()->getName());
        }

        return sha1('ip:' . $request->ip() . '|' . $request->route()->getName());
    }

    /**
     * Add rate limit headers to response.
     */
    protected function addRateLimitHeaders(Response $response, int $limit, string $key): Response
    {
        $response->headers->set('X-RateLimit-Limit', $limit);
        $response->headers->set('X-RateLimit-Remaining', max(0, $limit - RateLimiter::attempts($key)));
        
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $response->headers->set('X-RateLimit-Reset', RateLimiter::availableIn($key));
        }

        return $response;
    }
}
