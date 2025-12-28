<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('love_timelines', function (Blueprint $table) {
            $table->string('thumbnail_path')->nullable()->after('media_paths');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('love_timelines', function (Blueprint $table) {
            $table->dropColumn('thumbnail_path');
        });
    }
};
