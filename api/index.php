<?php
/**
 * Vercel PHP Runtime entry point for Laravel.
 * 
 * This file routes all requests through Laravel's public/index.php
 */

$appPath = __DIR__ . '/..';

// Serve built/static assets from the PHP lambda. The Vercel PHP builder does
// not reliably expose Vite's public/build output as static files, but the files
// are present in the function bundle after the build scripts run.
// Vercel's PHP runtime invokes this file under /api and can otherwise expose
// rewritten requests to Laravel with the leading path segment stripped (for
// example /api/spaces/... becomes /spaces/...). Preserve the original public URL
// path via vercel.json's __path query parameter before Laravel captures the
// request.
if (isset($_GET['__path'])) {
    $originalPath = '/' . ltrim((string) $_GET['__path'], '/');
    $queryParams = $_GET;
    unset($queryParams['__path']);

    $queryString = http_build_query($queryParams);
    $_SERVER['REQUEST_URI'] = $originalPath . ($queryString !== '' ? '?' . $queryString : '');
    $_SERVER['QUERY_STRING'] = $queryString;
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    $_SERVER['PHP_SELF'] = '/index.php';
    $_SERVER['SCRIPT_FILENAME'] = $appPath . '/public/index.php';
    unset($_GET['__path']);
}

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$staticPrefixes = ['/build/', '/css/', '/js/', '/images/', '/fonts/', '/storage/'];
$staticFiles = ['/favicon.ico', '/favicon.svg', '/robots.txt'];

$isStaticRequest = in_array($requestPath, $staticFiles, true);

foreach ($staticPrefixes as $prefix) {
    if (str_starts_with($requestPath, $prefix)) {
        $isStaticRequest = true;
        break;
    }
}

if ($isStaticRequest) {
    $publicPath = realpath($appPath . '/public');
    $filePath = realpath($appPath . '/public' . $requestPath);

    if ($publicPath && $filePath && str_starts_with($filePath, $publicPath) && is_file($filePath)) {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'css' => 'text/css; charset=UTF-8',
            'js' => 'application/javascript; charset=UTF-8',
            'mjs' => 'application/javascript; charset=UTF-8',
            'json' => 'application/json; charset=UTF-8',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'txt' => 'text/plain; charset=UTF-8',
        ];

        header('Content-Type: ' . ($mimeTypes[$extension] ?? 'application/octet-stream'));
        header('Cache-Control: public, max-age=31536000, immutable');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    http_response_code(404);
    echo 'Not Found';
    exit;
}

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

    $forceEnv = static function (string $key, string $value): void {
        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    };

    $setDefaultEnv('LARAVEL_STORAGE_PATH', $tmpStoragePath);
    $setDefaultEnv('APP_DEBUG', 'false');
    $setDefaultEnv('VIEW_COMPILED_PATH', $tmpStoragePath . '/framework/views');
    if (! empty($_SERVER['HTTP_HOST'])) {
        $forceEnv('APP_URL', 'https://' . $_SERVER['HTTP_HOST']);
    }
    $forceEnv('LOG_CHANNEL', 'stderr');
    $forceEnv('CACHE_STORE', 'array');
    $forceEnv('SESSION_DRIVER', 'cookie');
}

// Require Laravel's entry point
try {
    require $appPath . '/public/index.php';
} catch (Throwable $e) {
    file_put_contents('php://stderr', sprintf(
        "Laravel bootstrap failed: %s in %s:%d\n%s\n",
        $e->getMessage(),
        $e->getFile(),
        $e->getLine(),
        $e->getTraceAsString()
    ));

    http_response_code(500);
    exit;
}
