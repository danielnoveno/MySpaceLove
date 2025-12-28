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
