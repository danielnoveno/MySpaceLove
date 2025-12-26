<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DetectSuspiciousActivity
{
    /**
     * Suspicious patterns to detect
     * These patterns are designed to catch actual attacks while minimizing false positives
     */
    protected array $suspiciousPatterns = [
        // SQL Injection patterns - more specific to avoid false positives
        '/(\bUNION\b\s+ALL\s+\bSELECT\b)/i',
        '/(\bUNION\b\s+\bSELECT\b)/i',
        "/(\'\\s*OR\\s+\'?1\'?\\s*=\\s*\'?1)/i",
        '/(\"\\s*OR\\s+\"?1\"?\\s*=\\s*\"?1)/i',
        '/(\bDROP\b\s+\bTABLE\b)/i',
        '/(\bDROP\b\s+\bDATABASE\b)/i',
        '/;\s*(DROP|DELETE|UPDATE|INSERT)\s+/i',
        
        // XSS patterns - more specific
        '/<script[^>]*>.*?<\/script>/is',
        '/<iframe[^>]*>/i',
        '/javascript:\s*(?:alert|confirm|prompt)/i',
        '/on(load|error|click|mouseover)\s*=\s*["\']?[^"\'>\s]+/i',
        
        // Path traversal - actual dangerous patterns
        '/\.\.[\\/\\\\]+\.\.[\\/\\\\]/i', // Multiple directory traversals
        '/\.\.[\\/\\\\]+(etc|proc|var|usr|bin)/i',
        '/\/etc\/passwd/i',
        '/\/proc\/self/i',
        '/\/windows\/system32/i',
        
        // Command injection - only in suspicious contexts
        '/;\s*(rm|wget|curl|nc|bash|sh|cmd|powershell)\s+/i',
        '/\|\s*(rm|wget|curl|nc|bash|sh|cmd|powershell)\s+/i',
        '/`[^`]*(rm|wget|curl|nc|bash|sh|cmd|powershell)/i',
        '/\$\([^)]*(rm|wget|curl|nc|bash|sh|cmd|powershell)/i',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check for suspicious patterns in request
        if ($this->detectSuspiciousPatterns($request)) {
            $this->logSuspiciousActivity($request, 'Suspicious pattern detected');
            
            // Block the request
            return response()->json([
                'message' => 'Forbidden. Suspicious activity detected.',
            ], 403);
        }

        // Check for unusual request sizes
        if ($this->isUnusualRequestSize($request)) {
            $this->logSuspiciousActivity($request, 'Unusual request size');
        }

        // Check for suspicious user agents
        if ($this->isSuspiciousUserAgent($request)) {
            $this->logSuspiciousActivity($request, 'Suspicious user agent');
        }

        return $next($request);
    }

    /**
     * Detect suspicious patterns in request
     */
    protected function detectSuspiciousPatterns(Request $request): bool
    {
        $input = json_encode($request->all());
        $url = $request->fullUrl();
        $userAgent = $request->userAgent() ?? '';

        foreach ($this->suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $input) || 
                preg_match($pattern, $url) || 
                preg_match($pattern, $userAgent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if request size is unusual
     */
    protected function isUnusualRequestSize(Request $request): bool
    {
        $contentLength = $request->header('Content-Length', 0);
        
        // Flag requests larger than 10MB (excluding file uploads)
        if (!$request->hasFile('file') && $contentLength > 10 * 1024 * 1024) {
            return true;
        }

        return false;
    }

    /**
     * Check for suspicious user agents
     */
    protected function isSuspiciousUserAgent(Request $request): bool
    {
        $userAgent = strtolower($request->userAgent() ?? '');
        
        $suspiciousAgents = [
            'sqlmap',
            'nikto',
            'nmap',
            'masscan',
            'metasploit',
            'burp',
            'zap',
            'acunetix',
            'nessus',
            'openvas',
        ];

        foreach ($suspiciousAgents as $agent) {
            if (str_contains($userAgent, $agent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log suspicious activity
     */
    protected function logSuspiciousActivity(Request $request, string $reason): void
    {
        Log::warning('Suspicious activity detected', [
            'reason' => $reason,
            'ip' => $request->ip(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
            'input' => $request->except(['password', 'password_confirmation']),
            'timestamp' => now()->toDateTimeString(),
        ]);

        // You can also send email alerts or notifications here
        // Mail::to('security@your-domain.com')->send(new SuspiciousActivityAlert($request, $reason));
    }
}
