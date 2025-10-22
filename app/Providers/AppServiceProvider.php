<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (
            !$this->app->runningInConsole()
            && config('session.driver') === 'database'
            && !Schema::hasTable(config('session.table', 'sessions'))
        ) {
            config(['session.driver' => 'file']);
        }

        Vite::prefetch(concurrency: 3);
    }
}
