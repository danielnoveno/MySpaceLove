<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicFilePreviewController extends Controller
{
    /**
     * MIME types that browsers may render inline without active content.
     *
     * @var list<string>
     */
    private const INLINE_MIME_TYPES = [
        'application/pdf',
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    public function __invoke(string $path): BinaryFileResponse
    {
        $normalizedPath = str_replace('\\', '/', $path);

        abort_if(
            $normalizedPath === ''
            || str_contains($normalizedPath, "\0")
            || collect(explode('/', $normalizedPath))->contains('..'),
            Response::HTTP_NOT_FOUND,
        );

        $disk = Storage::disk('public');

        abort_unless($disk->exists($normalizedPath), Response::HTTP_NOT_FOUND);

        $filePath = realpath($disk->path($normalizedPath));
        $diskRoot = realpath($disk->path(''));

        abort_unless(
            $filePath !== false
            && $diskRoot !== false
            && str_starts_with($filePath, $diskRoot.DIRECTORY_SEPARATOR),
            Response::HTTP_NOT_FOUND,
        );

        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';

        abort_unless(in_array($mimeType, self::INLINE_MIME_TYPES, true), Response::HTTP_UNSUPPORTED_MEDIA_TYPE);

        return response()->file($filePath, [
            'Content-Disposition' => 'inline; filename="'.basename($filePath).'"',
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: blob:",
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
