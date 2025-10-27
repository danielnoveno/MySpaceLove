<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('memory_lane_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->unique()->constrained('spaces')->cascadeOnDelete();
            $table->string('level_one_image')->nullable();
            $table->string('level_two_image')->nullable();
            $table->string('level_three_image')->nullable();
            $table->string('level_one_title')->nullable();
            $table->text('level_one_body')->nullable();
            $table->string('level_two_title')->nullable();
            $table->text('level_two_body')->nullable();
            $table->string('level_three_title')->nullable();
            $table->text('level_three_body')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memory_lane_configs');
    }
};
