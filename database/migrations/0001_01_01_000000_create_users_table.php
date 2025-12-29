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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
             $table->string('profile_image')->nullable()->index();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('tour_completed_at')->nullable();
            $table->string('password');
            $table->string('username')->unique();
            $table->string('partner_code')->nullable(); // untuk pasangan unik
            
            // Google / Social Auth fields
            $table->string('auth_provider', 32)->nullable()->index();
            $table->string('provider_id', 191)->nullable();
            $table->string('provider_avatar')->nullable();
            $table->unique(['auth_provider', 'provider_id'], 'users_auth_provider_provider_id_unique');
            
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
