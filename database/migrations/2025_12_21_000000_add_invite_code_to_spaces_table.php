<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            $table->string('invite_code', 16)->unique()->after('slug');
        });

        // Add source column to space_invitations to distinguish email vs join_request
        Schema::table('space_invitations', function (Blueprint $table) {
            $table->string('source', 20)->default('email')->after('status');
        });

        // Populate existing spaces with invite codes
        $spaces = DB::table('spaces')->get();
        foreach ($spaces as $space) {
            do {
                $code = strtoupper(Str::random(8));
            } while (DB::table('spaces')->where('invite_code', $code)->exists());

            DB::table('spaces')
                ->where('id', $space->id)
                ->update(['invite_code' => $code]);
        }
    }

    public function down(): void
    {
        Schema::table('space_invitations', function (Blueprint $table) {
            $table->dropColumn('source');
        });

        Schema::table('spaces', function (Blueprint $table) {
            $table->dropColumn('invite_code');
        });
    }
};
