<?php

namespace App\Console\Commands;

use App\Models\Countdown;
use App\Models\Doc;
use App\Models\LoveTimeline;
use App\Models\MediaGallery;
use App\Models\MemoryLaneConfig;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

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
            return ! str_ends_with($file, '.gitignore') &&
                   ! str_starts_with(basename($file), '.');
        });

        $this->info('📁 Total files in storage: '.$allFiles->count());

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
            if ($config->level_one_image) {
                $memoryLaneFiles->push($config->level_one_image);
            }
            if ($config->level_two_image) {
                $memoryLaneFiles->push($config->level_two_image);
            }
            if ($config->level_three_image) {
                $memoryLaneFiles->push($config->level_three_image);
            }
            if ($config->flipbook_cover_image) {
                $memoryLaneFiles->push($config->flipbook_cover_image);
            }

            if ($config->flipbook_pages) {
                foreach ($config->flipbook_pages as $page) {
                    if (! empty($page['image'])) {
                        $memoryLaneFiles->push($page['image']);
                    }
                }
            }
        });
        $usedFiles = $usedFiles->merge($memoryLaneFiles);
        $this->line("  ✓ Memory Lane: {$memoryLaneFiles->count()} files");

        $this->newLine();
        $this->info('📊 Total files in database: '.$usedFiles->filter()->count());

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

        $this->info('💾 Total size: '.$this->formatBytes($totalSize));
        $this->newLine();

        if ($isDryRun) {
            $this->warn('🔍 DRY RUN MODE - No files will be deleted');
            $this->newLine();

            $this->table(
                ['File', 'Size'],
                $orphaned->take(20)->map(function ($file) use ($disk) {
                    return [
                        $file,
                        $this->formatBytes($disk->size($file)),
                    ];
                })
            );

            if ($orphaned->count() > 20) {
                $this->line('... and '.($orphaned->count() - 20).' more files');
            }

            $this->newLine();
            $this->info('💡 Run without --dry-run to actually delete these files');

            return 0;
        }

        if (! $this->confirm('⚠️  Delete these orphaned files?', false)) {
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

        $this->info('✅ Cleanup completed!');
        $this->info("🗑️  Deleted {$deleted} files");
        $this->info('💾 Freed up '.$this->formatBytes($totalSize));

        return 0;
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }
}
