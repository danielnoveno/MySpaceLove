<?php

namespace App\Providers;

use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Database\Events\TransactionRolledBack;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

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
        // Log slow database queries (lebih dari 1 detik)
        DB::listen(function ($query) {
            if ($query->time > 1000) {
                Log::warning('Slow Database Query', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms',
                ]);
            }
        });

        // Log semua database queries (hanya di local/staging untuk debugging)
        if (config('app.debug') && config('app.log_queries', false)) {
            DB::listen(function ($query) {
                Log::info('Database Query', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms',
                ]);
            });
        }


        // Log committed database transactions
        Event::listen(TransactionCommitted::class, function (TransactionCommitted $event) {
            if (config('app.debug')) {
                Log::debug('Database transaction committed', [
                    'connection' => $event->connectionName,
                ]);
            }
        });

        // Log rolled back database transactions
        Event::listen(TransactionRolledBack::class, function (TransactionRolledBack $event) {
            Log::warning('Database transaction rolled back', [
                'connection' => $event->connectionName,
                'url' => request()->fullUrl(),
                'user_id' => auth()->id() ?? 'guest',
            ]);
        });
    }
}
