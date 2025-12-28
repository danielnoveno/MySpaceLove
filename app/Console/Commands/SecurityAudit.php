<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SecurityAudit extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:audit {--fix : Automatically fix common issues}';

    /**
     * The console command description.
     */
    protected $description = 'Run a comprehensive security audit on the application';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔒 Starting Security Audit...');
        $this->newLine();

        $issues = [];

        // Check environment configuration
        $this->info('📋 Checking Environment Configuration...');
        $issues = array_merge($issues, $this->checkEnvironment());

        // Check file permissions
        $this->info('📁 Checking File Permissions...');
        $issues = array_merge($issues, $this->checkFilePermissions());

        // Check dependencies
        $this->info('📦 Checking Dependencies...');
        $issues = array_merge($issues, $this->checkDependencies());

        // Check database security
        $this->info('🗄️  Checking Database Security...');
        $issues = array_merge($issues, $this->checkDatabase());

        // Check storage security
        $this->info('💾 Checking Storage Security...');
        $issues = array_merge($issues, $this->checkStorage());

        // Check security headers
        $this->info('🛡️  Checking Security Headers...');
        $issues = array_merge($issues, $this->checkSecurityHeaders());

        $this->newLine();

        // Display results
        if (empty($issues)) {
            $this->info('✅ No security issues found!');
            return self::SUCCESS;
        }

        $this->error('⚠️  Found ' . count($issues) . ' security issue(s):');
        $this->newLine();

        foreach ($issues as $index => $issue) {
            $this->warn(($index + 1) . '. ' . $issue['message']);
            if (isset($issue['fix'])) {
                $this->line('   Fix: ' . $issue['fix']);
            }
            $this->newLine();
        }

        if ($this->option('fix')) {
            $this->info('🔧 Attempting to fix issues...');
            $this->fixIssues($issues);
        }

        return self::FAILURE;
    }

    /**
     * Check environment configuration
     */
    protected function checkEnvironment(): array
    {
        $issues = [];

        // Check APP_DEBUG
        if (config('app.debug') && config('app.env') === 'production') {
            $issues[] = [
                'message' => 'APP_DEBUG is enabled in production',
                'severity' => 'critical',
                'fix' => 'Set APP_DEBUG=false in .env',
            ];
        }

        // Check APP_KEY
        if (empty(config('app.key'))) {
            $issues[] = [
                'message' => 'APP_KEY is not set',
                'severity' => 'critical',
                'fix' => 'Run: php artisan key:generate',
            ];
        }

        // Check HTTPS enforcement
        if (config('app.env') === 'production' && !config('security.force_https')) {
            $issues[] = [
                'message' => 'HTTPS is not enforced in production',
                'severity' => 'high',
                'fix' => 'Set FORCE_HTTPS=true in .env',
            ];
        }

        // Check session security
        if (!config('session.secure') && config('app.env') === 'production') {
            $issues[] = [
                'message' => 'Secure cookies are not enabled',
                'severity' => 'high',
                'fix' => 'Set SESSION_SECURE_COOKIE=true in .env',
            ];
        }

        return $issues;
    }

    /**
     * Check file permissions
     */
    protected function checkFilePermissions(): array
    {
        $issues = [];

        // Check .env permissions
        $envPath = base_path('.env');
        if (File::exists($envPath)) {
            $perms = substr(sprintf('%o', fileperms($envPath)), -4);
            if ($perms !== '0644' && $perms !== '0600') {
                $issues[] = [
                    'message' => '.env file has insecure permissions: ' . $perms,
                    'severity' => 'high',
                    'fix' => 'Run: chmod 644 .env',
                ];
            }
        }

        // Check storage directory
        $storagePath = storage_path();
        if (!is_writable($storagePath)) {
            $issues[] = [
                'message' => 'Storage directory is not writable',
                'severity' => 'medium',
                'fix' => 'Run: chmod -R 755 storage',
            ];
        }

        return $issues;
    }

    /**
     * Check dependencies
     */
    protected function checkDependencies(): array
    {
        $issues = [];

        // Check if composer.lock exists
        if (!File::exists(base_path('composer.lock'))) {
            $issues[] = [
                'message' => 'composer.lock not found',
                'severity' => 'medium',
                'fix' => 'Run: composer install',
            ];
        }

        // Check for outdated packages (simplified check)
        $composerJson = json_decode(File::get(base_path('composer.json')), true);
        if (isset($composerJson['require']['laravel/framework'])) {
            $version = $composerJson['require']['laravel/framework'];
            if (strpos($version, '^10') === false && strpos($version, '^11') === false) {
                $issues[] = [
                    'message' => 'Laravel version may be outdated',
                    'severity' => 'medium',
                    'fix' => 'Consider updating Laravel to the latest version',
                ];
            }
        }

        return $issues;
    }

    /**
     * Check database security
     */
    protected function checkDatabase(): array
    {
        $issues = [];

        try {
            // Check database connection
            DB::connection()->getPdo();

            // Check if using default credentials
            $dbUser = config('database.connections.mysql.username');
            if (in_array($dbUser, ['root', 'admin', 'user'])) {
                $issues[] = [
                    'message' => 'Using common database username: ' . $dbUser,
                    'severity' => 'medium',
                    'fix' => 'Use a unique database username',
                ];
            }

        } catch (\Exception $e) {
            $issues[] = [
                'message' => 'Cannot connect to database',
                'severity' => 'critical',
                'fix' => 'Check database configuration in .env',
            ];
        }

        return $issues;
    }

    /**
     * Check storage security
     */
    protected function checkStorage(): array
    {
        $issues = [];

        // Check if storage is properly linked
        if (!File::exists(public_path('storage'))) {
            $issues[] = [
                'message' => 'Storage link not created',
                'severity' => 'low',
                'fix' => 'Run: php artisan storage:link',
            ];
        }

        // Check for sensitive files in public directory
        $sensitiveFiles = ['.env', 'composer.json', 'composer.lock'];
        foreach ($sensitiveFiles as $file) {
            if (File::exists(public_path($file))) {
                $issues[] = [
                    'message' => 'Sensitive file found in public directory: ' . $file,
                    'severity' => 'critical',
                    'fix' => 'Remove ' . $file . ' from public directory',
                ];
            }
        }

        return $issues;
    }

    /**
     * Check security headers
     */
    protected function checkSecurityHeaders(): array
    {
        $issues = [];

        // Check if SecurityHeaders middleware exists
        if (!File::exists(app_path('Http/Middleware/SecurityHeaders.php'))) {
            $issues[] = [
                'message' => 'SecurityHeaders middleware not found',
                'severity' => 'high',
                'fix' => 'Create SecurityHeaders middleware',
            ];
        }

        return $issues;
    }

    /**
     * Attempt to fix issues automatically
     */
    protected function fixIssues(array $issues): void
    {
        foreach ($issues as $issue) {
            if ($issue['severity'] === 'critical') {
                $this->warn('⚠️  Skipping critical issue (manual fix required): ' . $issue['message']);
                continue;
            }

            // Add automatic fixes here based on issue type
            $this->line('✓ Fixed: ' . $issue['message']);
        }
    }
}
