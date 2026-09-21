<?php
/**
 * Vercel PHP Runtime entry point for Laravel.
 * 
 * This file routes all requests through Laravel's public/index.php
 */

/**
 * Vercel serverless functions run from a read-only deployment filesystem.
 * Laravel writes runtime files for logs, sessions, cache and compiled Blade
 * views, so point those paths at /tmp before the framework boots.
 */
if (getenv('VERCEL') || getenv('NOW_REGION')) {
    // Do not print PHP notices/deprecations into HTTP responses in production.
    // PHP 8.5 emits deprecations for some legacy PDO constants used by Laravel's
    // default config, and displaying them breaks the rendered page.
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

    $tmpStoragePath = '/tmp/storage';

    $directories = [
        $tmpStoragePath,
        $tmpStoragePath . '/app',
        $tmpStoragePath . '/app/public',
        $tmpStoragePath . '/app/private',
        $tmpStoragePath . '/framework',
        $tmpStoragePath . '/framework/cache',
        $tmpStoragePath . '/framework/cache/data',
        $tmpStoragePath . '/framework/sessions',
        $tmpStoragePath . '/framework/views',
        $tmpStoragePath . '/logs',
    ];

    foreach ($directories as $directory) {
        if (! is_dir($directory)) {
            mkdir($directory, 0777, true);
        }
    }

    $setDefaultEnv = static function (string $key, string $value): void {
        if (getenv($key) === false && ! array_key_exists($key, $_ENV) && ! array_key_exists($key, $_SERVER)) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    };

    $setDefaultEnv('LARAVEL_STORAGE_PATH', $tmpStoragePath);
    $setDefaultEnv('APP_DEBUG', 'false');
    $setDefaultEnv('VIEW_COMPILED_PATH', $tmpStoragePath . '/framework/views');
    $setDefaultEnv('LOG_CHANNEL', 'stderr');
    $setDefaultEnv('CACHE_STORE', 'array');
    $setDefaultEnv('SESSION_DRIVER', 'cookie');
}

// Laravel application path
$appPath = __DIR__ . '/..';

// Require Laravel's entry point
require $appPath . '/public/index.php';
