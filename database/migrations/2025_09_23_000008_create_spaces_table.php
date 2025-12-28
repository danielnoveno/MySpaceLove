<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSpacesTable extends Migration
{
    public function up()
    {
        Schema::create('spaces', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->foreignId('user_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_two_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_public')->default(false);
            $table->foreignId('theme_id')->nullable()->constrained('themes')->nullOnDelete();
            $table->text('bio')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('spaces');
    }
}
