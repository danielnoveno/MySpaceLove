<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('love_timelines', function (Blueprint $table) {
            $table->json('media_paths')->nullable()->after('date');
        });
    }

    public function down(): void
    {
        Schema::table('love_timelines', function (Blueprint $table) {
            $table->dropColumn('media_paths');
        });
    }
};
