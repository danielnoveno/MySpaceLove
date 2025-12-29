<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCountdownsTable extends Migration
{
    public function up()
    {
        Schema::create('countdowns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            $table->string('event_name');
            $table->date('event_date');
            $table->text('description')->nullable();
            $table->string('image')->nullable()->index();
            $table->json('activities')->nullable();
            $table->timestamps();

            $table->index(['space_id', 'event_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('countdowns');
    }
}
