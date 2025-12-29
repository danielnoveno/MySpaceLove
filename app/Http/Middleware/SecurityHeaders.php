<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent clickjacking attacks
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Enable XSS protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Enforce HTTPS (HSTS)
        if (config('app.env') === 'production') {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy (formerly Feature Policy)
        // Allow camera and microphone for Jitsi video calls
        $response->headers->set('Permissions-Policy', 
            'geolocation=(self), ' .
            'microphone=(self "https://8x8.vc" "https://*.jitsi.net" "https://*.jitsi.org"), ' .
            'camera=(self "https://8x8.vc" "https://*.jitsi.net" "https://*.jitsi.org"), ' .
            'payment=(), ' .
            'usb=(), ' .
            'magnetometer=(), ' .
            'gyroscope=(), ' .
            'accelerometer=()'
        );

        // Content Security Policy
        if (config('security.csp_enabled', true)) {
            $csp = $this->buildContentSecurityPolicy();
            $response->headers->set('Content-Security-Policy', $csp);
        }

        // Remove server information
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }

    /**
     * Build Content Security Policy header
     */
    private function buildContentSecurityPolicy(): string
    {
        $isLocal = config('app.env') === 'local';
        
        $policies = [
            "default-src 'self'" . ($isLocal ? " http://localhost:* http://127.0.0.1:*" : ""),
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://8x8.vc https://*.jitsi.net https://*.jitsi.org" . ($isLocal ? " http://localhost:* http://127.0.0.1:*" : ""),
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net" . ($isLocal ? " http://localhost:* http://127.0.0.1:*" : ""),
            "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
            "img-src 'self' data: https: blob:",
            "media-src 'self' blob: https:",
            "connect-src 'self' https://api.daily.co https://generativelanguage.googleapis.com https://8x8.vc https://*.jitsi.net https://*.jitsi.org wss: ws: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",
            "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://*.daily.co https://8x8.vc https://*.jitsi.net https://*.jitsi.org",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
        ];
        
        // Only add upgrade-insecure-requests in production
        if (!$isLocal) {
            $policies[] = "upgrade-insecure-requests";
        }

        return implode('; ', $policies);
    }
}
