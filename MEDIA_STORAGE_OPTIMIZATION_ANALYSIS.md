# Analisis dan Solusi Optimasi Penyimpanan Media - LoveSpace

## 📊 RINGKASAN EKSEKUTIF

Project LoveSpace memiliki **banyak sekali fitur upload media** yang berpotensi membuat server cepat penuh. Dokumen ini menganalisis semua input media dan memberikan solusi komprehensif untuk mengoptimalkan penyimpanan.

---

## 🔍 DAFTAR SEMUA INPUT MEDIA YANG DITEMUKAN

### 1. **Media Gallery** (Galeri Foto/Video)
- **Lokasi**: `MediaGalleryApiController.php`
- **Tipe File**: JPG, JPEG, PNG, GIF, MP4, MOV
- **Ukuran Max**: 30 MB per file
- **Jumlah Max**: 12 file per upload
- **Path Storage**: `spaces/{slug}/media/`
- **Status Konversi**: ✅ **Sudah menggunakan WebP untuk gambar**

### 2. **Countdown Images** (Gambar Countdown)
- **Lokasi**: `CountdownApiController.php`
- **Tipe File**: Image files
- **Ukuran Max**: 10 MB
- **Path Storage**: `countdowns/`
- **Status Konversi**: ✅ **Sudah menggunakan WebP**

### 3. **Timeline Photos** (Foto Timeline)
- **Lokasi**: `LoveTimelineApiController.php`
- **Tipe File**: Image files
- **Ukuran Max**: 10 MB
- **Jumlah**: Multiple images per timeline
- **Path Storage**: `spaces/{slug}/timeline/`
- **Status Konversi**: ✅ **Sudah menggunakan WebP**

### 4. **Documents** (Dokumen)
- **Lokasi**: `DocApiController.php`
- **Tipe File**: Various file types
- **Ukuran Max**: 10 MB
- **Path Storage**: `docs/`
- **Status Konversi**: ❌ **Tidak ada konversi (bukan gambar)**

### 5. **Memory Lane - Level Images** (3 Level)
- **Lokasi**: `MemoryLaneConfigController.php`
- **Tipe File**: Image files
- **Ukuran Max**: 10 MB per level
- **Jumlah**: 3 images (level_one, level_two, level_three)
- **Path Storage**: `spaces/{id}/memory-lane/`
- **Status Konversi**: ✅ **Sudah menggunakan WebP**

### 6. **Memory Lane - Flipbook Pages**
- **Lokasi**: `MemoryLaneConfigController.php`
- **Tipe File**: Image files
- **Ukuran Max**: 10 MB per page
- **Jumlah Max**: 10 pages
- **Path Storage**: `spaces/{id}/memory-lane/flipbook/`
- **Status Konversi**: ✅ **Sudah menggunakan WebP**

### 7. **Memory Lane - Flipbook Cover**
- **Lokasi**: `MemoryLaneConfigController.php`
- **Tipe File**: Image files
- **Ukuran Max**: 10 MB
- **Path Storage**: `spaces/{id}/memory-lane/flipbook/`
- **Status Konversi**: ✅ **Sudah menggunakan WebP**

### 8. **Profile Images** (Foto Profil)
- **Lokasi**: `ProfileController.php`
- **Tipe File**: Image files
- **Path Storage**: `profile-images/`
- **Status Konversi**: ⚠️ **Perlu dicek - menggunakan Laravel default store()**

---

## ✅ KABAR BAIK: OPTIMASI SUDAH BERJALAN!

### Sistem `UploadedFileProcessor` Sudah Aktif

Project Anda **SUDAH** menggunakan sistem optimasi yang sangat baik:

```php
// File: app/Services/UploadedFileProcessor.php
class UploadedFileProcessor
{
    private const DEFAULT_WEBP_QUALITY = 80;
    
    public function store(UploadedFile $file, string $directory, ...)
    {
        // ✅ Otomatis convert JPG/PNG ke WebP
        // ✅ Kompresi dengan quality 80%
        // ✅ Max size 10 MB
    }
}
```

**Fitur yang Sudah Berjalan:**
1. ✅ Auto-convert JPG/PNG/JPEG → WebP (quality 80%)
2. ✅ Validasi ukuran file max 10 MB
3. ✅ Penggunaan UUID untuk nama file (menghindari konflik)
4. ✅ Hapus file lama saat update/delete

---

## 🚨 MASALAH YANG DITEMUKAN

### 1. **Media Gallery - Video Files**
- **Masalah**: Video (MP4, MOV) tidak dikompresi
- **Ukuran Max**: 30 MB per video (terlalu besar!)
- **Dampak**: 12 video = 360 MB per upload

### 2. **Profile Images**
- **Masalah**: Tidak menggunakan `UploadedFileProcessor`
- **Kode Saat Ini**:
```php
$path = $request->file('profile_image')->store('profile-images', 'public');
```
- **Dampak**: Gambar profil tidak dikonversi ke WebP

### 3. **Tidak Ada Cleanup Otomatis**
- File lama tidak dihapus secara berkala
- Tidak ada sistem untuk hapus file yang tidak terpakai

### 4. **Tidak Ada CDN**
- Semua file disimpan di server lokal
- Tidak ada distribusi beban

---

## 💡 SOLUSI KOMPREHENSIF

### **SOLUSI 1: Integrasi Cloud Storage (REKOMENDASI UTAMA)**

#### A. **Cloudinary** (Paling Mudah & Powerful)

**Keuntungan:**
- ✅ **Free tier**: 25 GB storage + 25 GB bandwidth/bulan
- ✅ **Auto-optimization**: Otomatis kompresi & resize
- ✅ **Video compression**: Otomatis kompresi video
- ✅ **CDN global**: Loading cepat di seluruh dunia
- ✅ **Transformasi on-the-fly**: Resize, crop, format conversion
- ✅ **Backup otomatis**

**Implementasi:**

```bash
composer require cloudinary-labs/cloudinary-laravel
```

```php
// config/cloudinary.php
return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
];
```

```php
// Update UploadedFileProcessor.php
use Cloudinary\Cloudinary;

public function storeToCloud(UploadedFile $file, string $folder)
{
    $cloudinary = new Cloudinary();
    
    $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
        'folder' => $folder,
        'resource_type' => 'auto',
        'quality' => 'auto:good', // Auto-optimize
        'fetch_format' => 'auto', // Auto WebP untuk browser yang support
    ]);
    
    return [
        'path' => $result['secure_url'],
        'public_id' => $result['public_id'],
        'format' => $result['format'],
    ];
}
```

**Estimasi Penghematan:**
- Gambar: 60-80% lebih kecil
- Video: 40-60% lebih kecil
- Bandwidth: Gratis 25 GB/bulan

---

#### B. **AWS S3** (Scalable & Murah)

**Keuntungan:**
- ✅ **Sangat murah**: $0.023/GB/bulan (~Rp 350/GB)
- ✅ **Unlimited storage**
- ✅ **Lifecycle policies**: Auto-delete file lama
- ✅ **CloudFront CDN**: Distribusi global

**Implementasi:**

```bash
composer require league/flysystem-aws-s3-v3
```

```env
# .env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=ap-southeast-1
AWS_BUCKET=lovespace-media
AWS_URL=https://lovespace-media.s3.ap-southeast-1.amazonaws.com
```

```php
// config/filesystems.php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
],
```

**Lifecycle Policy untuk Auto-Delete:**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldMedia",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

---

#### C. **Backblaze B2** (Paling Murah)

**Keuntungan:**
- ✅ **Super murah**: $0.005/GB/bulan (~Rp 75/GB)
- ✅ **Free 10 GB storage**
- ✅ **Free 1 GB download/hari**
- ✅ **S3-compatible API**

---

### **SOLUSI 2: Optimasi Video (PENTING!)**

Video adalah konsumen storage terbesar. Implementasi kompresi video:

```bash
composer require pbmedia/laravel-ffmpeg
```

```php
// app/Services/VideoProcessor.php
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;

class VideoProcessor
{
    public function compressVideo(UploadedFile $video, string $outputPath)
    {
        $ffmpeg = FFMpeg::create();
        $videoFile = $ffmpeg->open($video->getRealPath());
        
        $format = new X264();
        $format->setKiloBitrate(1000); // 1 Mbps (good quality)
        $format->setAudioCodec('aac');
        $format->setAudioKiloBitrate(128);
        
        $videoFile->save($format, $outputPath);
        
        return $outputPath;
    }
    
    public function generateThumbnail(UploadedFile $video, string $outputPath)
    {
        $ffmpeg = FFMpeg::create();
        $videoFile = $ffmpeg->open($video->getRealPath());
        
        $frame = $videoFile->frame(TimeCode::fromSeconds(1));
        $frame->save($outputPath);
        
        return $outputPath;
    }
}
```

**Update MediaGalleryApiController:**
```php
if (str_starts_with($stored['mime'], 'video/')) {
    // Compress video
    $compressed = $this->videoProcessor->compressVideo($file, $tempPath);
    $stored = $this->fileProcessor->store($compressed, "spaces/{$space->slug}/media");
    
    // Generate thumbnail
    $thumbnail = $this->videoProcessor->generateThumbnail($file, $thumbPath);
}
```

**Estimasi Penghematan:**
- Video 30 MB → 5-10 MB (70-80% lebih kecil)

---

### **SOLUSI 3: Database Cleanup & Orphaned Files**

Buat command untuk hapus file yang tidak terpakai:

```php
// app/Console/Commands/CleanupOrphanedFiles.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\MediaGallery;
use App\Models\Countdown;

class CleanupOrphanedFiles extends Command
{
    protected $signature = 'storage:cleanup';
    protected $description = 'Remove orphaned files from storage';

    public function handle()
    {
        $disk = Storage::disk('public');
        $this->info('Scanning for orphaned files...');
        
        // Get all files in storage
        $allFiles = collect($disk->allFiles());
        
        // Get all files referenced in database
        $usedFiles = collect();
        
        // Media Gallery
        $usedFiles = $usedFiles->merge(
            MediaGallery::pluck('file_path')
        );
        
        // Countdowns
        $usedFiles = $usedFiles->merge(
            Countdown::whereNotNull('image')->pluck('image')
        );
        
        // ... tambahkan model lain
        
        // Find orphaned files
        $orphaned = $allFiles->diff($usedFiles->filter());
        
        $this->info("Found {$orphaned->count()} orphaned files");
        
        if ($this->confirm('Delete orphaned files?')) {
            foreach ($orphaned as $file) {
                $disk->delete($file);
                $this->line("Deleted: {$file}");
            }
            
            $this->info('Cleanup completed!');
        }
    }
}
```

**Jadwalkan di `app/Console/Kernel.php`:**
```php
protected function schedule(Schedule $schedule)
{
    // Cleanup setiap minggu
    $schedule->command('storage:cleanup')->weekly();
}
```

---

### **SOLUSI 4: Image Lazy Loading & Progressive Images**

Implementasi lazy loading di frontend untuk menghemat bandwidth:

```tsx
// components/LazyImage.tsx
import { useState, useEffect, useRef } from 'react';

export function LazyImage({ src, alt, className }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <img
            ref={imgRef}
            src={isInView ? src : undefined}
            alt={alt}
            className={className}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
        />
    );
}
```

---

### **SOLUSI 5: Fix Profile Image Upload**

Update `ProfileController.php` untuk menggunakan `UploadedFileProcessor`:

```php
// app/Http/Controllers/ProfileController.php
use App\Services\UploadedFileProcessor;

public function __construct(
    private readonly UploadedFileProcessor $fileProcessor
) {}

public function update(ProfileUpdateRequest $request): RedirectResponse
{
    // ... existing code ...
    
    if ($request->hasFile('profile_image')) {
        // Delete old image
        if ($request->user()->profile_image) {
            Storage::disk('public')->delete($request->user()->profile_image);
        }
        
        // Use UploadedFileProcessor for WebP conversion
        $stored = $this->fileProcessor->store(
            $request->file('profile_image'),
            'profile-images',
            'public'
        );
        
        $request->user()->profile_image = $stored['path'];
    }
    
    // ... existing code ...
}
```

---

### **SOLUSI 6: Implementasi Image Resizing**

Buat multiple sizes untuk setiap gambar:

```php
// app/Services/ImageResizer.php
use Intervention\Image\Facades\Image;

class ImageResizer
{
    public function createThumbnails(string $path, array $sizes = [])
    {
        $disk = Storage::disk('public');
        $image = Image::make($disk->get($path));
        
        $thumbnails = [];
        
        foreach ($sizes as $name => $size) {
            $thumbnail = $image->fit($size['width'], $size['height']);
            
            $thumbPath = $this->getThumbnailPath($path, $name);
            $disk->put($thumbPath, $thumbnail->encode('webp', 80));
            
            $thumbnails[$name] = $thumbPath;
        }
        
        return $thumbnails;
    }
    
    private function getThumbnailPath(string $originalPath, string $size)
    {
        $info = pathinfo($originalPath);
        return "{$info['dirname']}/{$info['filename']}_{$size}.webp";
    }
}
```

**Sizes yang disarankan:**
```php
$sizes = [
    'thumb' => ['width' => 150, 'height' => 150],
    'small' => ['width' => 320, 'height' => 320],
    'medium' => ['width' => 640, 'height' => 640],
    'large' => ['width' => 1024, 'height' => 1024],
];
```

---

## 📊 ESTIMASI PENGHEMATAN

### Skenario: 100 Users Aktif

**Tanpa Optimasi:**
- Media Gallery: 100 users × 50 photos × 3 MB = 15 GB
- Videos: 100 users × 10 videos × 30 MB = 30 GB
- Timeline: 100 users × 30 photos × 2 MB = 6 GB
- **Total: ~51 GB/bulan**

**Dengan Optimasi (Cloudinary + Video Compression):**
- Media Gallery: 100 users × 50 photos × 0.5 MB (WebP) = 2.5 GB
- Videos: 100 users × 10 videos × 8 MB (compressed) = 8 GB
- Timeline: 100 users × 30 photos × 0.4 MB = 1.2 GB
- **Total: ~12 GB/bulan**

**Penghematan: 76% (39 GB)**

---

## 🎯 REKOMENDASI IMPLEMENTASI

### **FASE 1: Quick Wins (1-2 hari)**
1. ✅ Fix Profile Image upload (gunakan UploadedFileProcessor)
2. ✅ Implementasi cleanup command untuk orphaned files
3. ✅ Tambahkan lazy loading di frontend
4. ✅ Reduce video max size dari 30 MB → 15 MB

### **FASE 2: Cloud Storage (3-5 hari)**
1. ✅ Setup Cloudinary account (free tier)
2. ✅ Migrate existing files ke Cloudinary
3. ✅ Update semua controllers untuk upload ke Cloudinary
4. ✅ Test semua fitur upload

### **FASE 3: Video Optimization (5-7 hari)**
1. ✅ Install FFmpeg di server
2. ✅ Implementasi VideoProcessor service
3. ✅ Update MediaGalleryApiController
4. ✅ Generate thumbnails untuk semua video

### **FASE 4: Advanced (Optional)**
1. ✅ Implementasi image resizing (multiple sizes)
2. ✅ Setup CDN (CloudFront/Cloudflare)
3. ✅ Implementasi progressive image loading
4. ✅ Add image optimization monitoring

---

## 💰 ESTIMASI BIAYA

### **Cloudinary (Recommended)**
- **Free Tier**: 25 GB storage + 25 GB bandwidth
- **Paid**: $89/bulan untuk 75 GB storage + 150 GB bandwidth
- **Estimasi**: Free tier cukup untuk 200-300 users

### **AWS S3 + CloudFront**
- **S3**: $0.023/GB = ~Rp 350/GB/bulan
- **CloudFront**: $0.085/GB transfer = ~Rp 1,300/GB
- **Estimasi 50 GB**: ~Rp 82,500/bulan

### **Backblaze B2 (Termurah)**
- **Storage**: $0.005/GB = ~Rp 75/GB/bulan
- **Download**: $0.01/GB = ~Rp 150/GB
- **Estimasi 50 GB**: ~Rp 11,250/bulan

---

## 🔧 KONFIGURASI SERVER

### **Untuk Video Processing (FFmpeg)**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Verify
ffmpeg -version
```

### **PHP Extensions**
```bash
# GD Library (untuk image processing)
sudo apt install php8.2-gd

# Imagick (alternative)
sudo apt install php8.2-imagick
```

### **Nginx Configuration**
```nginx
# Increase upload size
client_max_body_size 50M;

# Enable gzip compression
gzip on;
gzip_types image/jpeg image/png image/webp video/mp4;
```

---

## 📈 MONITORING & MAINTENANCE

### **Storage Usage Monitoring**
```php
// app/Console/Commands/StorageReport.php
public function handle()
{
    $disk = Storage::disk('public');
    $totalSize = 0;
    
    foreach ($disk->allFiles() as $file) {
        $totalSize += $disk->size($file);
    }
    
    $this->info("Total storage: " . $this->formatBytes($totalSize));
    
    // Send alert if > 80% capacity
    if ($totalSize > 0.8 * $this->getMaxStorage()) {
        // Send notification
    }
}
```

### **Scheduled Tasks**
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Weekly cleanup
    $schedule->command('storage:cleanup')->weekly();
    
    // Daily storage report
    $schedule->command('storage:report')->daily();
    
    // Monthly optimization check
    $schedule->command('storage:optimize')->monthly();
}
```

---

## ✅ CHECKLIST IMPLEMENTASI

- [ ] Fix Profile Image upload
- [ ] Implementasi cleanup command
- [ ] Setup Cloudinary account
- [ ] Migrate existing files
- [ ] Update all upload controllers
- [ ] Implementasi video compression
- [ ] Add lazy loading
- [ ] Setup monitoring
- [ ] Configure scheduled tasks
- [ ] Test all features
- [ ] Documentation update

---

## 📞 SUPPORT & RESOURCES

### **Cloudinary**
- Docs: https://cloudinary.com/documentation/laravel_integration
- Free tier: https://cloudinary.com/pricing

### **AWS S3**
- Docs: https://laravel.com/docs/filesystem#s3-driver-configuration
- Pricing: https://aws.amazon.com/s3/pricing/

### **FFmpeg**
- Docs: https://ffmpeg.org/documentation.html
- Laravel FFmpeg: https://github.com/protonemedia/laravel-ffmpeg

---

**Dibuat**: 2025-12-25
**Versi**: 1.0
**Status**: Ready for Implementation
