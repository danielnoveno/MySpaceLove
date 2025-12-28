<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateGeneratedByEnumOnDailyMessagesTable extends Migration
{
    public function up()
    {
        Schema::table('daily_messages', function (Blueprint $table) {
            $table->enum('generated_by', ['ai', 'manual', 'fallback'])
                ->default('ai')
                ->change();
        });
    }

    public function down()
    {
        DB::table('daily_messages')
            ->where('generated_by', 'fallback')
            ->update(['generated_by' => 'ai']);

        Schema::table('daily_messages', function (Blueprint $table) {
            $table->enum('generated_by', ['ai', 'manual'])
                ->default('ai')
                ->change();
        });
    }
}
