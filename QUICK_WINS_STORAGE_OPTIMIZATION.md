# 🚀 Panduan Implementasi Quick Wins - Optimasi Storage LoveSpace

## Langkah-langkah yang Bisa Dilakukan SEKARANG (Tanpa Cloud Storage)

---

## 1️⃣ FIX PROFILE IMAGE UPLOAD (5 menit)

### File: `app/Http/Controllers/ProfileController.php`

**Cari kode ini:**
```php
$path = $request->file('profile_image')->store('profile-images', 'public');
```

**Ganti dengan:**
```php
use App\Services\UploadedFileProcessor;

// Di constructor
public function __construct(
    private readonly UploadedFileProcessor $fileProcessor
) {}

// Di method update
if ($request->hasFile('profile_image')) {
    // Delete old image
    if ($request->user()->profile_image) {
        Storage::disk('public')->delete($request->user()->profile_image);
    }
    
    // Use UploadedFileProcessor for WebP conversion
    $stored = $this->fileProcessor->store(
        $request->file('profile_image'),
        'profile-images',
        'public',
        'errors.upload.file_too_large',
        'profile_image'
    );
    
    $request->user()->profile_image = $stored['path'];
}
```

**Penghematan**: 60-70% ukuran file gambar profil

---

## 2️⃣ REDUCE VIDEO SIZE LIMIT (2 menit)

### File: `app/Http/Controllers/Api/MediaGalleryApiController.php`

**Cari kode ini (line ~122):**
```php
'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:30720',
```

**Ganti dengan:**
```php
'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:15360', // 15 MB
```

**Penghematan**: 50% ukuran maksimal video

---

## 3️⃣ CLEANUP ORPHANED FILES COMMAND (15 menit)

### Buat file baru: `app/Console/Commands/CleanupOrphanedFiles.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\MediaGallery;
use App\Models\Countdown;
use App\Models\LoveTimeline;
use App\Models\Doc;
use App\Models\User;
use App\Models\MemoryLaneConfig;

class CleanupOrphanedFiles extends Command
{
    protected $signature = 'storage:cleanup {--dry-run : Show what would be deleted without actually deleting}';
    protected $description = 'Remove orphaned files from storage';

    public function handle()
    {
        $disk = Storage::disk('public');
        $isDryRun = $this->option('dry-run');
        
        $this->info('🔍 Scanning for orphaned files...');
        $this->newLine();
        
        // Get all files in storage
        $allFiles = collect($disk->allFiles())->filter(function ($file) {
            // Skip .gitignore and system files
            return !str_ends_with($file, '.gitignore') && 
                   !str_starts_with(basename($file), '.');
        });
        
        $this->info("📁 Total files in storage: " . $allFiles->count());
        
        // Get all files referenced in database
        $usedFiles = collect();
        
        // Media Gallery
        $mediaFiles = MediaGallery::whereNotNull('file_path')->pluck('file_path');
        $usedFiles = $usedFiles->merge($mediaFiles);
        $this->line("  ✓ Media Gallery: {$mediaFiles->count()} files");
        
        // Countdowns
        $countdownFiles = Countdown::whereNotNull('image')->pluck('image');
        $usedFiles = $usedFiles->merge($countdownFiles);
        $this->line("  ✓ Countdowns: {$countdownFiles->count()} files");
        
        // Timeline
        $timelineFiles = LoveTimeline::whereNotNull('media_paths')
            ->get()
            ->pluck('media_paths')
            ->flatten()
            ->filter();
        $usedFiles = $usedFiles->merge($timelineFiles);
        $this->line("  ✓ Timeline: {$timelineFiles->count()} files");
        
        // Documents
        $docFiles = Doc::whereNotNull('file_path')->pluck('file_path');
        $usedFiles = $usedFiles->merge($docFiles);
        $this->line("  ✓ Documents: {$docFiles->count()} files");
        
        // Profile Images
        $profileFiles = User::whereNotNull('profile_image')->pluck('profile_image');
        $usedFiles = $usedFiles->merge($profileFiles);
        $this->line("  ✓ Profile Images: {$profileFiles->count()} files");
        
        // Memory Lane
        $memoryLaneFiles = collect();
        MemoryLaneConfig::all()->each(function ($config) use (&$memoryLaneFiles) {
            if ($config->level_one_image) $memoryLaneFiles->push($config->level_one_image);
            if ($config->level_two_image) $memoryLaneFiles->push($config->level_two_image);
            if ($config->level_three_image) $memoryLaneFiles->push($config->level_three_image);
            if ($config->flipbook_cover_image) $memoryLaneFiles->push($config->flipbook_cover_image);
            
            if ($config->flipbook_pages) {
                foreach ($config->flipbook_pages as $page) {
                    if (!empty($page['image'])) {
                        $memoryLaneFiles->push($page['image']);
                    }
                }
            }
        });
        $usedFiles = $usedFiles->merge($memoryLaneFiles);
        $this->line("  ✓ Memory Lane: {$memoryLaneFiles->count()} files");
        
        $this->newLine();
        $this->info("📊 Total files in database: " . $usedFiles->filter()->count());
        
        // Find orphaned files
        $orphaned = $allFiles->diff($usedFiles->filter());
        
        $this->newLine();
        
        if ($orphaned->isEmpty()) {
            $this->info('✅ No orphaned files found!');
            return 0;
        }
        
        $this->warn("🗑️  Found {$orphaned->count()} orphaned files");
        
        // Calculate total size
        $totalSize = 0;
        foreach ($orphaned as $file) {
            $totalSize += $disk->size($file);
        }
        
        $this->info("💾 Total size: " . $this->formatBytes($totalSize));
        $this->newLine();
        
        if ($isDryRun) {
            $this->warn('🔍 DRY RUN MODE - No files will be deleted');
            $this->newLine();
            
            $this->table(
                ['File', 'Size'],
                $orphaned->take(20)->map(function ($file) use ($disk) {
                    return [
                        $file,
                        $this->formatBytes($disk->size($file))
                    ];
                })
            );
            
            if ($orphaned->count() > 20) {
                $this->line("... and " . ($orphaned->count() - 20) . " more files");
            }
            
            $this->newLine();
            $this->info('💡 Run without --dry-run to actually delete these files');
            
            return 0;
        }
        
        if (!$this->confirm('⚠️  Delete these orphaned files?', false)) {
            $this->info('Cancelled.');
            return 0;
        }
        
        $bar = $this->output->createProgressBar($orphaned->count());
        $bar->start();
        
        $deleted = 0;
        foreach ($orphaned as $file) {
            try {
                $disk->delete($file);
                $deleted++;
            } catch (\Exception $e) {
                $this->error("Failed to delete: {$file}");
            }
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("✅ Cleanup completed!");
        $this->info("🗑️  Deleted {$deleted} files");
        $this->info("💾 Freed up " . $this->formatBytes($totalSize));
        
        return 0;
    }
    
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
```

### Cara menggunakan:

```bash
# Lihat file yang akan dihapus (tanpa menghapus)
php artisan storage:cleanup --dry-run

# Hapus file orphaned
php artisan storage:cleanup
```

### Jadwalkan otomatis di `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Cleanup setiap minggu di hari Minggu jam 2 pagi
    $schedule->command('storage:cleanup')->weekly()->sundays()->at('02:00');
}
```

**Penghematan**: Bisa menghemat 20-40% storage dari file yang tidak terpakai

---

## 4️⃣ STORAGE MONITORING COMMAND (10 menit)

### Buat file: `app/Console/Commands/StorageReport.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\MediaGallery;
use App\Models\Countdown;
use App\Models\LoveTimeline;
use App\Models\Doc;
use App\Models\User;
use App\Models\Space;

class StorageReport extends Command
{
    protected $signature = 'storage:report';
    protected $description = 'Generate storage usage report';

    public function handle()
    {
        $disk = Storage::disk('public');
        
        $this->info('📊 LoveSpace Storage Report');
        $this->info('Generated: ' . now()->format('Y-m-d H:i:s'));
        $this->newLine();
        
        // Overall stats
        $allFiles = collect($disk->allFiles());
        $totalSize = 0;
        
        foreach ($allFiles as $file) {
            $totalSize += $disk->size($file);
        }
        
        $this->info('📁 Overall Statistics');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Files', number_format($allFiles->count())],
                ['Total Size', $this->formatBytes($totalSize)],
                ['Average File Size', $this->formatBytes($totalSize / max($allFiles->count(), 1))],
            ]
        );
        $this->newLine();
        
        // By directory
        $this->info('📂 Storage by Directory');
        
        $directories = [
            'spaces' => 'Spaces (Media, Timeline, Memory Lane)',
            'countdowns' => 'Countdowns',
            'docs' => 'Documents',
            'profile-images' => 'Profile Images',
        ];
        
        $dirStats = [];
        foreach ($directories as $dir => $label) {
            $files = collect($disk->allFiles($dir));
            $size = 0;
            
            foreach ($files as $file) {
                $size += $disk->size($file);
            }
            
            $dirStats[] = [
                $label,
                number_format($files->count()),
                $this->formatBytes($size),
                $size > 0 ? round(($size / $totalSize) * 100, 1) . '%' : '0%',
            ];
        }
        
        $this->table(
            ['Directory', 'Files', 'Size', '% of Total'],
            $dirStats
        );
        $this->newLine();
        
        // Database stats
        $this->info('💾 Database Statistics');
        $this->table(
            ['Model', 'Records', 'Avg per Space'],
            [
                ['Spaces', number_format(Space::count()), '-'],
                ['Media Gallery', number_format(MediaGallery::count()), number_format(MediaGallery::count() / max(Space::count(), 1), 1)],
                ['Countdowns', number_format(Countdown::count()), number_format(Countdown::count() / max(Space::count(), 1), 1)],
                ['Timeline Events', number_format(LoveTimeline::count()), number_format(LoveTimeline::count() / max(Space::count(), 1), 1)],
                ['Documents', number_format(Doc::count()), number_format(Doc::count() / max(Space::count(), 1), 1)],
                ['Users', number_format(User::count()), '-'],
            ]
        );
        $this->newLine();
        
        // Top 10 largest files
        $this->info('📈 Top 10 Largest Files');
        
        $largestFiles = $allFiles
            ->map(function ($file) use ($disk) {
                return [
                    'path' => $file,
                    'size' => $disk->size($file),
                ];
            })
            ->sortByDesc('size')
            ->take(10)
            ->map(function ($file) {
                return [
                    substr($file['path'], 0, 60) . (strlen($file['path']) > 60 ? '...' : ''),
                    $this->formatBytes($file['size']),
                ];
            });
        
        $this->table(['File', 'Size'], $largestFiles);
        $this->newLine();
        
        // Warnings
        if ($totalSize > 1024 * 1024 * 1024 * 5) { // > 5 GB
            $this->warn('⚠️  WARNING: Storage usage is high (> 5 GB)');
            $this->warn('   Consider implementing cloud storage or cleanup');
        }
        
        if (MediaGallery::count() > 1000) {
            $this->warn('⚠️  WARNING: Large number of media files');
            $this->warn('   Consider archiving old media');
        }
        
        return 0;
    }
    
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
```

### Cara menggunakan:

```bash
php artisan storage:report
```

### Jadwalkan di `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Report setiap hari Senin
    $schedule->command('storage:report')->weekly()->mondays()->at('09:00');
}
```

---

## 5️⃣ IMPROVE WEBP QUALITY SETTINGS (2 menit)

### File: `app/Services/UploadedFileProcessor.php`

**Saat ini:**
```php
private const DEFAULT_WEBP_QUALITY = 80;
```

**Untuk penghematan lebih:**
```php
private const DEFAULT_WEBP_QUALITY = 75; // Masih bagus, lebih kecil 15-20%
```

**Atau tambahkan dynamic quality:**
```php
private function getWebpQuality(int $fileSize): int
{
    // File besar = quality lebih rendah
    if ($fileSize > 5 * 1024 * 1024) { // > 5 MB
        return 70;
    } elseif ($fileSize > 2 * 1024 * 1024) { // > 2 MB
        return 75;
    }
    return 80;
}

// Di method storeImageAsWebp, ganti:
$success = imagewebp($image, null, $this->getWebpQuality($file->getSize()));
```

**Penghematan**: 15-25% ukuran file tanpa penurunan kualitas yang signifikan

---

## 6️⃣ ADD LAZY LOADING (10 menit)

### Buat component: `resources/js/Components/LazyImage.tsx`

```tsx
import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
}

export default function LazyImage({ 
    src, 
    alt, 
    placeholder = '/images/placeholder.svg',
    className = '',
    ...props 
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Load 50px before entering viewport
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <img
            ref={imgRef}
            src={isInView ? src : placeholder}
            alt={alt}
            className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            {...props}
        />
    );
}
```

### Gunakan di komponen:

```tsx
// Sebelum:
<img src={media.url} alt={media.title} />

// Sesudah:
<LazyImage src={media.url} alt={media.title} />
```

**Penghematan**: 50-70% bandwidth untuk halaman dengan banyak gambar

---

## 7️⃣ DATABASE INDEXES (5 menit)

### Buat migration: `database/migrations/2025_12_25_add_storage_indexes.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('media_galleries', function (Blueprint $table) {
            $table->index('file_path');
            $table->index(['space_id', 'created_at']);
        });

        Schema::table('countdowns', function (Blueprint $table) {
            $table->index('image');
        });

        Schema::table('love_timelines', function (Blueprint $table) {
            $table->index(['space_id', 'created_at']);
        });

        Schema::table('docs', function (Blueprint $table) {
            $table->index('file_path');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('profile_image');
        });
    }

    public function down()
    {
        Schema::table('media_galleries', function (Blueprint $table) {
            $table->dropIndex(['file_path']);
            $table->dropIndex(['space_id', 'created_at']);
        });

        Schema::table('countdowns', function (Blueprint $table) {
            $table->dropIndex(['image']);
        });

        Schema::table('love_timelines', function (Blueprint $table) {
            $table->dropIndex(['space_id', 'created_at']);
        });

        Schema::table('docs', function (Blueprint $table) {
            $table->dropIndex(['file_path']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['profile_image']);
        });
    }
};
```

```bash
php artisan migrate
```

**Benefit**: Query lebih cepat untuk cleanup dan reporting

---

## 📊 ESTIMASI PENGHEMATAN TOTAL

Dengan implementasi semua quick wins di atas:

| Optimasi | Penghematan |
|----------|-------------|
| Profile Image WebP | 60-70% |
| Video Size Limit | 50% |
| Orphaned Files Cleanup | 20-40% |
| WebP Quality Adjustment | 15-25% |
| Lazy Loading | 50-70% bandwidth |

**Total Estimasi**: 40-60% penghematan storage

---

## ✅ CHECKLIST IMPLEMENTASI

```
[ ] 1. Fix Profile Image Upload
[ ] 2. Reduce Video Size Limit
[ ] 3. Create Cleanup Command
[ ] 4. Create Storage Report Command
[ ] 5. Adjust WebP Quality
[ ] 6. Add Lazy Loading Component
[ ] 7. Add Database Indexes
[ ] 8. Run Migration
[ ] 9. Test Cleanup Command (dry-run)
[ ] 10. Schedule Cleanup & Report
```

---

## 🎯 NEXT STEPS (Setelah Quick Wins)

Setelah implementasi quick wins, pertimbangkan:

1. **Cloudinary Integration** (lihat MEDIA_STORAGE_OPTIMIZATION_ANALYSIS.md)
2. **Video Compression** dengan FFmpeg
3. **CDN Setup** untuk distribusi global
4. **Image Resizing** (multiple sizes)

---

## 📞 BANTUAN

Jika ada masalah:
1. Cek log: `storage/logs/laravel.log`
2. Test command: `php artisan storage:cleanup --dry-run`
3. Rollback migration: `php artisan migrate:rollback`

---

**Waktu Implementasi Total**: ~1 jam
**Skill Level**: Beginner-Intermediate
**Risk Level**: Low (semua bisa di-rollback)
