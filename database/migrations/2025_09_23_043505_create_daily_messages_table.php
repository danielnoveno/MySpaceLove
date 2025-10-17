<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDailyMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('daily_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            $table->date('date');
            $table->text('message');
            $table->enum('generated_by', ['ai', 'manual'])->default('ai');
            $table->timestamps();
            $table->unique(['space_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('daily_messages');
    }
}
