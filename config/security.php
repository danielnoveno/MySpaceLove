<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains all security-related configuration for the application.
    | Adjust these settings based on your security requirements.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Content Security Policy
    |--------------------------------------------------------------------------
    */
    'csp_enabled' => env('CSP_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | HTTPS Enforcement
    |--------------------------------------------------------------------------
    */
    'force_https' => env('FORCE_HTTPS', env('APP_ENV') === 'production'),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limits' => [
        'global' => env('RATE_LIMIT_GLOBAL', 60),
        'api' => env('RATE_LIMIT_API', 100),
        'login' => env('RATE_LIMIT_LOGIN', 5),
        'register' => env('RATE_LIMIT_REGISTER', 3),
        'password_reset' => env('RATE_LIMIT_PASSWORD_RESET', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Security
    |--------------------------------------------------------------------------
    */
    'file_upload' => [
        'max_image_size' => env('MAX_IMAGE_SIZE', 10 * 1024 * 1024), // 10MB
        'max_video_size' => env('MAX_VIDEO_SIZE', 50 * 1024 * 1024), // 50MB
        'allowed_image_types' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'allowed_video_types' => ['mp4', 'mpeg', 'mov', 'avi', 'webm'],
        'scan_uploads' => env('SCAN_UPLOADS', true),
        'strip_exif' => env('STRIP_EXIF', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Security
    |--------------------------------------------------------------------------
    */
    'password' => [
        'min_length' => env('PASSWORD_MIN_LENGTH', 8),
        'require_uppercase' => env('PASSWORD_REQUIRE_UPPERCASE', true),
        'require_lowercase' => env('PASSWORD_REQUIRE_LOWERCASE', true),
        'require_numbers' => env('PASSWORD_REQUIRE_NUMBERS', true),
        'require_special_chars' => env('PASSWORD_REQUIRE_SPECIAL', true),
        'bcrypt_rounds' => env('BCRYPT_ROUNDS', 12),
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    */
    'session' => [
        'secure_cookie' => env('SESSION_SECURE_COOKIE', env('APP_ENV') === 'production'),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'lax'),
        'encrypt' => env('SESSION_ENCRYPT', true),
        'lifetime' => env('SESSION_LIFETIME', 1440), // 24 hours
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Security
    |--------------------------------------------------------------------------
    */
    'auth' => [
        'max_login_attempts' => env('MAX_LOGIN_ATTEMPTS', 5),
        'lockout_duration' => env('LOCKOUT_DURATION', 900), // 15 minutes
        'two_factor_enabled' => env('TWO_FACTOR_ENABLED', false),
        'password_reset_timeout' => env('PASSWORD_RESET_TIMEOUT', 3600), // 1 hour
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Security
    |--------------------------------------------------------------------------
    */
    'ip_security' => [
        'whitelist_enabled' => env('IP_WHITELIST_ENABLED', false),
        'whitelist' => explode(',', env('IP_WHITELIST', '')),
        'blacklist_enabled' => env('IP_BLACKLIST_ENABLED', true),
        'blacklist' => explode(',', env('IP_BLACKLIST', '')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Logging
    |--------------------------------------------------------------------------
    */
    'logging' => [
        'log_failed_logins' => env('LOG_FAILED_LOGINS', true),
        'log_suspicious_activity' => env('LOG_SUSPICIOUS_ACTIVITY', true),
        'log_file_uploads' => env('LOG_FILE_UPLOADS', true),
        'log_api_requests' => env('LOG_API_REQUESTS', false),
        'alert_email' => env('SECURITY_ALERT_EMAIL', env('MAIL_FROM_ADDRESS')),
    ],

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    */
    'cors' => [
        'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['*'],
        'exposed_headers' => [],
        'max_age' => 0,
        'supports_credentials' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Security
    |--------------------------------------------------------------------------
    */
    'database' => [
        'use_prepared_statements' => true,
        'strict_mode' => true,
        'backup_enabled' => env('DB_BACKUP_ENABLED', true),
        'backup_schedule' => env('DB_BACKUP_SCHEDULE', 'daily'),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Security
    |--------------------------------------------------------------------------
    */
    'api' => [
        'token_expiration' => env('API_TOKEN_EXPIRATION', 60), // minutes
        'require_api_key' => env('REQUIRE_API_KEY', false),
        'api_key_header' => env('API_KEY_HEADER', 'X-API-Key'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Intrusion Detection
    |--------------------------------------------------------------------------
    */
    'intrusion_detection' => [
        'enabled' => env('INTRUSION_DETECTION_ENABLED', true),
        'block_suspicious_requests' => env('BLOCK_SUSPICIOUS_REQUESTS', true),
        'alert_on_detection' => env('ALERT_ON_DETECTION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode
    |--------------------------------------------------------------------------
    */
    'maintenance' => [
        'allowed_ips' => explode(',', env('MAINTENANCE_ALLOWED_IPS', '')),
        'secret' => env('MAINTENANCE_SECRET'),
    ],

];
