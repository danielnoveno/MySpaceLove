<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoveTimelinesTable extends Migration
{
    public function up()
    {
        Schema::create('love_timelines', function (Blueprint $table) {
            $table->id();
            // Start UUID support
            $table->uuid('uuid')->unique();
            
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            
            $table->index('space_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date')->index();
            
            // Legacy singular path (optional to keep if code uses it)
            $table->string('media_path')->nullable();
            
            // New multiple media support
            $table->json('media_paths')->nullable();
            $table->string('thumbnail_path')->nullable();
            
            $table->timestamps();

            $table->index(['space_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('love_timelines');
    }
}
