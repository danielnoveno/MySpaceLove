<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MemoryLaneConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'level_one_image',
        'level_two_image',
        'level_three_image',
        'level_one_title',
        'level_one_body',
        'level_two_title',
        'level_two_body',
        'level_three_title',
        'level_three_body',
        'active_levels',
        'pin',
        'content_set',
    ];

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (MemoryLaneConfig $config): void {
            foreach (['level_one_image', 'level_two_image', 'level_three_image'] as $attribute) {
                $path = $config->getAttribute($attribute);

                if (!empty($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        });
    }
}
