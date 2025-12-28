<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nobar_signaling_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 30);
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['space_id', 'id']);
            $table->index(['space_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nobar_signaling_messages');
    }
};
