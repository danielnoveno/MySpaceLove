<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateThemesTable extends Migration
{
    public function up()
    {
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('primary_color')->default('#498386');
            $table->string('secondary_color')->default('#CFCAB5');
            $table->string('background_color')->default('#FFF7E2');
            $table->string('font_family')->default('Montserrat');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('themes');
    }
}
