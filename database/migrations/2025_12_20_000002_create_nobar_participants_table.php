<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nobar_participants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('display_name', 120)->nullable();
            $table->boolean('is_host')->default(false);
            $table->boolean('audio_enabled')->default(false);
            $table->boolean('video_enabled')->default(false);
            $table->boolean('screen_sharing')->default(false);
            $table->string('status', 40)->default('online');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['space_id', 'user_id']);
            $table->index(['space_id', 'last_seen_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nobar_participants');
    }
};
