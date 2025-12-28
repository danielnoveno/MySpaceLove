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
            $table->tinyInteger('active_levels')->default(3)->after('space_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memory_lane_configs', function (Blueprint $table) {
            $table->dropColumn('active_levels');
        });
    }
};
