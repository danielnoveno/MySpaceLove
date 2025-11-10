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
    public function store(
        UploadedFile $file,
        string $directory,
        string $disk = 'public',
        ?string $field = null,
        ?string $tooLargeMessageKey = null
    ): array
    {
        $maxSize = 10 * 1024 * 1024; // 10 MB in bytes
        $fieldName = $field ?? 'file';
        $sizeMessageKey = $tooLargeMessageKey ?? 'app.uploads.errors.generic_file_too_large';

        if ($file->getSize() !== false && $file->getSize() > $maxSize) {
            throw ValidationException::withMessages([
                $fieldName => __($sizeMessageKey),
            ]);
        }

        $mime = $file->getMimeType() ?: $file->getClientMimeType();

        if ($mime === 'image/webp') {
            return $this->storeOriginal($file, $directory, $disk, $mime);
        }

        if ($this->shouldConvertToWebp($mime)) {
            if (!$this->supportsWebpConversion()) {
                throw ValidationException::withMessages([
                    $fieldName => __('app.uploads.errors.image_conversion_failed'),
                ]);
            }

            return $this->storeImageAsWebp($file, $directory, $disk, $fieldName);
        }

        return $this->storeOriginal($file, $directory, $disk, $mime);
    }

    private function shouldConvertToWebp(?string $mime): bool
    {
        if ($mime === null || !str_starts_with($mime, 'image/')) {
            return false;
        }

        if (in_array($mime, ['image/gif', 'image/svg+xml'], true)) {
            return false;
        }

        return true;
    }

    /**
     * @return array{path: string, mime: string}|null
     */
    private function storeImageAsWebp(
        UploadedFile $file,
        string $directory,
        string $disk,
        string $fieldName
    ): array
    {
        $contents = @file_get_contents($file->getRealPath());
        if ($contents === false) {
            throw ValidationException::withMessages([
                $fieldName => __('app.uploads.errors.image_conversion_failed'),
            ]);
        }

        $image = @imagecreatefromstring($contents);
        if ($image === false) {
            throw ValidationException::withMessages([
                $fieldName => __('app.uploads.errors.image_conversion_failed'),
            ]);
        }

        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);

        ob_start();
        $success = imagewebp($image, null, self::DEFAULT_WEBP_QUALITY);
        $binary = ob_get_clean();

        imagedestroy($image);

        if (!$success || $binary === false) {
            throw ValidationException::withMessages([
                $fieldName => __('app.uploads.errors.image_conversion_failed'),
            ]);
        }

        $filename = Str::uuid()->toString() . '.webp';
        $path = trim($directory, '/') . '/' . $filename;

        $stored = Storage::disk($disk)->put($path, $binary, ['visibility' => 'public']);
        if (!$stored) {
            throw ValidationException::withMessages([
                $fieldName => __('app.uploads.errors.generic_file_save_failed'),
            ]);
        }

        return [
            'path' => $path,
            'mime' => 'image/webp',
        ];
    }

    private function supportsWebpConversion(): bool
    {
        return function_exists('imagecreatefromstring') && function_exists('imagewebp');
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
