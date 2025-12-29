<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMediaGalleriesTable extends Migration
{
    public function up()
    {
        Schema::create('media_galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            $table->index('space_id');
            $table->string('title')->nullable();
            $table->string('file_path')->index();
            $table->string('type')->nullable(); // image|video|other
            $table->uuid('collection_key')->nullable()->index();
            $table->unsignedInteger('collection_index')->default(0);
            $table->index(['collection_key', 'collection_index']);
            $table->timestamps();
            
            $table->index(['space_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('media_galleries');
    }
}
