<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('spotify_tokens')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE spotify_tokens MODIFY access_token TEXT');
            DB::statement('ALTER TABLE spotify_tokens MODIFY refresh_token TEXT NULL');
            DB::statement('ALTER TABLE spotify_tokens MODIFY scope TEXT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN access_token TYPE TEXT');
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN refresh_token TYPE TEXT');
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN refresh_token DROP NOT NULL');
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN scope TYPE TEXT');
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('spotify_tokens')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE spotify_tokens MODIFY access_token VARCHAR(255)');
            DB::statement('ALTER TABLE spotify_tokens MODIFY refresh_token VARCHAR(255) NULL');
            DB::statement('ALTER TABLE spotify_tokens MODIFY scope VARCHAR(255) NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN access_token TYPE VARCHAR(255)');
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN refresh_token TYPE VARCHAR(255)');
            DB::statement('ALTER TABLE spotify_tokens ALTER COLUMN scope TYPE VARCHAR(255)');
        }
    }
};
