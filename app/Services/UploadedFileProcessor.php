<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UploadedFileProcessor
{
    private const DEFAULT_WEBP_QUALITY = 80;

    /**
     * Store the uploaded file, converting images to WebP when possible.
     *
     * @return array{path: string, mime: string}
     */
    public function store(UploadedFile $file, string $directory, string $disk = 'public'): array
    {
        $maxSize = 10 * 1024 * 1024; // 10 MB in bytes
        if ($file->getSize() > $maxSize) {
            throw ValidationException::withMessages([
                'file' => 'The image size must not exceed 10 MB.',
            ]);
        }

        $mime = $file->getMimeType() ?: $file->getClientMimeType();

        if ($this->shouldConvertToWebp($mime)) {
            $converted = $this->storeImageAsWebp($file, $directory, $disk);
            if ($converted !== null) {
                return $converted;
            }
        }

        return $this->storeOriginal($file, $directory, $disk, $mime);
    }

    private function shouldConvertToWebp(?string $mime): bool
    {
        if ($mime === null || !str_starts_with($mime, 'image/')) {
            return false;
        }

        if (in_array($mime, ['image/gif', 'image/svg+xml', 'image/webp'], true)) {
            return false;
        }

        return function_exists('imagecreatefromstring') && function_exists('imagewebp');
    }

    /**
     * @return array{path: string, mime: string}|null
     */
    private function storeImageAsWebp(UploadedFile $file, string $directory, string $disk): ?array
    {
        $contents = @file_get_contents($file->getRealPath());
        if ($contents === false) {
            return null;
        }

        $image = @imagecreatefromstring($contents);
        if ($image === false) {
            return null;
        }

        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);

        ob_start();
        $success = imagewebp($image, null, self::DEFAULT_WEBP_QUALITY);
        $binary = ob_get_clean();

        imagedestroy($image);

        if (!$success || $binary === false) {
            return null;
        }

        $filename = Str::uuid()->toString() . '.webp';
        $path = trim($directory, '/') . '/' . $filename;

        $stored = Storage::disk($disk)->put($path, $binary, ['visibility' => 'public']);
        if (!$stored) {
            return null;
        }

        return [
            'path' => $path,
            'mime' => 'image/webp',
        ];
    }

    /**
     * @return array{path: string, mime: string}
     */
    private function storeOriginal(UploadedFile $file, string $directory, string $disk, ?string $mime): array
    {
        $path = $file->store($directory, $disk);

        return [
            'path' => $path,
            'mime' => $file->getClientMimeType() ?: $mime ?: 'application/octet-stream',
        ];
    }
}
