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
            $table->string('title')->nullable();
            $table->string('file_path');
            $table->string('type')->nullable(); // image|video|other
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('media_galleries');
    }
}
