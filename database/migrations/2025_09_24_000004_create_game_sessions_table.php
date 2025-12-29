<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->string('session_id');
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('current_turn_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('active');
            $table->json('state')->nullable();
            $table->timestamps();

            $table->unique(['game_id', 'space_id', 'session_id']);
            $table->index(['space_id', 'game_id']);
            $table->index('game_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
