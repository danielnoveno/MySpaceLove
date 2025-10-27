<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('auth_provider', 32)
                ->nullable()
                ->after('partner_code');
            $table->string('provider_id', 191)
                ->nullable()
                ->after('auth_provider');
            $table->string('provider_avatar')
                ->nullable()
                ->after('provider_id');

            $table->index('auth_provider');
            $table->unique(['auth_provider', 'provider_id'], 'users_auth_provider_provider_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_auth_provider_provider_id_unique');
            $table->dropIndex('users_auth_provider_index');
            $table->dropColumn(['auth_provider', 'provider_id', 'provider_avatar']);
        });
    }
};
