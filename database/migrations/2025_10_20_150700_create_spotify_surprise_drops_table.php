<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spotify_surprise_drops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('spotify_track_id');
            $table->string('track_name');
            $table->string('artists');
            $table->timestamp('scheduled_for');
            $table->text('note')->nullable();
            $table->string('curator_name')->nullable();
            $table->timestamps();

            $table->index(['space_id', 'scheduled_for']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spotify_surprise_drops');
    }
};
