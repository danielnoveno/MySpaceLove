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
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->text('message');
            $table->enum('generated_by', ['ai', 'manual', 'fallback'])->default('ai');
            $table->timestamps();
            
            // Unique constraint for each user in a space per day
            $table->unique(['space_id', 'user_id', 'date']);
            
            // Performance index for querying all messages in a space by date
            $table->index(['space_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('daily_messages');
    }
}
