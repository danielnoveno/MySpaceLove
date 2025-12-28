<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('love_journals', function (Blueprint $table) {
            DB::statement("ALTER TABLE love_journals MODIFY COLUMN mood ENUM('happy', 'sad', 'miss', 'excited', 'grateful')");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('love_journals', function (Blueprint $table) {
            DB::statement("ALTER TABLE love_journals MODIFY COLUMN mood ENUM('happy', 'sad', 'miss', 'excited')");
        });
    }
};
