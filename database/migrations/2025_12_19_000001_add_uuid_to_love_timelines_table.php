<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('love_timelines', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id')->unique();
        });

        DB::table('love_timelines')
            ->whereNull('uuid')
            ->lazyById()
            ->each(function ($item) {
                DB::table('love_timelines')
                    ->where('id', $item->id)
                    ->update(['uuid' => Str::uuid()->toString()]);
            });
    }

    public function down(): void
    {
        Schema::table('love_timelines', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
