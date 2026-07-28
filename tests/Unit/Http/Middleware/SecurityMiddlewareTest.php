<?php

namespace Tests\Unit\Http\Middleware;

use App\Http\Middleware\SanitizeInput;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Http\Request;
use Tests\TestCase;

class SecurityMiddlewareTest extends TestCase
{
    public function test_input_sanitizer_removes_control_bytes_without_trimming_content(): void
    {
        $request = Request::create('/test', 'POST', [
            'password' => '  keep spaces  ',
            'nested' => ['value' => "safe\0text\x07"],
        ]);

        (new SanitizeInput)->handle($request, fn () => response()->noContent());

        $this->assertSame('  keep spaces  ', $request->input('password'));
        $this->assertSame('safetext', $request->input('nested.value'));
    }

    public function test_production_security_headers_exclude_development_sources(): void
    {
        config()->set('app.env', 'production');
        config()->set('security.csp_enabled', true);

        $response = (new SecurityHeaders)->handle(
            Request::create('/test'),
            fn () => response('ok'),
        );

        $csp = (string) $response->headers->get('Content-Security-Policy');

        $this->assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));
        $this->assertSame('SAMEORIGIN', $response->headers->get('X-Frame-Options'));
        $this->assertSame(
            'max-age=31536000; includeSubDomains; preload',
            $response->headers->get('Strict-Transport-Security'),
        );
        $this->assertStringNotContainsString("'unsafe-eval'", $csp);
        $this->assertStringNotContainsString('localhost', $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);
        $this->assertStringContainsString('upgrade-insecure-requests', $csp);
    }
}
