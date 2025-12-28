<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * Clear dashboard cache for a specific space
     */
    public static function clearDashboardCache(int $spaceId): void
    {
        Cache::forget("dashboard.space.{$spaceId}");
    }

    /**
     * Clear user's first space cache
     */
    public static function clearUserSpaceCache(int $userId): void
    {
        Cache::forget("user.{$userId}.first_space");
    }

    /**
     * Clear all space-related caches
     */
    public static function clearSpaceCache(int $spaceId): void
    {
        self::clearDashboardCache($spaceId);
        
        // Clear other space-related caches
        Cache::forget("space.{$spaceId}.stats");
        Cache::forget("space.{$spaceId}.timeline");
        Cache::forget("space.{$spaceId}.gallery");
    }

    /**
     * Clear cache when space data is updated
     */
    public static function onSpaceUpdated(int $spaceId, int $userId): void
    {
        self::clearSpaceCache($spaceId);
        self::clearUserSpaceCache($userId);
    }

    /**
     * Clear cache when timeline is created/updated/deleted
     */
    public static function onTimelineChanged(int $spaceId): void
    {
        self::clearDashboardCache($spaceId);
        Cache::forget("space.{$spaceId}.timeline");
    }

    /**
     * Clear cache when gallery is created/updated/deleted
     */
    public static function onGalleryChanged(int $spaceId): void
    {
        self::clearDashboardCache($spaceId);
        Cache::forget("space.{$spaceId}.gallery");
    }

    /**
     * Clear cache when countdown is created/updated/deleted
     */
    public static function onCountdownChanged(int $spaceId): void
    {
        self::clearDashboardCache($spaceId);
    }

    /**
     * Clear cache when daily message is created/updated/deleted
     */
    public static function onDailyMessageChanged(int $spaceId): void
    {
        self::clearDashboardCache($spaceId);
    }

    /**
     * Warm up cache for a space
     */
    public static function warmUpSpaceCache(int $spaceId): void
    {
        // This can be called after cache clearing to pre-populate cache
        // Implementation depends on your specific needs
    }
}
