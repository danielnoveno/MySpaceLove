<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spotify_capsules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('spotify_track_id');
            $table->string('track_name');
            $table->string('artists');
            $table->string('moment')->nullable();
            $table->text('description')->nullable();
            $table->date('saved_at')->nullable();
            $table->string('preview_url')->nullable();
            $table->timestamps();

            $table->index(['space_id', 'saved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spotify_capsules');
    }
};
