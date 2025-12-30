<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogAllRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        try {
            $response = $next($request);
            
            // Log request details
            $duration = microtime(true) - $startTime;
            $statusCode = $response->getStatusCode();
            
            // Log warning untuk response errors (4xx, 5xx)
            if ($statusCode >= 400) {
                $logData = [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'status' => $statusCode,
                    'duration_ms' => round($duration * 1000, 2),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'user_id' => auth()->id() ?? 'guest',
                    'referer' => $request->header('referer'),
                ];
                
                // Tambahkan request data untuk POST/PUT/PATCH
                if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                    $logData['request_data'] = $this->sanitizeRequestData($request->all());
                }
                
                if ($statusCode >= 500) {
                    Log::error('HTTP 5xx Error', $logData);
                } elseif ($statusCode === 419) {
                    Log::warning('CSRF Token Mismatch (419)', $logData);
                } elseif ($statusCode >= 400) {
                    Log::warning('HTTP 4xx Error', $logData);
                }
            }
            
            // Log slow requests (lebih dari 2 detik)
            if ($duration > 2) {
                Log::warning('Slow Request Detected', [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'duration_ms' => round($duration * 1000, 2),
                    'status' => $statusCode,
                ]);
            }
            
            return $response;
            
        } catch (\Throwable $e) {
            // Log critical error jika ada exception
            Log::critical('Request Exception', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'ip' => $request->ip(),
                'user_id' => auth()->id() ?? 'guest',
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Sanitize request data untuk logging (remove sensitive data)
     */
    private function sanitizeRequestData(array $data): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'token', 'secret', 'api_key'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '***REDACTED***';
            }
        }
        
        return $data;
    }
}
