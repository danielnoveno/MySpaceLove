<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('score');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['space_id', 'game_id']);
            $table->index('user_id');
            $table->index('game_id');
            $table->index(['space_id', 'game_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_scores');
    }
};
