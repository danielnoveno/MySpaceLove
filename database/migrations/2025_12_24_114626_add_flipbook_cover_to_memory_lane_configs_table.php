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
        Schema::table('memory_lane_configs', function (Blueprint $table) {
            $table->string('flipbook_cover_image')->nullable()->after('flipbook_pages');
            $table->string('flipbook_cover_title')->nullable()->after('flipbook_cover_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memory_lane_configs', function (Blueprint $table) {
            $table->dropColumn(['flipbook_cover_image', 'flipbook_cover_title']);
        });
    }
};
