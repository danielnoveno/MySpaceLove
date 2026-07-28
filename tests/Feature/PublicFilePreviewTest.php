<?php

namespace Tests\Feature;

use App\Http\Controllers\PublicFilePreviewController;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

class PublicFilePreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_can_preview_a_safe_public_file(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('docs/example.pdf', "%PDF-1.4\n");

        $this->actingAs(User::factory()->create())
            ->get('/preview/docs/example.pdf')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_path_traversal_is_rejected(): void
    {
        Storage::fake('public');

        $this->expectException(NotFoundHttpException::class);

        app(PublicFilePreviewController::class)('../private/secret.pdf');
    }

    public function test_active_content_is_not_rendered_inline(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('docs/payload.html', '<script>alert(1)</script>');

        $this->actingAs(User::factory()->create())
            ->get('/preview/docs/payload.html')
            ->assertUnsupportedMediaType();
    }
}
