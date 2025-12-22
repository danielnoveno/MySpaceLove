<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 30)->default('text');
            $table->text('body')->nullable();
            $table->json('meta_json')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['space_id', 'created_at']);
            $table->index(['space_id', 'sender_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
