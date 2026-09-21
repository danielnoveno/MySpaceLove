<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_locations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('category', 50)->default('other');
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->date('saved_at')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->index(['space_id', 'category']);
            $table->index(['space_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_locations');
    }
};
