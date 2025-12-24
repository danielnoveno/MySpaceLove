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
            // Store custom rewards as JSON (array of reward objects)
            $table->json('custom_rewards')->nullable()->after('active_levels');
            
            // Store flipbook pages as JSON (array of page objects with title, body, image)
            $table->json('flipbook_pages')->nullable()->after('custom_rewards');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memory_lane_configs', function (Blueprint $table) {
            $table->dropColumn(['custom_rewards', 'flipbook_pages']);
        });
    }
};
