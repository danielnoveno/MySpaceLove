<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class SecureFileUploadService
{
    /**
     * Allowed MIME types for images
     */
    protected array $allowedImageMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    /**
     * Allowed MIME types for videos
     */
    protected array $allowedVideoMimes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
    ];

    /**
     * Maximum file sizes (in bytes)
     */
    protected int $maxImageSize = 10 * 1024 * 1024; // 10MB
    protected int $maxVideoSize = 50 * 1024 * 1024; // 50MB

    /**
     * Validate and process uploaded file
     */
    public function validateAndProcess(UploadedFile $file, string $type = 'image'): array
    {
        // Validate file
        $this->validateFile($file, $type);

        // Check for malicious content
        $this->scanForMalware($file);

        // Process based on type
        if ($type === 'image') {
            return $this->processImage($file);
        } elseif ($type === 'video') {
            return $this->processVideo($file);
        }

        throw new \InvalidArgumentException('Invalid file type');
    }

    /**
     * Validate uploaded file
     */
    protected function validateFile(UploadedFile $file, string $type): void
    {
        // Check if file is valid
        if (!$file->isValid()) {
            throw new \InvalidArgumentException('Invalid file upload');
        }

        // Check file size
        $maxSize = $type === 'image' ? $this->maxImageSize : $this->maxVideoSize;
        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException('File size exceeds maximum allowed size');
        }

        // Check MIME type
        $allowedMimes = $type === 'image' ? $this->allowedImageMimes : $this->allowedVideoMimes;
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \InvalidArgumentException('Invalid file type');
        }

        // Check file extension
        $extension = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = $type === 'image' 
            ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
            : ['mp4', 'mpeg', 'mov', 'avi', 'webm'];
        
        if (!in_array($extension, $allowedExtensions)) {
            throw new \InvalidArgumentException('Invalid file extension');
        }

        // Verify file content matches extension
        $this->verifyFileContent($file, $type);
    }

    /**
     * Verify file content matches its extension
     */
    protected function verifyFileContent(UploadedFile $file, string $type): void
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file->getRealPath());
        finfo_close($finfo);

        $allowedMimes = $type === 'image' ? $this->allowedImageMimes : $this->allowedVideoMimes;
        
        if (!in_array($mimeType, $allowedMimes)) {
            Log::warning('File content mismatch', [
                'declared_mime' => $file->getMimeType(),
                'actual_mime' => $mimeType,
                'filename' => $file->getClientOriginalName(),
            ]);
            
            throw new \InvalidArgumentException('File content does not match extension');
        }
    }

    /**
     * Scan file for malware (basic check)
     */
    protected function scanForMalware(UploadedFile $file): void
    {
        // Read first few bytes to check for suspicious patterns
        $handle = fopen($file->getRealPath(), 'rb');
        $header = fread($handle, 1024);
        fclose($handle);

        // Check for PHP code in uploaded files
        $suspiciousPatterns = [
            '/<\?php/i',
            '/<\?=/i',
            '/eval\s*\(/i',
            '/base64_decode\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/passthru\s*\(/i',
            '/shell_exec\s*\(/i',
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $header)) {
                Log::critical('Malware detected in upload', [
                    'filename' => $file->getClientOriginalName(),
                    'ip' => request()->ip(),
                    'user_id' => auth()->id(),
                ]);
                
                throw new \InvalidArgumentException('Malicious content detected');
            }
        }

        // If ClamAV is available, use it
        if ($this->isClamAvAvailable()) {
            $this->scanWithClamAv($file);
        }
    }

    /**
     * Process image file
     */
    protected function processImage(UploadedFile $file): array
    {
        try {
            // Load image
            $image = Image::make($file->getRealPath());

            // Strip EXIF data for privacy
            $image->orientate();

            // Resize if too large (max 2000px on longest side)
            if ($image->width() > 2000 || $image->height() > 2000) {
                $image->resize(2000, 2000, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            // Generate secure filename
            $filename = $this->generateSecureFilename('webp');
            $path = 'uploads/images/' . date('Y/m');

            // Convert to WebP for better compression
            $image->encode('webp', 85);

            // Save to storage
            Storage::disk('public')->put(
                $path . '/' . $filename,
                $image->stream()->__toString()
            );

            return [
                'path' => $path . '/' . $filename,
                'url' => Storage::disk('public')->url($path . '/' . $filename),
                'size' => $image->filesize(),
                'width' => $image->width(),
                'height' => $image->height(),
            ];
        } catch (\Exception $e) {
            Log::error('Image processing failed', [
                'error' => $e->getMessage(),
                'filename' => $file->getClientOriginalName(),
            ]);
            
            throw new \InvalidArgumentException('Failed to process image');
        }
    }

    /**
     * Process video file
     */
    protected function processVideo(UploadedFile $file): array
    {
        // Generate secure filename
        $filename = $this->generateSecureFilename($file->getClientOriginalExtension());
        $path = 'uploads/videos/' . date('Y/m');

        // Store video
        $storedPath = $file->storeAs($path, $filename, 'public');

        return [
            'path' => $storedPath,
            'url' => Storage::disk('public')->url($storedPath),
            'size' => $file->getSize(),
        ];
    }

    /**
     * Generate secure random filename
     */
    protected function generateSecureFilename(string $extension): string
    {
        return bin2hex(random_bytes(16)) . '_' . time() . '.' . $extension;
    }

    /**
     * Check if ClamAV is available
     */
    protected function isClamAvAvailable(): bool
    {
        return function_exists('exec') && 
               !in_array('exec', explode(',', ini_get('disable_functions'))) &&
               shell_exec('which clamscan') !== null;
    }

    /**
     * Scan file with ClamAV
     */
    protected function scanWithClamAv(UploadedFile $file): void
    {
        $output = shell_exec('clamscan ' . escapeshellarg($file->getRealPath()));
        
        if (str_contains($output, 'FOUND')) {
            Log::critical('Virus detected by ClamAV', [
                'filename' => $file->getClientOriginalName(),
                'scan_result' => $output,
                'ip' => request()->ip(),
                'user_id' => auth()->id(),
            ]);
            
            throw new \InvalidArgumentException('Virus detected in file');
        }
    }

    /**
     * Delete file securely
     */
    public function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        
        return false;
    }
}
