<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spaces', function (Blueprint $table): void {
            if (!Schema::hasColumn('spaces', 'invite_code')) {
                $table->string('invite_code', 16)->nullable()->unique()->after('slug');
            }
        });

        DB::table('spaces')
            ->whereNull('invite_code')
            ->orderBy('id')
            ->chunkById(100, function ($spaces): void {
                foreach ($spaces as $space) {
                    do {
                        $code = strtoupper(Str::random(8));
                    } while (DB::table('spaces')->where('invite_code', $code)->exists());

                    DB::table('spaces')->where('id', $space->id)->update(['invite_code' => $code]);
                }
            });

        Schema::table('space_invitations', function (Blueprint $table): void {
            if (!Schema::hasColumn('space_invitations', 'kind')) {
                $table->string('kind', 24)->default('email_invite')->after('token')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('space_invitations', function (Blueprint $table): void {
            if (Schema::hasColumn('space_invitations', 'kind')) {
                $table->dropColumn('kind');
            }
        });

        Schema::table('spaces', function (Blueprint $table): void {
            if (Schema::hasColumn('spaces', 'invite_code')) {
                $table->dropUnique(['invite_code']);
                $table->dropColumn('invite_code');
            }
        });
    }
};
