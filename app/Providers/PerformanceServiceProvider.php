<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Throwable;

class PerformanceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only apply optimizations in production
        if (!app()->environment('production')) {
            return;
        }

        // Enable query caching for common queries
        $this->setupQueryCaching();

        // Share cached data with views
        $this->shareCachedDataWithViews();

        // Log slow queries in production
        $this->logSlowQueries();
    }

    /**
     * Setup query caching for frequently accessed data
     */
    protected function setupQueryCaching(): void
    {
        // Cache theme configurations for 24 hours
        View::composer('*', function ($view) {
            try {
                $themes = Cache::remember('app.themes', 86400, function () {
                    return \App\Models\Theme::all();
                });
            } catch (Throwable $e) {
                // Never let optional theme caching take the whole app down on
                // serverless cold starts, missing cache tables, or DB outages.
                $themes = collect();
            }
            
            $view->with('cachedThemes', $themes);
        });
    }

    /**
     * Share cached configuration data with all views
     */
    protected function shareCachedDataWithViews(): void
    {
        // Cache app configuration
        $appConfig = [
            'name' => config('app.name'),
            'locale' => config('app.locale'),
            'available_locales' => config('app.available_locales', ['en', 'id']),
        ];

        try {
            $appConfig = Cache::remember('app.config', 3600, fn () => $appConfig);
        } catch (Throwable $e) {
            // The config is static and safe to share directly if cache storage is
            // unavailable. This avoids HTTP 500s caused only by cache setup.
        }

        View::share('appConfig', $appConfig);
    }

    /**
     * Log slow queries for monitoring
     */
    protected function logSlowQueries(): void
    {
        DB::listen(function ($query) {
            // Log queries that take longer than 1000ms
            if ($query->time > 1000) {
                \Log::warning('Slow query detected', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time,
                ]);
            }
        });
    }
}
