<?php

use App\Models\MediaGallery;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('media_galleries', function (Blueprint $table) {
            $table->uuid('collection_key')->nullable()->after('user_id');
            $table->unsignedInteger('collection_index')->default(0)->after('collection_key');
        });

        MediaGallery::query()
            ->orderBy('id')
            ->chunkById(200, function ($items): void {
                foreach ($items as $gallery) {
                    /** @var MediaGallery $gallery */
                    $gallery->forceFill([
                        'collection_key' => (string) Str::uuid(),
                        'collection_index' => 0,
                    ])->saveQuietly();
                }
            });

        Schema::table('media_galleries', function (Blueprint $table) {
            $table->index('collection_key');
            $table->index(['collection_key', 'collection_index']);
        });
    }

    public function down(): void
    {
        Schema::table('media_galleries', function (Blueprint $table) {
            $table->dropIndex('media_galleries_collection_key_collection_index_index');
            $table->dropIndex('media_galleries_collection_key_index');
            $table->dropColumn(['collection_key', 'collection_index']);
        });
    }
};
