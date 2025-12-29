<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSurpriseNotesTable extends Migration
{
    public function up()
    {
        Schema::create('surprise_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            $table->index('space_id');
            $table->string('title')->nullable();
            $table->text('message');
            $table->date('unlock_date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('surprise_notes');
    }
}
