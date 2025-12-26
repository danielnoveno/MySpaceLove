<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\URL;
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


        $appUrl = config('app.url');

        if ($appUrl) {
            $scheme = parse_url($appUrl, PHP_URL_SCHEME);
            if ($scheme === 'https') {
                URL::forceScheme('https');
                config(['session.secure' => true]);
            }

            $host = parse_url($appUrl, PHP_URL_HOST);
            if ($host && !config('session.domain')) {
                $isIpAddress = filter_var($host, FILTER_VALIDATE_IP) !== false;
                $isLocalhost = $host === 'localhost';

                if (! $isIpAddress && ! $isLocalhost) {
                    config(['session.domain' => '.' . ltrim($host, '.')]);
                }
            }
        }

        Vite::prefetch(concurrency: 3);
    }
}
