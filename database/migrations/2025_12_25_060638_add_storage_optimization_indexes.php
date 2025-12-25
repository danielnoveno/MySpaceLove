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
        // Add indexes for media_galleries
        if (Schema::hasTable('media_galleries')) {
            Schema::table('media_galleries', function (Blueprint $table) {
                try {
                    $table->index('file_path');
                } catch (\Exception $e) {
                    // Index already exists
                }
                try {
                    $table->index(['space_id', 'created_at']);
                } catch (\Exception $e) {
                    // Index already exists
                }
            });
        }

        // Add index for countdowns
        if (Schema::hasTable('countdowns')) {
            Schema::table('countdowns', function (Blueprint $table) {
                try {
                    $table->index('image');
                } catch (\Exception $e) {
                    // Index already exists
                }
            });
        }

        // Add index for love_timelines
        if (Schema::hasTable('love_timelines')) {
            Schema::table('love_timelines', function (Blueprint $table) {
                try {
                    $table->index(['space_id', 'created_at']);
                } catch (\Exception $e) {
                    // Index already exists
                }
            });
        }

        // Add index for docs
        if (Schema::hasTable('docs')) {
            Schema::table('docs', function (Blueprint $table) {
                try {
                    $table->index('file_path');
                } catch (\Exception $e) {
                    // Index already exists
                }
            });
        }

        // Add index for users
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                try {
                    $table->index('profile_image');
                } catch (\Exception $e) {
                    // Index already exists
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('media_galleries')) {
            Schema::table('media_galleries', function (Blueprint $table) {
                try {
                    $table->dropIndex(['file_path']);
                    $table->dropIndex(['space_id', 'created_at']);
                } catch (\Exception $e) {
                    // Index doesn't exist
                }
            });
        }

        if (Schema::hasTable('countdowns')) {
            Schema::table('countdowns', function (Blueprint $table) {
                try {
                    $table->dropIndex(['image']);
                } catch (\Exception $e) {
                    // Index doesn't exist
                }
            });
        }

        if (Schema::hasTable('love_timelines')) {
            Schema::table('love_timelines', function (Blueprint $table) {
                try {
                    $table->dropIndex(['space_id', 'created_at']);
                } catch (\Exception $e) {
                    // Index doesn't exist
                }
            });
        }

        if (Schema::hasTable('docs')) {
            Schema::table('docs', function (Blueprint $table) {
                try {
                    $table->dropIndex(['file_path']);
                } catch (\Exception $e) {
                    // Index doesn't exist
                }
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                try {
                    $table->dropIndex(['profile_image']);
                } catch (\Exception $e) {
                    // Index doesn't exist
                }
            });
        }
    }
};
